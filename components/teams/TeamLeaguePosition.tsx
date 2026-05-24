'use client';

import type { StandingRow } from '@/types';

interface TeamLeaguePositionProps {
  standings: StandingRow[];
  teamId: number;
}

export function TeamLeaguePosition({ standings, teamId }: TeamLeaguePositionProps) {
  const row = standings.find((s) => s.teamId === teamId);
  if (!row) return null;

  return (
    <div className="flex flex-wrap items-center gap-6 rounded-xl border border-brand-border bg-white px-5 py-4 text-sm shadow-card">
      <div className="text-center">
        <div className="font-display text-2xl font-extrabold text-brand-red">{row.position}</div>
        <div className="text-xs text-slate-400">Posición</div>
      </div>
      <div className="flex flex-1 flex-wrap justify-center gap-6 text-center">
        {[
          { label: 'PJ', val: row.played },
          { label: 'G', val: row.won },
          { label: 'E', val: row.draw },
          { label: 'P', val: row.lost },
          { label: 'Pts', val: row.points },
        ].map((s) => (
          <div key={s.label}>
            <div className="font-semibold tabular-nums">{s.val}</div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>
      {row.description ? (
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
          {row.description}
        </span>
      ) : null}
    </div>
  );
}

export default TeamLeaguePosition;
