'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { LiveMatch } from '@/types';

interface PlayerRecentFixturesProps {
  fixtures: LiveMatch[];
}

export function PlayerRecentFixtures({ fixtures }: PlayerRecentFixturesProps) {
  const t = useTranslations('detail');
  if (!fixtures.length) return null;

  return (
    <div className="rounded-xl border border-brand-border bg-white p-5 shadow-card">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">{t('recentMatches')}</h2>
      <div className="space-y-2">
        {fixtures.slice(0, 5).map((m) => (
          <Link
            key={m.id}
            href={`/matches/${m.id}`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-brand-surface"
          >
            <span className="w-20 text-xs text-slate-400">{m.utcDate.slice(0, 10)}</span>
            {m.homeCrest ? (
              <Image src={m.homeCrest} alt="" width={16} height={16} className="object-contain" />
            ) : null}
            <span className="flex-1 truncate text-xs font-medium text-brand-navy">
              {m.homeTeam} {m.homeScore ?? '–'} – {m.awayScore ?? '–'} {m.awayTeam}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PlayerRecentFixtures;
