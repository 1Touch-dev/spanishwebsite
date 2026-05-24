'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { MatchDetailEmpty } from './MatchDetailEmpty';
import { isFinishedFixture, isUpcomingFixture } from '@/lib/match-status';
import type { FixtureDetail, MatchEvent } from '@/types';

const ICON: Record<string, string> = {
  Goal: '⚽',
  Card: '🟨',
  subst: '🔄',
  Var: '📺',
};

function eventIcon(type: string, detail: string): string {
  if (detail.toLowerCase().includes('red')) return '🔴';
  if (detail.toLowerCase().includes('yellow')) return '🟡';
  return ICON[type] ?? '•';
}

interface MatchEventTimelineProps {
  events: MatchEvent[];
  homeTeamId: number;
  fixture: FixtureDetail;
}

export function MatchEventTimeline({ events, homeTeamId, fixture }: MatchEventTimelineProps) {
  const t = useTranslations('detail');

  if (!events.length) {
    const upcoming = isUpcomingFixture(fixture);
    return (
      <MatchDetailEmpty
        icon="⏱️"
        title={upcoming ? t('noEventsUpcomingTitle') : t('noEventsFinishedTitle')}
        message={upcoming ? t('noEventsUpcoming') : t('noEventsFinished')}
      />
    );
  }

  const sorted = [...events].sort(
    (a, b) => (a.time.elapsed ?? 0) - (b.time.elapsed ?? 0),
  );

  return (
    <div className="relative space-y-0">
      <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-brand-border sm:block" />
      {sorted.map((ev, i) => {
        const isHome = ev.team.id === homeTeamId;
        return (
          <div
            key={`${ev.time.elapsed}-${ev.player.id ?? ev.detail}-${i}`}
            className={`relative flex py-2 sm:grid sm:grid-cols-2 sm:gap-8 ${
              isHome ? 'sm:justify-end' : 'sm:justify-start'
            }`}
          >
            <div
              className={`flex items-center gap-3 rounded-xl border border-brand-border bg-white px-4 py-3 shadow-sm sm:max-w-[90%] ${
                isHome ? 'sm:col-start-1 sm:ml-auto' : 'sm:col-start-2'
              }`}
            >
              <span className="text-xl">{eventIcon(ev.type, ev.detail)}</span>
              <span className="w-9 shrink-0 text-center text-xs font-extrabold tabular-nums text-brand-red">
                {ev.time.elapsed ?? 0}&apos;
              </span>
              <div className="min-w-0 flex-1">
                {ev.player.id && ev.player.name ? (
                  <Link
                    href={`/players/${ev.player.id}`}
                    className="text-sm font-bold text-brand-navy hover:text-brand-red"
                  >
                    {ev.player.name}
                  </Link>
                ) : (
                  <span className="text-sm font-bold text-brand-navy">{ev.detail}</span>
                )}
                {ev.assist?.id && ev.assist?.name ? (
                  <p className="text-xs text-slate-500">
                    {isFinishedFixture(fixture) ? 'Asistencia: ' : ''}
                    <Link href={`/players/${ev.assist.id}`} className="hover:text-brand-red">
                      {ev.assist.name}
                    </Link>
                  </p>
                ) : null}
                <p className="text-xs text-slate-400">{ev.detail}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MatchEventTimeline;
