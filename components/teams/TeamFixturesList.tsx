'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { LiveMatch } from '@/types';

interface TeamFixturesListProps {
  matches: LiveMatch[];
  label: string;
}

export function TeamFixturesList({ matches, label }: TeamFixturesListProps) {
  if (!matches.length) {
    return <p className="py-8 text-center text-sm text-slate-400">{label}: sin datos.</p>;
  }

  return (
    <div className="space-y-2">
      {matches.map((m) => (
        <Link
          key={m.id}
          href={`/matches/${m.id}`}
          className="flex items-center gap-3 rounded-lg border border-brand-border bg-white px-4 py-3 hover:bg-brand-surface"
        >
          <span className="w-24 text-xs text-slate-400">{m.utcDate.slice(0, 10)}</span>
          {m.homeCrest ? (
            <Image src={m.homeCrest} alt="" width={20} height={20} className="object-contain" />
          ) : null}
          <span className="flex-1 truncate text-right text-sm font-medium">{m.homeTeam}</span>
          <span className="font-display text-sm font-extrabold tabular-nums">
            {m.homeScore ?? '–'} – {m.awayScore ?? '–'}
          </span>
          <span className="flex-1 truncate text-sm font-medium">{m.awayTeam}</span>
          {m.awayCrest ? (
            <Image src={m.awayCrest} alt="" width={20} height={20} className="object-contain" />
          ) : null}
        </Link>
      ))}
    </div>
  );
}

export default TeamFixturesList;
