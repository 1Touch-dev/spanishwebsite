'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchRankings } from '@/store/features/rankingsSlice';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

const INITIAL_COLORS = ['bg-brand-red', 'bg-blue-700', 'bg-emerald-700', 'bg-amber-600', 'bg-violet-700'];

function initials(name: string): string {
  const parts = name.split(/[\s.]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface TopScorersWidgetProps {
  autoFetch?: boolean;
}

export function TopScorersWidget({ autoFetch = true }: TopScorersWidgetProps) {
  const dispatch = useAppDispatch();
  const t = useTranslations('sidebar');
  const { topScorers, status, error } = useAppSelector((s) => s.rankings);

  useEffect(() => {
    if (autoFetch && status === 'idle') {
      void dispatch(fetchRankings());
    }
  }, [autoFetch, dispatch, status]);

  const top = topScorers.slice(0, 5);
  const maxGoals = Math.max(...top.map((s) => s.goals), 1);

  return (
    <div className="rounded-lg bg-white p-4 shadow-card">
      <h3 className="mb-3 font-display text-base font-extrabold text-brand-navy">
        {t('topScorers')}
      </h3>

      {status === 'loading' && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === 'failed' && (
        <ErrorState
          title="Sin goleadores"
          message={error ?? 'No pudimos cargar los goleadores.'}
          onRetry={() => void dispatch(fetchRankings())}
        />
      )}

      {status === 'succeeded' && (
        <ul className="space-y-3">
          {top.map((s, idx) => (
            <li key={`${s.name}-${idx}`} className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${
                  INITIAL_COLORS[idx % INITIAL_COLORS.length]
                }`}
              >
                {initials(s.name)}
              </div>
              <div className="min-w-0 flex-1">
                {s.playerId ? (
                  <Link href={`/players/${s.playerId}`} className="truncate text-sm font-bold text-brand-navy hover:text-brand-red block">
                    {s.name}
                  </Link>
                ) : (
                  <p className="truncate text-sm font-bold text-brand-navy">{s.name}</p>
                )}
                <p className="truncate text-xs text-slate-500">
                  {s.teamId ? (
                    <Link href={`/teams/${s.teamId}`} className="hover:text-brand-red">
                      {s.team}
                    </Link>
                  ) : (
                    s.team
                  )}{' '}
                  · {s.goals} goles
                </p>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded bg-brand-surface">
                  <div
                    className="h-full rounded bg-brand-red"
                    style={{ width: `${(s.goals / maxGoals) * 100}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TopScorersWidget;
