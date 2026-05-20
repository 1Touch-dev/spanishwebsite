import type { LiveMatch, MatchStatus, StandingRow, TopScorer } from '@/types';
import { FOOTBALL_ENDPOINTS } from './football-endpoints';

/**
 * Server-side client for the API-Football CMS proxy.
 *
 * The proxy (`api.labenditaec.com`) holds the API-Football key on the backend,
 * so this client must NEVER send an API key header. The browser only ever
 * talks to our own Next.js API routes, which call this module server-side.
 *
 * Responses may be wrapped as `{ response: [...] }` (raw API-Football shape)
 * or `{ data: [...] }` (CMS wrapper). `extractResponse` normalises both.
 */

const DEFAULT_BASE_URL = 'https://api.labenditaec.com/api/football';

function getBaseUrl(): string {
  return process.env.FOOTBALL_API_BASE_URL || DEFAULT_BASE_URL;
}

interface CmsFetchOptions {
  revalidate?: number;
  signal?: AbortSignal;
}

export async function cmsFetch<T = unknown>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  options: CmsFetchOptions = {},
): Promise<T | null> {
  const base = getBaseUrl().replace(/\/$/, '');
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}${qs ? `?${qs}` : ''}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: options.revalidate ?? 60 },
      signal: options.signal,
    });
    if (!res.ok) {
      console.error(`[api-football-cms] ${path} -> ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[api-football-cms] error ${path}:`, (err as Error).message);
    return null;
  }
}

export function extractResponse<T>(payload: unknown): T[] {
  if (!payload || typeof payload !== 'object') return [];
  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.response)) return obj.response as T[];
  if (Array.isArray(obj.data)) return obj.data as T[];
  if (Array.isArray(obj.results)) return obj.results as T[];
  if (Array.isArray(payload)) return payload as T[];
  return [];
}

// ---------- API-Football response shapes ----------

interface ApiFootballTeam {
  id: number;
  name: string;
  logo?: string;
}

export interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long?: string; elapsed?: number | null };
  };
  league: { id: number; name: string; round?: string; logo?: string };
  teams: {
    home: ApiFootballTeam & { winner?: boolean | null };
    away: ApiFootballTeam & { winner?: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score?: {
    fulltime?: { home: number | null; away: number | null };
    halftime?: { home: number | null; away: number | null };
  };
}

interface ApiFootballStandingRow {
  rank: number;
  team: ApiFootballTeam;
  points: number;
  goalsDiff: number;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals?: { for?: number; against?: number };
  };
}

interface ApiFootballStandingsLeague {
  league: {
    id: number;
    name: string;
    standings: ApiFootballStandingRow[][];
  };
}

interface ApiFootballTopScorer {
  player: { id: number; name: string; photo?: string };
  statistics: Array<{
    team: ApiFootballTeam;
    goals: { total: number | null };
  }>;
}

// ---------- Mappers ----------

const STATUS_MAP: Record<string, MatchStatus> = {
  NS: 'SCHEDULED',
  TBD: 'SCHEDULED',
  '1H': 'IN_PLAY',
  '2H': 'IN_PLAY',
  ET: 'IN_PLAY',
  P: 'IN_PLAY',
  LIVE: 'LIVE',
  HT: 'HT',
  BT: 'PAUSED',
  SUSP: 'PAUSED',
  INT: 'PAUSED',
  FT: 'FT',
  AET: 'FINISHED',
  PEN: 'FINISHED',
  PST: 'SCHEDULED',
  CANC: 'FINISHED',
  ABD: 'FINISHED',
  AWD: 'FINISHED',
  WO: 'FINISHED',
};

export function mapFixtureToLiveMatch(fx: ApiFootballFixture): LiveMatch {
  const short = fx.fixture?.status?.short ?? 'NS';
  const status: MatchStatus = STATUS_MAP[short] ?? 'SCHEDULED';
  return {
    id: fx.fixture.id,
    competition: fx.league?.name ?? '',
    homeTeam: fx.teams.home.name,
    awayTeam: fx.teams.away.name,
    homeCrest: fx.teams.home.logo,
    awayCrest: fx.teams.away.logo,
    homeScore: fx.goals?.home ?? fx.score?.fulltime?.home ?? null,
    awayScore: fx.goals?.away ?? fx.score?.fulltime?.away ?? null,
    status,
    minute:
      typeof fx.fixture?.status?.elapsed === 'number'
        ? String(fx.fixture.status.elapsed)
        : undefined,
    utcDate: fx.fixture.date,
  };
}

