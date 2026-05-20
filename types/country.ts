export interface Country {
  id: string;
  name: string;
  flag: string;
  leagues: string[];
  keywords: string[];
  description?: string;
  leagueId?: number;
  season?: number;
}

export type CountryId = 'mexico' | 'colombia' | 'argentina' | 'spain' | 'peru';
