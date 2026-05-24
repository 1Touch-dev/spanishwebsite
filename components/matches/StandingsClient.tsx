'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchRankings } from '@/store/features/rankingsSlice';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

export function StandingsClient() {
  const dispatch = useAppDispatch();
  const t = useTranslations('table');
  const tSide = useTranslations('sidebar');
  const tStates = useTranslations('states');
  const { standings, status, error } = useAppSelector((s) => s.rankings);

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchRankings());
    }
  }, [dispatch, status]);

  return (
    <div className="container-fh py-6">
      <h1 className="mb-6 font-display text-3xl font-extrabold text-brand-navy">
        {tSide('standings')}
      </h1>

      {status === 'loading' && (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {status === 'failed' && (
        <ErrorState
          title={tStates('errorTitle')}
          message={error ?? tStates('errorMessage')}
          retryLabel={tStates('retry')}
          onRetry={() => void dispatch(fetchRankings())}
        />
      )}

      {status === 'succeeded' && (
        <div className="overflow-x-auto rounded-lg bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-brand-surface">
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="px-3 py-3">{t('position')}</th>
                <th className="px-3 py-3">{t('team')}</th>
                <th className="px-3 py-3 text-center">{t('played')}</th>
                <th className="px-3 py-3 text-center">{t('won')}</th>
                <th className="px-3 py-3 text-center">{t('draw')}</th>
                <th className="px-3 py-3 text-center">{t('lost')}</th>
                <th className="px-3 py-3 text-center">{t('goalDiff')}</th>
                <th className="px-3 py-3 text-center font-extrabold text-brand-navy">
                  {t('points')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {standings.map((row) => (
                <tr key={row.position} className="hover:bg-brand-surface">
                  <td className="px-3 py-2.5 font-bold tabular-nums text-brand-navy">
                    {row.position}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-brand-navy">
                    {row.teamId ? (
                      <Link href={`/teams/${row.teamId}`} className="hover:text-brand-red">
                        {row.team}
                      </Link>
                    ) : (
                      row.team
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center tabular-nums">{row.played}</td>
                  <td className="px-3 py-2.5 text-center tabular-nums">{row.won}</td>
                  <td className="px-3 py-2.5 text-center tabular-nums">{row.draw}</td>
                  <td className="px-3 py-2.5 text-center tabular-nums">{row.lost}</td>
                  <td className="px-3 py-2.5 text-center tabular-nums">
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="px-3 py-2.5 text-center font-extrabold tabular-nums text-brand-navy">
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StandingsClient;