export function mapStandingsToRows(payload: unknown): StandingRow[] {
  const leagues = extractResponse<ApiFootballStandingsLeague>(payload);
  const table = leagues[0]?.league?.standings?.[0];
  if (!Array.isArray(table)) return [];

  return table.map((row) => ({
    position: row.rank,
    team: row.team.name,
    teamShort: row.team.name,
    crest: row.team.logo,
    played: row.all.played,
    won: row.all.win,
    draw: row.all.draw,
    lost: row.all.lose,
    goalDifference: row.goalsDiff,
    points: row.points,
  }));
}

export function mapTopScorersToRows(payload: unknown, limit = 10): TopScorer[] {
  const players = extractResponse<ApiFootballTopScorer>(payload);
  return players.slice(0, limit).map((p) => {
    const stat = p.statistics?.[0];
    return {
      name: p.player.name,
      team: stat?.team?.name ?? '',
      goals: stat?.goals?.total ?? 0,
      crest: stat?.team?.logo,
      photo: p.player.photo,
    };
  });
}

// ---------- Public fetchers ----------

export async function fetchCmsStandings(
  leagueId: number,
  season: number,
): Promise<StandingRow[] | null> {
  const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.standings, {
    league: leagueId,
    season,
  }, { revalidate: 600 });
  if (!payload) return null;
  const rows = mapStandingsToRows(payload);
  return rows.length > 0 ? rows : null;
}

export async function fetchCmsTopScorers(
  leagueId: number,
  season: number,
  limit = 10,
): Promise<TopScorer[] | null> {
  const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.topScorers, {
    league: leagueId,
    season,
  }, { revalidate: 3600 });
  if (!payload) return null;
  const rows = mapTopScorersToRows(payload, limit);
  return rows.length > 0 ? rows : null;
}

/**
 * Fetches the global live fixtures feed (`GET /live`) and optionally narrows
 * to a single league. The proxy's `/live` endpoint does not accept query
 * params, so any per-league filtering must happen client-side here.
 */
export async function fetchCmsLiveMatches(
  leagueId?: number,
): Promise<LiveMatch[] | null> {
  const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.live, {}, {
    revalidate: 30,
  });
  if (!payload) return null;
  const fixtures = extractResponse<ApiFootballFixture>(payload);
  const filtered = leagueId
    ? fixtures.filter((f) => f.league?.id === leagueId)
    : fixtures;
  return filtered.map(mapFixtureToLiveMatch);
}

export async function fetchCmsFixtures(
  leagueId: number,
  season: number,
  params: { next?: number; last?: number; from?: string; to?: string } = {},
): Promise<LiveMatch[] | null> {
  const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.fixtures, {
    league: leagueId,
    season,
    ...params,
  }, { revalidate: 60 });
  if (!payload) return null;
  const fixtures = extractResponse<ApiFootballFixture>(payload);
  return fixtures.map(mapFixtureToLiveMatch);
}

/**
 * Returns a merged list of live + recent + upcoming fixtures for a league.
 * Used as the primary feed for the matches widget when a country is selected.
 */
export async function fetchCmsMatchesForLeague(
  leagueId: number,
  season: number,
  tab: 'live' | 'upcoming' | 'results' = 'live',
): Promise<LiveMatch[] | null> {
  if (tab === 'live') {
    const live = await fetchCmsLiveMatches(leagueId);
    if (live && live.length > 0) return live;
    const upcoming = await fetchCmsFixtures(leagueId, season, { next: 5 });
    const recent = await fetchCmsFixtures(leagueId, season, { last: 5 });
    const merged = [...(upcoming ?? []), ...(recent ?? [])];
    return merged.length > 0 ? merged : null;
  }
  if (tab === 'upcoming') {
    return fetchCmsFixtures(leagueId, season, { next: 10 });
  }
  return fetchCmsFixtures(leagueId, season, { last: 10 });
}
