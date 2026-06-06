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
      const order = {
        IN_PLAY: 0,
        LIVE: 0,
        PAUSED: 1,
        FINISHED: 2,
        FT: 2,
        HT: 0,
        SCHEDULED: 3,
      } as Record<string, number>;
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
  { position: 1, group: 'Group A', team: 'Mexico', teamShort: 'Mexico', played: 3, won: 2, draw: 1, lost: 0, goalDifference: 4, points: 7 },
  { position: 2, group: 'Group A', team: 'Switzerland', teamShort: 'Switzerland', played: 3, won: 1, draw: 2, lost: 0, goalDifference: 2, points: 5 },
  { position: 1, group: 'Group B', team: 'Spain', teamShort: 'Spain', played: 3, won: 2, draw: 1, lost: 0, goalDifference: 5, points: 7 },
  { position: 2, group: 'Group B', team: 'Japan', teamShort: 'Japan', played: 3, won: 2, draw: 0, lost: 1, goalDifference: 1, points: 6 },
  { position: 1, group: 'Group C', team: 'Argentina', teamShort: 'Argentina', played: 3, won: 3, draw: 0, lost: 0, goalDifference: 6, points: 9 },
  { position: 2, group: 'Group C', team: 'Poland', teamShort: 'Poland', played: 3, won: 1, draw: 1, lost: 1, goalDifference: 0, points: 4 },
  { position: 1, group: 'Group D', team: 'France', teamShort: 'France', played: 3, won: 2, draw: 0, lost: 1, goalDifference: 3, points: 6 },
  { position: 2, group: 'Group D', team: 'Denmark', teamShort: 'Denmark', played: 3, won: 1, draw: 1, lost: 1, goalDifference: 1, points: 4 },
];

const FALLBACK_MATCHES: LiveMatch[] = [
  {
    id: 1,
    competition: 'FIFA World Cup 2026',
    homeTeam: 'Mexico',
    awayTeam: 'Switzerland',
    homeScore: 2,
    awayScore: 1,
    status: 'FINISHED',
    utcDate: new Date().toISOString(),
  },
  {
    id: 2,
    competition: 'FIFA World Cup 2026',
    homeTeam: 'Spain',
    awayTeam: 'Japan',
    homeScore: 1,
    awayScore: 1,
    status: 'HT',
    utcDate: new Date().toISOString(),
  },
  {
    id: 3,
    competition: 'FIFA World Cup 2026',
    homeTeam: 'Argentina',
    awayTeam: 'Poland',
    homeScore: null,
    awayScore: null,
    status: 'SCHEDULED',
    utcDate: new Date().toISOString(),
  },
];

const FALLBACK_SCORERS: TopScorer[] = [
  { name: 'K. Mbappe', team: 'France', goals: 4 },
  { name: 'L. Messi', team: 'Argentina', goals: 4 },
  { name: 'A. Morata', team: 'Spain', goals: 3 },
  { name: 'S. Gimenez', team: 'Mexico', goals: 3 },
  { name: 'K. Havertz', team: 'Germany', goals: 2 },
];
