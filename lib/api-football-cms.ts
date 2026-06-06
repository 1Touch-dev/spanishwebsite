import type {
  FixtureDetail,
  LiveMatch,
  MatchDetailPayload,
  MatchEvent,
  MatchLineup,
  MatchStat,
  MatchStatus,
  PlayerInfo,
  PlayerStatistics,
  SquadPlayer,
  StandingRow,
  TeamInfo,
  TopScorer,
} from '@/types';
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
  league: { id: number; name: string; season?: number; round?: string; logo?: string };
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
  group?: string;
  team: ApiFootballTeam;
  points: number;
  goalsDiff: number;
  form?: string;
  description?: string;
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
    homeTeamId: fx.teams.home.id,
    awayTeamId: fx.teams.away.id,
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
  const groups = leagues[0]?.league?.standings;
  if (!Array.isArray(groups)) return [];

  return groups.flatMap((table, index) => {
    if (!Array.isArray(table)) return [];

    return table.map((row) => ({
      position: row.rank,
      group: row.group || `Group ${String.fromCharCode(65 + index)}`,
      team: row.team.name,
      teamShort: row.team.name,
      teamId: row.team.id,
      crest: row.team.logo,
      played: row.all.played,
      won: row.all.win,
      draw: row.all.draw,
      lost: row.all.lose,
      goalDifference: row.goalsDiff,
      points: row.points,
      form: row.form,
      description: row.description,
    }));
  });
}

export function mapTopScorersToRows(payload: unknown, limit = 10): TopScorer[] {
  const players = extractResponse<ApiFootballTopScorer>(payload);
  return players.slice(0, limit).map((p) => {
    const stat = p.statistics?.[0];
    return {
      name: p.player.name,
      playerId: p.player.id,
      team: stat?.team?.name ?? '',
      teamId: stat?.team?.id,
      goals: stat?.goals?.total ?? 0,
      crest: stat?.team?.logo,
      photo: p.player.photo,
    };
  });
}

function getDefaultSeason(): number {
  const raw = process.env.FOOTBALL_API_SEASON;
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 2026;
}

// ---------- Detail page fetchers ----------

function mergePreferFetched<T>(fetched: T[], embedded: T[]): T[] {
  return fetched.length > 0 ? fetched : embedded;
}

export async function fetchCmsFixtureRaw(fixtureId: string): Promise<unknown | null> {
  const id = fixtureId.trim();
  const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.fixtures, { id }, { revalidate: 60 });
  const fixtures = extractResponse<unknown>(payload);
  return fixtures[0] ?? null;
}

/** Normalise CMS / API-Football fixture documents to {@link FixtureDetail}. */
export function normalizeFixtureDetail(raw: unknown): FixtureDetail | null {
  if (!raw || typeof raw !== 'object') return null;
  const doc = raw as Record<string, unknown>;

  if (doc.teams && doc.league && doc.goals) {
    const inner = doc.fixture;
    if (inner && typeof inner === 'object') {
      const fx = inner as Record<string, unknown>;
      if (fx.fixture && typeof fx.fixture === 'object') {
        const core = fx.fixture as FixtureDetail['fixture'];
        return {
          fixture: {
            ...core,
            venue:
              (fx.venue as FixtureDetail['fixture']['venue']) ??
              core.venue ??
              null,
          },
          league: (doc.league ?? fx.league) as FixtureDetail['league'],
          teams: doc.teams as FixtureDetail['teams'],
          goals: doc.goals as FixtureDetail['goals'],
          score: (doc.score ?? fx.score) as FixtureDetail['score'],
        };
      }
      return {
        fixture: inner as FixtureDetail['fixture'],
        league: doc.league as FixtureDetail['league'],
        teams: doc.teams as FixtureDetail['teams'],
        goals: doc.goals as FixtureDetail['goals'],
        score: doc.score as FixtureDetail['score'],
      };
    }
  }

  return null;
}

export function extractFixtureEmbedded(raw: unknown): {
  events: MatchEvent[];
  stats: MatchStat[];
  lineups: MatchLineup[];
} {
  if (!raw || typeof raw !== 'object') {
    return { events: [], stats: [], lineups: [] };
  }
  const doc = raw as Record<string, unknown>;
  return {
    events: Array.isArray(doc.events) ? (doc.events as MatchEvent[]) : [],
    stats: Array.isArray(doc.statistics) ? (doc.statistics as MatchStat[]) : [],
    lineups: Array.isArray(doc.lineups) ? (doc.lineups as MatchLineup[]) : [],
  };
}

export async function fetchCmsFixtureById(fixtureId: string): Promise<FixtureDetail | null> {
  const raw = await fetchCmsFixtureRaw(fixtureId);
  return normalizeFixtureDetail(raw);
}

export async function fetchCmsLineups(fixtureId: string): Promise<MatchLineup[]> {
  const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.lineups, {
    fixture: fixtureId,
  }, { revalidate: 60 });
  if (!payload) return [];
  return extractResponse<MatchLineup>(payload);
}

export async function fetchCmsEvents(fixtureId: string): Promise<MatchEvent[]> {
  const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.events, {
    fixture: fixtureId,
  }, { revalidate: 60 });
  if (!payload) return [];
  return extractResponse<MatchEvent>(payload);
}

export async function fetchCmsMatchStats(fixtureId: string): Promise<MatchStat[]> {
  const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.stats, {
    fixture: fixtureId,
  }, { revalidate: 60 });
  if (!payload) return [];
  return extractResponse<MatchStat>(payload);
}

