'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMatches } from '@/store/features/matchesSlice';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { LiveMatch } from '@/types';

function statusBadge(status: LiveMatch['status']) {
  if (status === 'IN_PLAY' || status === 'LIVE')
    return (
      <span className="rounded bg-brand-red px-2 py-0.5 text-xs font-bold text-white animate-pulse-live">
        EN VIVO
      </span>
    );
  if (status === 'FINISHED' || status === 'FT')
    return (
      <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">FT</span>
    );
  if (status === 'HT' || status === 'PAUSED')
    return (
      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">HT</span>
    );
  return (
    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">Próx.</span>
  );
}

export function MatchesClient() {
  const dispatch = useAppDispatch();
  const tStates = useTranslations('states');
  const tSide = useTranslations('sidebar');
  const { matches, status, error } = useAppSelector((s) => s.matches);

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchMatches());
    }
  }, [dispatch, status]);

  const byCompetition = useMemo(() => {
    return matches.reduce((acc, m) => {
      (acc[m.competition] ??= []).push(m);
      return acc;
    }, {} as Record<string, LiveMatch[]>);
  }, [matches]);

  return (
    <div className="container-fh py-6">
      <h1 className="mb-6 font-display text-3xl font-extrabold text-brand-navy">
        {tSide('liveScores')}
      </h1>

      {status === 'loading' && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {status === 'failed' && (
        <ErrorState
          title={tStates('errorTitle')}
          message={error ?? tStates('errorMessage')}
          retryLabel={tStates('retry')}
          onRetry={() => void dispatch(fetchMatches())}
        />
      )}

      {status === 'succeeded' && matches.length === 0 && (
        <EmptyState message="No hay partidos programados hoy." />
      )}

      {status === 'succeeded' &&
        Object.entries(byCompetition).map(([comp, list]) => (
          <section key={comp} className="mb-8">
            <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-wide text-slate-600">
              {comp}
            </h2>
            <div className="overflow-hidden rounded-lg bg-white shadow-card">
              <ul className="divide-y divide-brand-border">
                {list.map((m) => (
                  <li
                    key={m.id}
                    className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-3 px-4 py-3"
                  >
                    <div className="w-16">{statusBadge(m.status)}</div>
                    <span className="text-right font-semibold text-brand-navy truncate">
                      {m.homeTeam}
                    </span>
                    <span className="font-display text-lg font-extrabold tabular-nums text-brand-navy">
                      {m.homeScore ?? '–'} <span className="opacity-30">–</span> {m.awayScore ?? '–'}
                    </span>
                    <span className="font-semibold text-brand-navy truncate">{m.awayTeam}</span>
                    <span className="text-xs text-slate-400 tabular-nums">
                      {new Date(m.utcDate).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
    </div>
  );
}

export default MatchesClient;
