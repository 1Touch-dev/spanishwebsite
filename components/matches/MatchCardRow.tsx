'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { LiveMatch } from '@/types';
import { showLiveMatchScores } from '@/lib/match-status';

function statusBadge(status: LiveMatch['status'], minute?: string) {
  if (status === 'IN_PLAY' || status === 'LIVE')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white animate-pulse-live">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        {minute ? `${minute}'` : 'Live'}
      </span>
    );
  if (status === 'FINISHED' || status === 'FT')
    return (
      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
        FT
      </span>
    );
  if (status === 'HT' || status === 'PAUSED')
    return (
      <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
        HT
      </span>
    );
  return (
    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
      {minute ?? 'Next'}
    </span>
  );
}

interface MatchCardRowProps {
  match: LiveMatch;
}

export function MatchCardRow({ match }: MatchCardRowProps) {
  const showScores = showLiveMatchScores(match);
  const kickoff = new Date(match.utcDate).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group block border-b border-brand-border/80 last:border-0 transition-colors hover:bg-gradient-to-r hover:from-brand-red/[0.04] hover:to-transparent"
    >
      <div className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5">
        <div className="hidden w-14 shrink-0 sm:block">{statusBadge(match.status, match.minute)}</div>

        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            <span className="truncate text-right text-sm font-bold text-brand-navy sm:text-base">
              {match.homeTeam}
            </span>
            {match.homeCrest ? (
              <Image
                src={match.homeCrest}
                alt=""
                width={36}
                height={36}
                className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-surface text-[10px] font-bold text-slate-400 sm:h-9 sm:w-9">
                {match.homeTeam.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex w-[72px] shrink-0 flex-col items-center sm:w-24">
            <div className="sm:hidden mb-1">{statusBadge(match.status, match.minute)}</div>
            {showScores ? (
              <span className="font-display text-xl font-extrabold tabular-nums text-brand-navy sm:text-2xl">
                {match.homeScore ?? 0}
                <span className="mx-1 text-slate-300">–</span>
                {match.awayScore ?? 0}
              </span>
            ) : (
              <span className="font-display text-lg font-extrabold text-slate-400 sm:text-xl">vs</span>
            )}
            <span className="mt-0.5 text-[10px] font-semibold tabular-nums text-slate-400">{kickoff}</span>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {match.awayCrest ? (
              <Image
                src={match.awayCrest}
                alt=""
                width={36}
                height={36}
                className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-surface text-[10px] font-bold text-slate-400 sm:h-9 sm:w-9">
                {match.awayTeam.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="truncate text-left text-sm font-bold text-brand-navy sm:text-base">
              {match.awayTeam}
            </span>
          </div>
        </div>

        <span className="hidden text-brand-red opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
          →
        </span>
      </div>
    </Link>
  );
}

export default MatchCardRow;