export async function fetchCmsH2H(fixtureId: string): Promise<FixtureDetail[]> {
  const fixture = await fetchCmsFixtureById(fixtureId);
  const homeId = fixture?.teams?.home?.id;
  const awayId = fixture?.teams?.away?.id;
  if (!homeId || !awayId) return [];
  const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.headToHead, {
    h2h: `${homeId}-${awayId}`,
    last: 5,
  }, { revalidate: 300 });
  if (!payload) return [];
  return extractResponse<ApiFootballFixture>(payload) as FixtureDetail[];
}

/** Aggregates fixture + lineups + events + stats + H2H with embedded CMS fallbacks. */
export async function fetchMatchDetailPayload(fixtureId: string): Promise<MatchDetailPayload> {
  const raw = await fetchCmsFixtureRaw(fixtureId);
  const fixture = normalizeFixtureDetail(raw);
  const embedded = extractFixtureEmbedded(raw);

  const [lineups, events, stats] = await Promise.all([
    fetchCmsLineups(fixtureId),
    fetchCmsEvents(fixtureId),
    fetchCmsMatchStats(fixtureId),
  ]);

  let h2h: FixtureDetail[] = [];
  const homeId = fixture?.teams?.home?.id;
  const awayId = fixture?.teams?.away?.id;
  if (homeId && awayId) {
    const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.headToHead, {
      h2h: `${homeId}-${awayId}`,
      last: 5,
    }, { revalidate: 300 });
    if (payload) {
      h2h = extractResponse<ApiFootballFixture>(payload) as FixtureDetail[];
    }
  }

  return {
    fixture,
    lineups: mergePreferFetched(lineups, embedded.lineups),
    events: mergePreferFetched(events, embedded.events),
    stats: mergePreferFetched(stats, embedded.stats),
    h2h,
  };
}

export async function fetchCmsPlayerById(playerId: string): Promise<{
  player: PlayerInfo | null;
  statistics: PlayerStatistics[];
}> {
  const season = getDefaultSeason();
  const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.players, {
    id: playerId,
    season,
  }, { revalidate: 300 });
  if (!payload) return { player: null, statistics: [] };

  interface ApiPlayerResponse {
    player: PlayerInfo;
    statistics: PlayerStatistics[];
  }
  const entries = extractResponse<ApiPlayerResponse>(payload);
  const first = entries[0];
  if (!first) return { player: null, statistics: [] };
  return {
    player: first.player ?? null,
    statistics: first.statistics ?? [],
  };
}

export async function fetchCmsPlayerFixtures(playerId: string): Promise<LiveMatch[] | null> {
  const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.fixtures, {
    player: playerId,
    last: 5,
  }, { revalidate: 120 });
  if (!payload) return null;
  const fixtures = extractResponse<ApiFootballFixture>(payload);
  return fixtures.map(mapFixtureToLiveMatch);
}

export async function fetchCmsTeamById(teamId: string): Promise<TeamInfo | null> {
  const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.teams, {
    id: teamId,
  }, { revalidate: 300 });
  if (!payload) {
    const alt = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.teams, { team: teamId }, {
      revalidate: 300,
    });
    if (!alt) return null;
    const teams = extractResponse<{ team: TeamInfo }>(alt);
    return teams[0]?.team ?? (extractResponse<TeamInfo>(alt)[0] ?? null);
  }
  const wrapped = extractResponse<{ team: TeamInfo }>(payload);
  if (wrapped[0]?.team) return wrapped[0].team;
  return extractResponse<TeamInfo>(payload)[0] ?? null;
}

export async function fetchCmsTeamSquad(teamId: string): Promise<SquadPlayer[]> {
  const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.playersSquads, {
    team: teamId,
  }, { revalidate: 600 });
  if (!payload) return [];

  interface SquadResponse {
    team?: TeamInfo;
    players?: SquadPlayer[];
  }
  const entries = extractResponse<SquadResponse>(payload);
  const first = entries[0];
  if (first?.players?.length) return first.players;
  return extractResponse<SquadPlayer>(payload);
}

export async function fetchCmsTeamFixtures(
  teamId: string,
  params: { next?: number; last?: number; season?: number } = {},
): Promise<LiveMatch[] | null> {
  const season = params.season ?? getDefaultSeason();
  const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.fixtures, {
    team: teamId,
    season,
    ...(params.next ? { next: params.next } : {}),
    ...(params.last ? { last: params.last } : {}),
  }, { revalidate: 60 });
  if (!payload) return null;
  const fixtures = extractResponse<ApiFootballFixture>(payload);
  return fixtures.map(mapFixtureToLiveMatch);
}

export async function resolveTeamLeagueFromFixtures(
  teamId: string,
): Promise<{ leagueId: number; season: number } | null> {
  const recent = await fetchCmsTeamFixtures(teamId, { last: 1 });
  if (!recent?.length) return null;
  const payload = await cmsFetch<unknown>(FOOTBALL_ENDPOINTS.fixtures, {
    id: recent[0].id,
  }, { revalidate: 300 });
  const fixtures = extractResponse<ApiFootballFixture>(payload);
  const fx = fixtures[0];
  if (!fx?.league?.id) return null;
  return {
    leagueId: fx.league.id,
    season: fx.league.season ?? getDefaultSeason(),
  };
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
