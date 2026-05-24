'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTeamDetail } from '@/store/features/teamDetailSlice';
import { TeamHeaderCard } from './TeamHeaderCard';
import { TeamSquadList } from './TeamSquadList';
import { TeamFixturesList } from './TeamFixturesList';
import { TeamLeaguePosition } from './TeamLeaguePosition';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Tabs } from '@/components/ui/Tabs';

type Tab = 'squad' | 'fixtures' | 'results';

interface TeamDetailClientProps {
  teamId: string;
}

export function TeamDetailClient({ teamId }: TeamDetailClientProps) {
  const dispatch = useAppDispatch();
  const t = useTranslations('detail');
  const tStates = useTranslations('states');
  const { team, squad, fixtures, results, standings, status, error } = useAppSelector(
    (s) => s.teamDetail,
  );
  const [tab, setTab] = useState<Tab>('squad');

  useEffect(() => {
    void dispatch(fetchTeamDetail(teamId));
  }, [teamId, dispatch]);

  const tabs = [
    { key: 'squad' as Tab, label: t('tabSquad') },
    { key: 'fixtures' as Tab, label: t('tabUpcoming') },
    { key: 'results' as Tab, label: t('tabResults') },
  ];

  if (status === 'loading') {
    return (
      <div className="container-fh space-y-3 py-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (status === 'failed' || !team) {
    return (
      <div className="container-fh py-6">
        <ErrorState
          title={tStates('errorTitle')}
          message={error ?? t('teamNotFound')}
          retryLabel={tStates('retry')}
          onRetry={() => void dispatch(fetchTeamDetail(teamId))}
        />
      </div>
    );
  }

  const numericTeamId = Number(teamId);

  return (
    <div className="container-fh max-w-4xl space-y-5 py-6">
      <TeamHeaderCard team={team} />
      <TeamLeaguePosition standings={standings} teamId={numericTeamId} />
      <Tabs
        items={tabs.map((t) => ({ id: t.key, label: t.label }))}
        activeId={tab}
        onChange={(id) => setTab(id as Tab)}
      />
      {tab === 'squad' && <TeamSquadList squad={squad} />}
      {tab === 'fixtures' && (
        <TeamFixturesList matches={fixtures} label={t('tabUpcoming')} />
      )}
      {tab === 'results' && (
        <TeamFixturesList matches={results} label={t('tabResults')} />
      )}
    </div>
  );
}

export default TeamDetailClient;
