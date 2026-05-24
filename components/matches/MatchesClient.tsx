'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMatches } from '@/store/features/matchesSlice';
import { MatchCardRow } from '@/components/matches/MatchCardRow';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { LiveMatch } from '@/types';

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

  const liveCount = matches.filter(
    (m) => m.status === 'IN_PLAY' || m.status === 'LIVE',
  ).length;

  return (
    <div className="container-fh py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-brand-navy sm:text-4xl">
            {tSide('liveScores')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {matches.length > 0
              ? `${matches.length} partidos · ${liveCount > 0 ? `${liveCount} en vivo` : 'actualizado al momento'}`
              : 'Resultados y horarios'}
          </p>
        </div>
        {liveCount > 0 ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-red/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-red">
            <span className="h-2 w-2 rounded-full bg-brand-red animate-pulse-live" />
            {liveCount} en vivo
          </span>
        ) : null}
      </div>

      {status === 'loading' && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
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
            <div className="mb-3 flex items-center gap-2 border-l-4 border-brand-red pl-3">
              <h2 className="font-display text-lg font-extrabold uppercase tracking-wide text-brand-navy">
                {comp}
              </h2>
              <span className="rounded-full bg-brand-surface px-2 py-0.5 text-[11px] font-bold text-slate-500">
                {list.length}
              </span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-card">
              {list.map((m) => (
                <MatchCardRow key={m.id} match={m} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}

export default MatchesClient;
