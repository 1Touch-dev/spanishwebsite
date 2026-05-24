'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { FixtureDetail } from '@/types';
import { isLiveFixture, isUpcomingFixture } from '@/lib/match-status';

interface MatchScoreHeaderProps {
  match: FixtureDetail;
}

function statusLabel(match: FixtureDetail): string {
  const short = match.fixture.status.short;
  const elapsed = match.fixture.status.elapsed;
  if (short === 'FT' || short === 'AET' || short === 'PEN') return 'Final';
  if (short === 'HT') return 'Descanso';
  if (short === 'NS' || short === 'TBD') return 'Próximo';
  if (elapsed != null) return `${elapsed}'`;
  return match.fixture.status.long ?? short;
}

export function MatchScoreHeader({ match }: MatchScoreHeaderProps) {
  const { fixture, teams, goals, league } = match;
  const live = isLiveFixture(match);
  const upcoming = isUpcomingFixture(match);

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border bg-gradient-to-b from-brand-navy via-brand-navy to-[#0f1f3d] p-6 text-white shadow-card">
      <div className="mb-4 flex items-center justify-center gap-2">
        {league.logo ? (
          <Image src={league.logo} alt="" width={20} height={20} className="object-contain opacity-90" />
        ) : null}
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-300">
          {league.name}
          {fixture.round
            ? ` · ${fixture.round.replace('Regular Season - ', 'Jornada ')}`
            : ''}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 sm:gap-6">
        <Link
          href={`/teams/${teams.home.id}`}
          className="flex flex-1 flex-col items-center gap-2 transition-opacity hover:opacity-85"
        >
          {teams.home.logo ? (
            <div className="rounded-full bg-white/10 p-2 ring-2 ring-white/20">
              <Image
                src={teams.home.logo}
                alt={teams.home.name}
                width={64}
                height={64}
                className="h-14 w-14 object-contain sm:h-16 sm:w-16"
              />
            </div>
          ) : null}
          <span className="text-center text-sm font-bold sm:text-base">{teams.home.name}</span>
        </Link>

        <div className="text-center">
          <div className="font-display text-4xl font-extrabold tabular-nums sm:text-5xl">
            {goals.home ?? '–'} <span className="text-white/40">:</span> {goals.away ?? '–'}
          </div>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              live
                ? 'bg-brand-red text-white animate-pulse-live'
                : upcoming
                  ? 'bg-white/15 text-slate-200'
                  : 'bg-white/20 text-white'
            }`}
          >
            {statusLabel(match)}
          </span>
        </div>

        <Link
          href={`/teams/${teams.away.id}`}
          className="flex flex-1 flex-col items-center gap-2 transition-opacity hover:opacity-85"
        >
          {teams.away.logo ? (
            <div className="rounded-full bg-white/10 p-2 ring-2 ring-white/20">
              <Image
                src={teams.away.logo}
                alt={teams.away.name}
                width={64}
                height={64}
                className="h-14 w-14 object-contain sm:h-16 sm:w-16"
              />
            </div>
          ) : null}
          <span className="text-center text-sm font-bold sm:text-base">{teams.away.name}</span>
        </Link>
      </div>

      {fixture.venue?.name ? (
        <p className="mt-4 text-center text-xs text-slate-400">
          {fixture.venue.name}
          {fixture.venue.city ? ` · ${fixture.venue.city}` : ''}
        </p>
      ) : null}
    </div>
  );
}

export default MatchScoreHeader;
