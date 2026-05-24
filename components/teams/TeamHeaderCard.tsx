'use client';

import Image from 'next/image';
import type { TeamInfo } from '@/types';

interface TeamHeaderCardProps {
  team: TeamInfo;
}

export function TeamHeaderCard({ team }: TeamHeaderCardProps) {
  return (
    <div className="flex items-center gap-6 rounded-xl border border-brand-border bg-white p-6 shadow-card">
      {team.logo ? (
        <Image src={team.logo} alt={team.name} width={80} height={80} className="object-contain" />
      ) : null}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-brand-navy">{team.name}</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
          {team.country ? <span>{team.country}</span> : null}
          {team.founded ? <span>Fundado: {team.founded}</span> : null}
          {team.venue?.name ? <span>{team.venue.name}</span> : null}
          {team.venue?.capacity ? (
            <span>Cap. {team.venue.capacity.toLocaleString()}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default TeamHeaderCard;
