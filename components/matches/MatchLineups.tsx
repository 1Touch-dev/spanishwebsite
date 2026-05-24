'use client';

import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { MatchDetailEmpty } from './MatchDetailEmpty';
import { isUpcomingFixture } from '@/lib/match-status';
import type { FixtureDetail, MatchLineup, MatchLineupPlayer } from '@/types';

function PlayerRow({ player }: { player: MatchLineupPlayer }) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-brand-surface"
    >
      <span className="w-6 text-right text-xs font-bold text-slate-400 tabular-nums">
        {player.number}
      </span>
      <span className="flex-1 text-sm font-semibold text-brand-navy">{player.name}</span>
      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
        {player.pos}
      </span>
    </Link>
  );
}

interface MatchLineupsProps {
  lineups: MatchLineup[];
  fixture: FixtureDetail;
}

export function MatchLineups({ lineups, fixture }: MatchLineupsProps) {
  const t = useTranslations('detail');

  if (!lineups.length) {
    const upcoming = isUpcomingFixture(fixture);
    return (
      <MatchDetailEmpty
        icon="📋"
        title={upcoming ? t('noLineupsUpcomingTitle') : t('noLineupsFinishedTitle')}
        message={upcoming ? t('noLineupsUpcoming') : t('noLineupsFinished')}
      />
    );
  }

  const [home, away] = lineups;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[home, away].filter(Boolean).map((team) => (
        <div
          key={team.team.id}
          className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-card"
        >
          <div className="flex items-center gap-2 bg-gradient-to-r from-brand-navy to-[#1a3058] px-4 py-3">
            {team.team.logo ? (
              <Image src={team.team.logo} alt="" width={24} height={24} className="object-contain" />
            ) : null}
            <span className="text-sm font-bold text-white">{team.team.name}</span>
            <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-slate-200">
              {team.formation}
            </span>
          </div>
          <div className="p-3">
            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Titular
            </p>
            {team.startXI.map((p) => (
              <PlayerRow key={p.player.id} player={p.player} />
            ))}
            {team.substitutes.length > 0 ? (
              <>
                <p className="mb-2 mt-4 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Suplentes
                </p>
                {team.substitutes.map((p) => (
                  <PlayerRow key={p.player.id} player={p.player} />
                ))}
              </>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MatchLineups;
