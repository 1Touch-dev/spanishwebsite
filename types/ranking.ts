export interface StandingRow {
  position: number;
  team: string;
  teamShort: string;
  crest?: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalDifference: number;
  points: number;
}

export interface TopScorer {
  name: string;
  team: string;
  goals: number;
  crest?: string;
  photo?: string;
}

export interface RankingsPayload {
  standings: StandingRow[];
  topScorers: TopScorer[];
}
