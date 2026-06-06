'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMatches } from '@/store/features/matchesSlice';
import type { LiveMatch } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';

function statusInfo(status: LiveMatch['status'], minute?: string): {
  label: string;
  isLive: boolean;
  color: string;
} {
  if (status === 'IN_PLAY' || status === 'LIVE') {
    return { label: minute ? `${minute}'` : 'LIVE', isLive: true, color: 'text-brand-red' };
  }
  if (status === 'PAUSED' || status === 'HT') {
    return { label: 'HT', isLive: true, color: 'text-amber-600' };
  }
  if (status === 'FINISHED' || status === 'FT') {
    return { label: 'FT', isLive: false, color: 'text-slate-500' };
  }
  return { label: 'Next', isLive: false, color: 'text-slate-400' };
}

function MatchRow({ match }: { match: LiveMatch }) {
  const status = statusInfo(match.status, match.minute);
  const showScores = match.homeScore !== null && match.awayScore !== null;

  return (
    <Link
      href={`/matches/${match.id}`}
      className="flex items-center justify-between gap-3 rounded px-1 py-2 transition-colors hover:bg-brand-surface -mx-1"
    >
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            status.isLive ? 'bg-brand-red animate-pulse-live' : 'bg-slate-300'
          }`}
        />
        <span className={`${status.color} w-10 text-[11px] font-bold tracking-wide`}>
          {status.label}
        </span>
      </div>
      <div className="flex flex-1 items-center text-sm">
        <span className="truncate flex-1 text-left font-semibold text-brand-navy">{match.homeTeam}</span>
        <span className="w-14 shrink-0 text-center font-display text-base font-extrabold tabular-nums text-brand-navy">
          {showScores ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
        </span>
        <span className="truncate flex-1 text-right font-semibold text-brand-navy">{match.awayTeam}</span>
      </div>
    </Link>
  );
}

export function LiveScoresWidget() {
  const dispatch = useAppDispatch();
  const t = useTranslations('sidebar');
  const tStates = useTranslations('states');
  const { matches, status, error } = useAppSelector((s) => s.matches);

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchMatches());
    }
  }, [dispatch, status]);

  const worldCupMatches = matches.filter(
    (m) =>
      m.competition.toLowerCase().includes('world cup') ||
      m.competition.toLowerCase().includes('copa del mundo'),
  );
  const otherMatches = matches.filter((m) => !worldCupMatches.some((wc) => wc.id === m.id));

  return (
    <div className="rounded-lg bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-base font-extrabold text-brand-navy">{t('liveScores')}</h3>
        <Badge variant="live" className="text-[10px]">
          FIFA 2026
        </Badge>
      </div>

      {status === 'loading' && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      )}

      {status === 'failed' && (
        <ErrorState
          title={tStates('emptyTitle')}
          message={error ?? tStates('errorMessage')}
          onRetry={() => void dispatch(fetchMatches())}
        />
      )}

      {status === 'succeeded' && (
        <>
          {worldCupMatches.length > 0 && (
            <div className="border-t border-brand-border pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                FIFA WORLD CUP 2026
              </p>
              <div className="mt-1 divide-y divide-brand-border/60">
                {worldCupMatches.slice(0, 4).map((m) => (
                  <MatchRow key={m.id} match={m} />
                ))}
              </div>
            </div>
          )}

          {otherMatches.length > 0 && (
            <div className="mt-3 border-t border-brand-border pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('otherMatches')}
              </p>
              <div className="mt-1 divide-y divide-brand-border/60">
                {otherMatches.slice(0, 2).map((m) => (
                  <MatchRow key={m.id} match={m} />
                ))}
              </div>
            </div>
          )}

          {worldCupMatches.length === 0 && otherMatches.length === 0 && matches.length > 0 && (
            <div className="divide-y divide-brand-border/60 border-t border-brand-border pt-2">
              {matches.slice(0, 5).map((m) => (
                <MatchRow key={m.id} match={m} />
              ))}
            </div>
          )}

          {matches.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-500">{t('noMatchesToday')}</p>
          )}
        </>
      )}

      <Link
        href="/matches"
        className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-red hover:underline"
      >
        {t('seeAllMatches')}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export default LiveScoresWidget;
