'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { PlayerInfo, PlayerStatistics } from '@/types';

interface PlayerProfileCardProps {
  player: PlayerInfo;
  statistics: PlayerStatistics[];
}

export function PlayerProfileCard({ player, statistics }: PlayerProfileCardProps) {
  const stat = statistics[0];

  return (
    <div className="rounded-xl border border-brand-border bg-white p-6 shadow-card">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-brand-border bg-brand-surface">
          {player.photo ? (
            <Image src={player.photo} alt={player.name} fill className="object-cover" sizes="80px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-brand-navy">
              {player.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-extrabold text-brand-navy">{player.name}</h1>
          {stat?.team ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Link href={`/teams/${stat.team.id}`} className="inline-flex items-center gap-1.5 hover:opacity-80">
                {stat.team.logo ? (
                  <Image src={stat.team.logo} alt="" width={20} height={20} className="object-contain" />
                ) : null}
                <span className="text-sm font-semibold text-brand-red">{stat.team.name}</span>
              </Link>
              {stat.league?.name ? (
                <span className="text-xs text-slate-400">· {stat.league.name}</span>
              ) : null}
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
            {player.nationality ? <span>{player.nationality}</span> : null}
            {player.age ? <span>{player.age} años</span> : null}
            {player.height ? <span>{player.height}</span> : null}
            {player.weight ? <span>{player.weight}</span> : null}
            {stat?.games?.position ? (
              <span className="rounded-full bg-brand-red/10 px-2 py-0.5 text-xs font-semibold text-brand-red">
                {stat.games.position}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {player.injured ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
          Lesionado actualmente
        </div>
      ) : null}
    </div>
  );
}

export default PlayerProfileCard;
