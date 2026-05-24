'use client';

import { useTranslations } from 'next-intl';
import type { PlayerStatistics } from '@/types';

const STAT_KEYS: Array<{ path: string; labelKey: string; icon: string }> = [
  { path: 'goals.total', labelKey: 'statGoals', icon: '⚽' },
  { path: 'goals.assists', labelKey: 'statAssists', icon: '🎯' },
  { path: 'games.appearences', labelKey: 'statApps', icon: '📅' },
  { path: 'games.minutes', labelKey: 'statMinutes', icon: '⏱' },
  { path: 'shots.total', labelKey: 'statShots', icon: '🎯' },
  { path: 'passes.key', labelKey: 'statKeyPasses', icon: '🔑' },
  { path: 'tackles.total', labelKey: 'statTackles', icon: '🛡' },
  { path: 'cards.yellow', labelKey: 'statYellow', icon: '🟡' },
];

function getNested(obj: Record<string, unknown>, path: string): string | number {
  const val = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
  return val != null ? (val as string | number) : '–';
}

interface PlayerSeasonStatsProps {
  statistics: PlayerStatistics[];
}

export function PlayerSeasonStats({ statistics }: PlayerSeasonStatsProps) {
  const t = useTranslations('detail');
  if (!statistics.length) return null;
  const stat = statistics[0];

  return (
    <div className="rounded-xl border border-brand-border bg-white p-5 shadow-card">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">
        {t('seasonStats')}
        {stat.league?.season ? ` — ${stat.league.season}` : ''}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_KEYS.map((card) => (
          <div key={card.path} className="rounded-lg bg-brand-surface p-3 text-center">
            <div className="text-lg">{card.icon}</div>
            <div className="mt-1 font-display text-xl font-extrabold tabular-nums text-brand-navy">
              {String(getNested(stat as unknown as Record<string, unknown>, card.path))}
            </div>
            <div className="mt-0.5 text-xs text-slate-400">{t(card.labelKey)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayerSeasonStats;
