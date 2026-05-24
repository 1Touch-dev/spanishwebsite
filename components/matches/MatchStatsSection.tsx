'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { MatchDetailEmpty } from './MatchDetailEmpty';
import { isUpcomingFixture } from '@/lib/match-status';
import type { FixtureDetail, MatchStat } from '@/types';

function StatBar({
  label,
  home,
  away,
}: {
  label: string;
  home: string | number;
  away: string | number;
}) {
  const h = parseFloat(String(home).replace('%', '')) || 0;
  const a = parseFloat(String(away).replace('%', '')) || 0;
  const total = h + a || 1;
  const homePct = Math.round((h / total) * 100);
  const awayPct = 100 - homePct;

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex justify-between text-sm font-bold tabular-nums text-brand-navy">
        <span>{home}</span>
        <span className="font-normal text-slate-500">{label}</span>
        <span>{away}</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="bg-brand-red transition-all duration-500"
          style={{ width: `${homePct}%` }}
        />
        <div
          className="bg-sky-600 transition-all duration-500"
          style={{ width: `${awayPct}%` }}
        />
      </div>
    </div>
  );
}

interface MatchStatsSectionProps {
  stats: MatchStat[];
  fixture: FixtureDetail;
}

export function MatchStatsSection({ stats, fixture }: MatchStatsSectionProps) {
  const t = useTranslations('detail');

  if (stats.length < 2) {
    const upcoming = isUpcomingFixture(fixture);
    return (
      <MatchDetailEmpty
        icon="📊"
        title={upcoming ? t('noStatsUpcomingTitle') : t('noStatsFinishedTitle')}
        message={upcoming ? t('noStatsUpcoming') : t('noStatsFinished')}
      />
    );
  }

  const homeStats = stats[0].statistics;
  const awayStats = stats[1].statistics;

  const pairs = homeStats.map((s, i) => ({
    type: s.type,
    home: s.value ?? 0,
    away: awayStats[i]?.value ?? 0,
  }));

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-card">
      <div className="flex items-center justify-between gap-4 border-b border-brand-border bg-brand-surface px-5 py-4">
        <div className="flex items-center gap-2">
          {stats[0].team.logo ? (
            <Image src={stats[0].team.logo} alt="" width={28} height={28} className="object-contain" />
          ) : null}
          <span className="text-sm font-bold text-brand-navy">{stats[0].team.name}</span>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">vs</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-brand-navy">{stats[1].team.name}</span>
          {stats[1].team.logo ? (
            <Image src={stats[1].team.logo} alt="" width={28} height={28} className="object-contain" />
          ) : null}
        </div>
      </div>
      <div className="p-5">
        {pairs.map((p) => (
          <StatBar key={p.type} label={p.type} home={p.home} away={p.away} />
        ))}
      </div>
    </div>
  );
}

export default MatchStatsSection;
