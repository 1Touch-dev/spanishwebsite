'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMatches } from '@/store/features/matchesSlice';
import { fetchRankings } from '@/store/features/rankingsSlice';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Country, LiveMatch } from '@/types';

interface CountryFootballSectionProps {
  country: Country;
}

function statusBadge(status: LiveMatch['status']) {
  if (status === 'IN_PLAY' || status === 'LIVE')
    return (
      <span className="rounded bg-brand-red px-2 py-0.5 text-[10px] font-bold text-white animate-pulse-live">
        EN VIVO
      </span>
    );
  if (status === 'FINISHED' || status === 'FT')
    return (
      <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
        FT
      </span>
    );
  if (status === 'HT' || status === 'PAUSED')
    return (
      <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
        HT
      </span>
    );
  return (
    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
      Próx.
    </span>
  );
}

export function CountryFootballSection({ country }: CountryFootballSectionProps) {
  const dispatch = useAppDispatch();
  const tCountry = useTranslations('country');
  const tStates = useTranslations('states');

  const matchesState = useAppSelector((s) => s.matches);
  const rankingsState = useAppSelector((s) => s.rankings);

  const matchesForCountry =
    matchesState.countryId === country.id ? matchesState.matches : [];
  const matchesStatus =
    matchesState.countryId === country.id ? matchesState.status : 'idle';

  const standingsForCountry =
    rankingsState.countryId === country.id ? rankingsState.standings : [];
  const topScorersForCountry =
    rankingsState.countryId === country.id ? rankingsState.topScorers : [];
  const rankingsStatus =
    rankingsState.countryId === country.id ? rankingsState.status : 'idle';

  useEffect(() => {
    if (
      matchesState.countryId !== country.id ||
      matchesState.status === 'idle' ||
      matchesState.status === 'failed'
    ) {
      void dispatch(fetchMatches({ countryId: country.id, tab: 'live' }));
    }
    if (
      rankingsState.countryId !== country.id ||
      rankingsState.status === 'idle' ||
      rankingsState.status === 'failed'
    ) {
      void dispatch(fetchRankings({ countryId: country.id }));
    }
    // We deliberately depend only on country.id + dispatch so we re-fetch
    // exactly when the user navigates to a different country page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country.id, dispatch]);

  const hasMatchesError = matchesStatus === 'failed';
  const hasRankingsError = rankingsStatus === 'failed';

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="mb-4 font-display text-xl font-extrabold uppercase tracking-tight text-brand-navy">
          {tCountry('matchesTitle')}
        </h2>

        {matchesStatus === 'loading' && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        )}

        {hasMatchesError && (
          <ErrorState
            title={tStates('errorTitle')}
            message={matchesState.error ?? tStates('errorMessage')}
            retryLabel={tStates('retry')}
            onRetry={() =>
              void dispatch(fetchMatches({ countryId: country.id, tab: 'live' }))
            }
          />
        )}

        {matchesStatus === 'succeeded' && matchesForCountry.length === 0 && (
          <EmptyState title={tStates('emptyTitle')} message={tStates('emptyMessage')} />
        )}

        {matchesStatus === 'succeeded' && matchesForCountry.length > 0 && (
          <div className="overflow-hidden rounded-lg bg-white shadow-card">
            <ul className="divide-y divide-brand-border">
              {matchesForCountry.slice(0, 8).map((m) => (
                <li
                  key={m.id}
                  className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-3 px-4 py-3"
                >
                  <div className="w-16">{statusBadge(m.status)}</div>
                  <span className="truncate text-right font-semibold text-brand-navy">
                    {m.homeTeam}
                  </span>
                  <span className="font-display text-lg font-extrabold tabular-nums text-brand-navy">
                    {m.homeScore ?? '–'} <span className="opacity-30">–</span>{' '}
                    {m.awayScore ?? '–'}
                  </span>
                  <span className="truncate font-semibold text-brand-navy">{m.awayTeam}</span>
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
        )}
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg bg-white p-4 shadow-card">
          <h3 className="mb-3 font-display text-base font-extrabold uppercase tracking-tight text-brand-navy">
            {tCountry('standingsTitle')}
          </h3>

          {rankingsStatus === 'loading' && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          )}

          {hasRankingsError && (
            <ErrorState
              title={tStates('errorTitle')}
              message={rankingsState.error ?? tStates('errorMessage')}
              retryLabel={tStates('retry')}
              onRetry={() =>
                void dispatch(fetchRankings({ countryId: country.id }))
              }
            />
          )}

          {rankingsStatus === 'succeeded' && standingsForCountry.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-1.5 pl-1 pr-1 w-7">#</th>
                  <th className="py-1.5 pr-2">Equipo</th>
                  <th className="py-1.5 px-1 text-center">PJ</th>
                  <th className="py-1.5 px-1 text-center font-extrabold text-brand-navy">
                    PTS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {standingsForCountry.slice(0, 8).map((row) => (
                  <tr key={row.position} className="hover:bg-brand-surface">
                    <td className="py-1.5 pl-1 pr-1 font-bold text-brand-navy">
                      {row.position}
                    </td>
                    <td className="py-1.5 pr-2 font-semibold text-brand-navy truncate max-w-[140px]">
                      {row.teamShort || row.team}
                    </td>
                    <td className="py-1.5 px-1 text-center text-slate-600 tabular-nums">
                      {row.played}
                    </td>
                    <td className="py-1.5 px-1 text-center font-extrabold tabular-nums text-brand-navy">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {rankingsStatus === 'succeeded' && standingsForCountry.length === 0 && (
            <EmptyState message={tStates('emptyMessage')} />
          )}
        </div>

        <div className="rounded-lg bg-white p-4 shadow-card">
          <h3 className="mb-3 font-display text-base font-extrabold uppercase tracking-tight text-brand-navy">
            {tCountry('topPlayers')}
          </h3>

          {rankingsStatus === 'loading' && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          )}

          {rankingsStatus === 'succeeded' && topScorersForCountry.length > 0 && (
            <ul className="divide-y divide-brand-border/60">
              {topScorersForCountry.slice(0, 8).map((p, i) => (
                <li
                  key={`${p.name}-${i}`}
                  className="flex items-center justify-between gap-3 py-1.5 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="w-5 text-right font-bold text-slate-400 tabular-nums">
                      {i + 1}
                    </span>
                    <span className="truncate font-semibold text-brand-navy">
                      {p.name}
                    </span>
                    <span className="truncate text-xs text-slate-500">{p.team}</span>
                  </span>
                  <span className="font-display text-base font-extrabold tabular-nums text-brand-red">
                    {p.goals}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {rankingsStatus === 'succeeded' && topScorersForCountry.length === 0 && (
            <EmptyState message={tStates('emptyMessage')} />
          )}
        </div>
      </aside>
    </section>
  );
}

export default CountryFootballSection;
