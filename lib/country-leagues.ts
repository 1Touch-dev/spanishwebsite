import countriesData from '@/data/countries.json';
import type { Country } from '@/types';

const countries = countriesData as Country[];

const DEFAULT_COUNTRY_ID = 'spain';
const DEFAULT_LEAGUE_ID = 140;

function getDefaultSeason(): number {
  const raw = process.env.FOOTBALL_API_SEASON;
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 2025;
}

export interface CountryLeagueConfig {
  countryId: string;
  leagueId: number;
  season: number;
}

export function resolveCountryLeague(countryId?: string): CountryLeagueConfig {
  const defaultSeason = getDefaultSeason();

  if (countryId) {
    const match = countries.find((c) => c.id === countryId);
    if (match && typeof match.leagueId === 'number') {
      return {
        countryId: match.id,
        leagueId: match.leagueId,
        season: match.season ?? defaultSeason,
      };
    }
  }

  const fallback = countries.find((c) => c.id === DEFAULT_COUNTRY_ID);
  return {
    countryId: DEFAULT_COUNTRY_ID,
    leagueId: fallback?.leagueId ?? DEFAULT_LEAGUE_ID,
    season: fallback?.season ?? defaultSeason,
  };
}

export function getAllCountryLeagues(): CountryLeagueConfig[] {
  const defaultSeason = getDefaultSeason();
  return countries
    .filter((c) => typeof c.leagueId === 'number')
    .map((c) => ({
      countryId: c.id,
      leagueId: c.leagueId as number,
      season: c.season ?? defaultSeason,
    }));
}
