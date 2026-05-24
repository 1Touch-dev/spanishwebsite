export interface StandingRow {
  position: number;
  team: string;
  teamShort: string;
  teamId?: number;
  crest?: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalDifference: number;
  points: number;
  form?: string;
  description?: string;
}

export interface TopScorer {
  name: string;
  team: string;
  playerId?: number;
  teamId?: number;
  goals: number;
  crest?: string;
  photo?: string;
}

export interface RankingsPayload {
  standings: StandingRow[];
  topScorers: TopScorer[];
}
