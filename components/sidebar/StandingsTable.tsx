'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchRankings } from '@/store/features/rankingsSlice';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

interface StandingsTableProps {
  limit?: number;
  showLink?: boolean;
  autoFetch?: boolean;
}

function positionColor(pos: number): string {
  if (pos <= 2) return 'bg-brand-red';
  if (pos === 3) return 'bg-amber-500';
  return 'bg-transparent';
}

export function StandingsTable({
  limit = 5,
  showLink = true,
  autoFetch = true,
}: StandingsTableProps) {
  const dispatch = useAppDispatch();
  const t = useTranslations('sidebar');
  const tTable = useTranslations('table');
  const { standings, status, error } = useAppSelector((s) => s.rankings);

  useEffect(() => {
    if (autoFetch && status === 'idle') {
      void dispatch(fetchRankings());
    }
  }, [autoFetch, dispatch, status]);

  const hasGroups = standings.some((row) => Boolean(row.group));
  const slice = hasGroups
    ? standings.filter((row) => row.position === 1).slice(0, limit)
    : standings.slice(0, limit);

  return (
    <div className="rounded-lg bg-white p-4 shadow-card">
      <h3 className="mb-3 font-display text-base font-extrabold text-brand-navy">
        {t('standings')}
      </h3>

      {status === 'loading' && (
        <div className="space-y-2">
          {Array.from({ length: limit }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full" />
          ))}
        </div>
      )}

      {status === 'failed' && (
        <ErrorState
          title="No standings"
          message={error ?? 'Could not load the standings.'}
          onRetry={() => void dispatch(fetchRankings())}
        />
      )}

      {status === 'succeeded' && (
        <div className="overflow-hidden rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="w-7 py-1.5 pl-2 pr-1">{tTable('position')}</th>
                <th className="py-1.5 pr-2">{tTable('team')}</th>
                <th className="px-1 py-1.5 text-center">{tTable('played')}</th>
                <th className="px-1 py-1.5 text-center">{tTable('goalDiff')}</th>
                <th className="px-1 py-1.5 text-center font-extrabold text-brand-navy">
                  {tTable('points')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {slice.map((row) => (
                <tr key={`${row.group ?? 'table'}-${row.position}-${row.team}`} className="hover:bg-brand-surface">
                  <td className="py-1.5 pl-2 pr-1">
                    <span className="relative inline-flex items-center">
                      <span
                        className={`absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 ${positionColor(
                          row.position,
                        )}`}
                      />
                      <span className="ml-2 font-bold text-brand-navy">{row.position}</span>
                    </span>
                  </td>
                  <td className="max-w-[140px] py-1.5 pr-2 font-semibold text-brand-navy">
                    <div className="flex flex-col">
                      {row.teamId ? (
                        <Link href={`/teams/${row.teamId}`} className="truncate hover:text-brand-red">
                          {row.teamShort}
                        </Link>
                      ) : (
                        <span className="truncate">{row.teamShort}</span>
                      )}
                      {row.group ? (
                        <span className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          {row.group}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-1 py-1.5 text-center tabular-nums text-slate-600">{row.played}</td>
                  <td className="px-1 py-1.5 text-center tabular-nums text-slate-600">
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="px-1 py-1.5 text-center font-extrabold tabular-nums text-brand-navy">
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!hasGroups && (
        <div className="mt-3 flex items-center gap-3 text-[10px] font-semibold uppercase text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded bg-brand-red" />
            {t('champion')}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded bg-amber-500" />
            {t('europa')}
          </span>
        </div>
      )}

      {showLink && (
        <Link
          href="/standings"
          className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-red hover:underline"
        >
          {t('standings')}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export default StandingsTable;
