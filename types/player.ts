import type { LiveMatch } from './match';

export interface PlayerInfo {
  id: number;
  name: string;
  firstname?: string;
  lastname?: string;
  age?: number | null;
  nationality?: string | null;
  height?: string | null;
  weight?: string | null;
  injured?: boolean;
  photo?: string;
}

export interface PlayerStatistics {
  team: { id: number; name: string; logo?: string };
  league: {
    id: number;
    name: string;
    country?: string;
    logo?: string;
    season?: number;
  };
  games: {
    appearences?: number | null;
    lineups?: number | null;
    minutes?: number | null;
    position?: string | null;
    rating?: string | null;
  };
  goals: { total?: number | null; assists?: number | null; saves?: number | null };
  shots?: { total?: number | null; on?: number | null };
  passes?: { total?: number | null; key?: number | null; accuracy?: number | null };
  tackles?: { total?: number | null; blocks?: number | null; interceptions?: number | null };
  cards?: { yellow?: number | null; yellowred?: number | null; red?: number | null };
}

export interface PlayerDetailPayload {
  player: PlayerInfo | null;
  statistics: PlayerStatistics[];
  recentFixtures: LiveMatch[];
}
