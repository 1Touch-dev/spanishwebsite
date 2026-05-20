import { cache } from 'react';
import type { LiveMatch, StandingRow, TopScorer } from './types';
import { createTimedCache } from './memory-cache';
import { resolveCountryLeague } from './country-leagues';
import {
  fetchCmsLiveMatches,
  fetchCmsMatchesForLeague,
  fetchCmsStandings,
  fetchCmsTopScorers,
} from './api-football-cms';

const FOOTBALL_DATA_BASE = 'https://api.football-data.org/v4';
const LA_LIGA_CODE = 'PD';
const UCL_CODE = 'CL';

function getToken(): string | undefined {
  return process.env.FOOTBALL_DATA_TOKEN;
}

async function fdFetch<T>(path: string): Promise<T | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${FOOTBALL_DATA_BASE}${path}`, {
      headers: { 'X-Auth-Token': token },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error(`[football-data] ${path} -> ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[football-data] error ${path}:`, (err as Error).message);
    return null;
  }
}

// ---------- Keyed memory caches (per country/tab) ----------

const standingsCaches = new Map<string, ReturnType<typeof createTimedCache<StandingRow[]>>>();
const matchesCaches = new Map<string, ReturnType<typeof createTimedCache<LiveMatch[]>>>();
const scorersCaches = new Map<string, ReturnType<typeof createTimedCache<TopScorer[]>>>();

function getStandingsCache(key: string) {
  let c = standingsCaches.get(key);
  if (!c) {
    c = createTimedCache<StandingRow[]>(10 * 60 * 1000);
    standingsCaches.set(key, c);
  }
  return c;
}

function getMatchesCache(key: string) {
  let c = matchesCaches.get(key);
  if (!c) {
    c = createTimedCache<LiveMatch[]>(60 * 1000);
    matchesCaches.set(key, c);
  }
  return c;
}

function getScorersCache(key: string) {
  let c = scorersCaches.get(key);
  if (!c) {
    c = createTimedCache<TopScorer[]>(60 * 60 * 1000);
    scorersCaches.set(key, c);
  }
  return c;
}

// ---------- Football-Data.org (fallback) types ----------

interface FDStandingsResponse {
  standings: Array<{
    type: string;
    table: Array<{
      position: number;
      team: { id: number; name: string; shortName: string; tla: string; crest: string };
      playedGames: number;
      won: number;
      draw: number;
      lost: number;
      goalDifference: number;
      points: number;
    }>;
  }>;
}

interface FDMatchesResponse {
  matches: Array<{
    id: number;
    competition: { name: string };
    homeTeam: { name: string; shortName: string; crest: string };
    awayTeam: { name: string; shortName: string; crest: string };
    score: {
      fullTime: { home: number | null; away: number | null };
      halfTime?: { home: number | null; away: number | null };
    };
    status: string;
    minute?: string;
    utcDate: string;
    matchday?: number;
  }>;
}

interface FDScorersResponse {
  scorers: Array<{
    player: { name: string };
    team: { name: string; shortName: string; crest: string };
    goals: number;
  }>;
}

async function fetchStandingsFromFD(): Promise<StandingRow[] | null> {
  const data = await fdFetch<FDStandingsResponse>(`/competitions/${LA_LIGA_CODE}/standings`);
  if (!data) return null;
  const totalTable = data.standings.find((s) => s.type === 'TOTAL');
  if (!totalTable) return null;
  return totalTable.table.map((row) => ({
    position: row.position,
    team: row.team.name,
    teamShort: row.team.shortName || row.team.tla,
    crest: row.team.crest,
    played: row.playedGames,
    won: row.won,
    draw: row.draw,
    lost: row.lost,
    goalDifference: row.goalDifference,
    points: row.points,
  }));
}

async function fetchLiveMatchesFromFD(): Promise<LiveMatch[] | null> {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 1);
  const to = new Date(today);
  to.setDate(to.getDate() + 1);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const data = await fdFetch<FDMatchesResponse>(
    `/matches?dateFrom=${fmt(from)}&dateTo=${fmt(to)}&competitions=${LA_LIGA_CODE},${UCL_CODE}`,
  );
  if (!data) return null;

  return data.matches
    .map((m): LiveMatch => ({
      id: m.id,
      competition: m.competition.name,
      homeTeam: m.homeTeam.shortName || m.homeTeam.name,
      awayTeam: m.awayTeam.shortName || m.awayTeam.name,
      homeCrest: m.homeTeam.crest,
      awayCrest: m.awayTeam.crest,
      homeScore: m.score.fullTime.home,
      awayScore: m.score.fullTime.away,
      status: m.status as LiveMatch['status'],
      minute: m.minute,
      utcDate: m.utcDate,
    }))
    .sort((a, b) => {
      const order = { IN_PLAY: 0, LIVE: 0, PAUSED: 1, FINISHED: 2, FT: 2, HT: 0, SCHEDULED: 3 } as Record<string, number>;
      return (order[a.status] ?? 4) - (order[b.status] ?? 4);
    });
}

async function fetchTopScorersFromFD(): Promise<TopScorer[] | null> {
  const data = await fdFetch<FDScorersResponse>(`/competitions/${LA_LIGA_CODE}/scorers?limit=10`);
  if (!data) return null;
  return data.scorers.map((s) => ({
    name: s.player.name,
    team: s.team.shortName || s.team.name,
    goals: s.goals,
    crest: s.team.crest,
  }));
}

// ---------- Public API (cached + countryId-aware) ----------

export const getStandings = cache(async (countryId?: string): Promise<StandingRow[]> => {
  const cfg = resolveCountryLeague(countryId);
  const key = `${cfg.countryId}:${cfg.leagueId}:${cfg.season}`;
  return getStandingsCache(key)(async () => {
    const cms = await fetchCmsStandings(cfg.leagueId, cfg.season);
    if (cms && cms.length > 0) return cms;

    if (cfg.countryId === 'spain') {
      const fd = await fetchStandingsFromFD();
      if (fd && fd.length > 0) return fd;
    }
    return FALLBACK_STANDINGS;
  });
});

export const getTopScorers = cache(async (countryId?: string): Promise<TopScorer[]> => {
  const cfg = resolveCountryLeague(countryId);
  const key = `${cfg.countryId}:${cfg.leagueId}:${cfg.season}`;
  return getScorersCache(key)(async () => {
    const cms = await fetchCmsTopScorers(cfg.leagueId, cfg.season);
    if (cms && cms.length > 0) return cms;

    if (cfg.countryId === 'spain') {
      const fd = await fetchTopScorersFromFD();
      if (fd && fd.length > 0) return fd;
    }
    return FALLBACK_SCORERS;
  });
});

export const getLiveMatches = cache(
  async (
    countryId?: string,
    tab: 'live' | 'upcoming' | 'results' = 'live',
  ): Promise<LiveMatch[]> => {
    const cfg = resolveCountryLeague(countryId);
    const key = `${cfg.countryId}:${cfg.leagueId}:${cfg.season}:${tab}`;
    return getMatchesCache(key)(async () => {
      const cms = await fetchCmsMatchesForLeague(cfg.leagueId, cfg.season, tab);
      if (cms && cms.length > 0) return cms;

      if (cfg.countryId === 'spain') {
        if (tab === 'live') {
          const liveOnly = await fetchCmsLiveMatches(cfg.leagueId);
          if (liveOnly && liveOnly.length > 0) return liveOnly;
        }
        const fd = await fetchLiveMatchesFromFD();
        if (fd && fd.length > 0) return fd;
      }
      return FALLBACK_MATCHES;
    });
  },
);

// ---------- Fallback Data (used when no API token / CMS) ----------

const FALLBACK_STANDINGS: StandingRow[] = [
  { position: 1, team: 'Real Madrid CF', teamShort: 'Real Madrid', played: 34, won: 26, draw: 6, lost: 2, goalDifference: 46, points: 84 },
  { position: 2, team: 'FC Barcelona', teamShort: 'Barcelona', played: 34, won: 24, draw: 6, lost: 4, goalDifference: 38, points: 78 },
  { position: 3, team: 'Atlético de Madrid', teamShort: 'Atlético', played: 34, won: 21, draw: 7, lost: 6, goalDifference: 29, points: 70 },
  { position: 4, team: 'Athletic Club', teamShort: 'Athletic', played: 34, won: 19, draw: 9, lost: 6, goalDifference: 12, points: 66 },
  { position: 5, team: 'Villarreal CF', teamShort: 'Villarreal', played: 34, won: 17, draw: 9, lost: 8, goalDifference: 8, points: 60 },
  { position: 6, team: 'Real Sociedad', teamShort: 'R. Sociedad', played: 34, won: 16, draw: 8, lost: 10, goalDifference: 4, points: 56 },
  { position: 7, team: 'Real Betis', teamShort: 'Betis', played: 34, won: 14, draw: 11, lost: 9, goalDifference: 2, points: 53 },
  { position: 8, team: 'Valencia CF', teamShort: 'Valencia', played: 34, won: 14, draw: 8, lost: 12, goalDifference: -1, points: 50 },
];

const FALLBACK_MATCHES: LiveMatch[] = [
  {
    id: 1,
    competition: 'La Liga',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeScore: 3,
    awayScore: 1,
    status: 'FINISHED',
    utcDate: new Date().toISOString(),
  },
  {
    id: 2,
    competition: 'La Liga',
    homeTeam: 'Atlético',
    awayTeam: 'Sevilla',
    homeScore: 2,
    awayScore: 2,
    status: 'FT',
    utcDate: new Date().toISOString(),
  },
  {
    id: 3,
    competition: 'Champions League',
    homeTeam: 'Barcelona',
    awayTeam: 'Bayern',
    homeScore: 4,
    awayScore: 0,
    status: 'FINISHED',
    utcDate: new Date().toISOString(),
  },
];

const FALLBACK_SCORERS: TopScorer[] = [
  { name: 'K. Mbappé', team: 'Real Madrid', goals: 27 },
  { name: 'R. Lewandowski', team: 'Barcelona', goals: 23 },
  { name: 'A. Griezmann', team: 'Atlético', goals: 19 },
  { name: 'V. Williams', team: 'Athletic', goals: 16 },
  { name: 'A. Morata', team: 'Atlético', goals: 14 },
];
