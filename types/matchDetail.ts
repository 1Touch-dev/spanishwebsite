export interface FixtureDetail {
  fixture: {
    id: number;
    date: string;
    referee?: string | null;
    timezone?: string;
    venue?: { id?: number; name?: string; city?: string } | null;
    status: { short: string; long?: string; elapsed?: number | null };
    round?: string;
  };
  league: { id: number; name: string; country?: string; logo?: string; season?: number; round?: string };
  teams: {
    home: { id: number; name: string; logo?: string; winner?: boolean | null };
    away: { id: number; name: string; logo?: string; winner?: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score?: {
    halftime?: { home: number | null; away: number | null };
    fulltime?: { home: number | null; away: number | null };
  };
}

export interface MatchEvent {
  time: { elapsed: number | null; extra: number | null };
  team: { id: number; name: string; logo?: string };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
}

export interface MatchLineupPlayer {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid?: string | null;
}

export interface MatchLineup {
  team: { id: number; name: string; logo?: string };
  formation: string;
  startXI: Array<{ player: MatchLineupPlayer }>;
  substitutes: Array<{ player: MatchLineupPlayer }>;
  coach?: { id?: number; name?: string; photo?: string };
}

export interface MatchStat {
  team: { id: number; name: string; logo?: string };
  statistics: Array<{ type: string; value: string | number | null }>;
}

export interface MatchDetailPayload {
  fixture: FixtureDetail | null;
  lineups: MatchLineup[];
  events: MatchEvent[];
  stats: MatchStat[];
  h2h: FixtureDetail[];
}
