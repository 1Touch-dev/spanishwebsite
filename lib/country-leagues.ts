import countriesData from '@/data/countries.json';
import type { Country } from '@/types';

const countries = countriesData as Country[];

const DEFAULT_COUNTRY_ID = 'worldcup';
const DEFAULT_LEAGUE_ID = 1;
const DEFAULT_SEASON = 2026;

function getDefaultSeason(): number {
  const raw = process.env.FOOTBALL_API_SEASON;
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return DEFAULT_SEASON;
}

export interface CountryLeagueConfig {
  countryId: string;
  leagueId: number;
  season: number;
}

export function resolveCountryLeague(countryId?: string): CountryLeagueConfig {
  const defaultSeason = getDefaultSeason();

  if (countryId === DEFAULT_COUNTRY_ID) {
    return {
      countryId: DEFAULT_COUNTRY_ID,
      leagueId: DEFAULT_LEAGUE_ID,
      season: defaultSeason,
    };
  }

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

  return {
    countryId: DEFAULT_COUNTRY_ID,
    leagueId: DEFAULT_LEAGUE_ID,
    season: defaultSeason,
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
