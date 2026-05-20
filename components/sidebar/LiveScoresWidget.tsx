'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMatches } from '@/store/features/matchesSlice';
import type { LiveMatch } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';

function statusInfo(status: LiveMatch['status'], minute?: string): {
  label: string;
  isLive: boolean;
  color: string;
} {
  if (status === 'IN_PLAY' || status === 'LIVE')
    return { label: minute ? `${minute}'` : 'EN VIVO', isLive: true, color: 'text-brand-red' };
  if (status === 'PAUSED' || status === 'HT')
    return { label: 'HT', isLive: true, color: 'text-amber-600' };
  if (status === 'FINISHED' || status === 'FT')
    return { label: 'FT', isLive: false, color: 'text-slate-500' };
  return { label: 'Próx.', isLive: false, color: 'text-slate-400' };
}

function MatchRow({ match }: { match: LiveMatch }) {
  const status = statusInfo(match.status, match.minute);
  const showScores = match.homeScore !== null && match.awayScore !== null;

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            status.isLive ? 'bg-brand-red animate-pulse-live' : 'bg-slate-300'
          }`}
        />
        <span className={`${status.color} text-[11px] font-bold tracking-wide w-10`}>
          {status.label}
        </span>
      </div>
      <div className="flex flex-1 items-center justify-between text-sm">
        <span className="font-semibold text-brand-navy truncate">{match.homeTeam}</span>
        <span className="mx-3 font-display text-base font-extrabold tabular-nums text-brand-navy">
          {showScores ? `${match.homeScore} — ${match.awayScore}` : 'vs'}
        </span>
        <span className="font-semibold text-brand-navy truncate text-right">{match.awayTeam}</span>
      </div>
    </div>
  );
}

export function LiveScoresWidget() {
  const dispatch = useAppDispatch();
  const t = useTranslations('sidebar');
  const { matches, status, error } = useAppSelector((s) => s.matches);

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchMatches());
    }
  }, [dispatch, status]);

  const laliga = matches.filter(
    (m) =>
      m.competition.toLowerCase().includes('primera') ||
      m.competition.toLowerCase().includes('la liga'),
  );
  const ucl = matches.filter((m) => m.competition.toLowerCase().includes('champions'));

  const today = new Date();
  const matchday = today.getDate();

  return (
    <div className="rounded-lg bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-base font-extrabold text-brand-navy">{t('liveScores')}</h3>
        <Badge variant="live" className="text-[10px]">{`MATCHDAY ${matchday}`}</Badge>
      </div>

      {status === 'loading' && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      )}

      {status === 'failed' && (
        <ErrorState
          title="Sin resultados"
          message={error ?? 'No pudimos cargar los partidos.'}
          onRetry={() => void dispatch(fetchMatches())}
        />
      )}

      {status === 'succeeded' && (
        <>
          {laliga.length > 0 && (
            <div className="border-t border-brand-border pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                LA LIGA · {t('matchday')} {matchday}
              </p>
              <div className="mt-1 divide-y divide-brand-border/60">
                {laliga.slice(0, 3).map((m) => (
                  <MatchRow key={m.id} match={m} />
                ))}
              </div>
            </div>
          )}

          {ucl.length > 0 && (
            <div className="mt-3 border-t border-brand-border pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('championsLeague')}
              </p>
              <div className="mt-1 divide-y divide-brand-border/60">
                {ucl.slice(0, 2).map((m) => (
                  <MatchRow key={m.id} match={m} />
                ))}
              </div>
            </div>
          )}

          {laliga.length === 0 && ucl.length === 0 && matches.length > 0 && (
            <div className="border-t border-brand-border pt-2 divide-y divide-brand-border/60">
              {matches.slice(0, 5).map((m) => (
                <MatchRow key={m.id} match={m} />
              ))}
            </div>
          )}

          {matches.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-500">{t('liveScores')}: sin partidos hoy.</p>
          )}
        </>
      )}

      <Link
        href="/matches"
        className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-red hover:underline"
      >
        {t('seeAllMatches')}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export default LiveScoresWidget;
