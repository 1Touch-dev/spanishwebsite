'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMatchDetail } from '@/store/features/matchDetailSlice';
import { MatchScoreHeader } from './MatchScoreHeader';
import { MatchEventTimeline } from './MatchEventTimeline';
import { MatchLineups } from './MatchLineups';
import { MatchStatsSection } from './MatchStatsSection';
import { MatchH2H } from './MatchH2H';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Tabs } from '@/components/ui/Tabs';
import { defaultMatchDetailTab, isUpcomingFixture } from '@/lib/match-status';
type Tab = 'events' | 'lineups' | 'stats' | 'h2h';

interface MatchDetailClientProps {
  matchId: string;
}

export function MatchDetailClient({ matchId }: MatchDetailClientProps) {
  const dispatch = useAppDispatch();
  const t = useTranslations('detail');
  const tStates = useTranslations('states');
  const { detail, status, error } = useAppSelector((s) => s.matchDetail);
  const [tab, setTab] = useState<Tab>('h2h');
  const [tabInitialized, setTabInitialized] = useState(false);

  useEffect(() => {
    setTabInitialized(false);
    void dispatch(fetchMatchDetail(matchId));
  }, [matchId, dispatch]);

  const fixture = detail?.fixture;

  useEffect(() => {
    if (fixture && !tabInitialized) {
      setTab(defaultMatchDetailTab(fixture));
      setTabInitialized(true);
    }
  }, [fixture, tabInitialized]);

  const tabs = useMemo(
    () => [
      {
        key: 'events' as Tab,
        label: t('tabEvents'),
        count: detail?.events.length,
      },
      {
        key: 'lineups' as Tab,
        label: t('tabLineups'),
        count: detail?.lineups.length,
      },
      {
        key: 'stats' as Tab,
        label: t('tabStats'),
        count: detail?.stats && detail.stats.length >= 2 ? 1 : 0,
      },
      { key: 'h2h' as Tab, label: t('tabH2H'), count: detail?.h2h.length },
    ],
    [t, detail],
  );

  if (status === 'loading') {
    return (
      <div className="container-fh max-w-4xl space-y-3 py-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (status === 'failed' || !fixture) {
    return (
      <div className="container-fh py-6">
        <ErrorState
          title={tStates('errorTitle')}
          message={error ?? t('matchNotFound')}
          retryLabel={tStates('retry')}
          onRetry={() => void dispatch(fetchMatchDetail(matchId))}
        />
      </div>
    );
  }

  const homeTeamId = fixture.teams.home.id;
  const upcoming = isUpcomingFixture(fixture);

  return (
    <div className="container-fh max-w-4xl py-6">
      <MatchScoreHeader match={fixture} />

      {upcoming ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-800">
          {t('tryFinishedMatch')}
        </p>
      ) : null}

      <div className="mt-6">
        <Tabs
          items={tabs.map((item) => ({
            id: item.key,
            label:
              item.count != null && item.count > 0
                ? `${item.label} (${item.count})`
                : item.label,
          }))}
          activeId={tab}
          onChange={(id) => setTab(id as Tab)}
        />
      </div>

      <div className="mt-4">
        {tab === 'events' && (
          <MatchEventTimeline
            events={detail.events}
            homeTeamId={homeTeamId}
            fixture={fixture}
          />
        )}
        {tab === 'lineups' && <MatchLineups lineups={detail.lineups} fixture={fixture} />}
        {tab === 'stats' && <MatchStatsSection stats={detail.stats} fixture={fixture} />}
        {tab === 'h2h' && <MatchH2H h2h={detail.h2h} />}
      </div>
    </div>
  );
}

export default MatchDetailClient;
