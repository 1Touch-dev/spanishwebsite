import type { LiveMatch } from './match';
import type { StandingRow } from './ranking';

export interface TeamInfo {
  id: number;
  name: string;
  code?: string;
  country?: string;
  founded?: number;
  logo?: string;
  venue?: {
    id?: number;
    name?: string;
    address?: string;
    city?: string;
    capacity?: number;
    image?: string;
  };
}

export interface SquadPlayer {
  id: number;
  name: string;
  age?: number | null;
  number?: number | null;
  position?: string;
  photo?: string;
}

export interface TeamDetailPayload {
  team: TeamInfo | null;
  squad: SquadPlayer[];
  fixtures: LiveMatch[];
  results: LiveMatch[];
  standings: StandingRow[];
  leagueId?: number;
  season?: number;
}
