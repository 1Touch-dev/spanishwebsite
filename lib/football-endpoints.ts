/**
 * Path constants for the API-Football CMS proxy.
 *
 * Mirrors the "API-Football CMS Collection" Postman collection
 * (workspace: Admintkcorp's Workspace). Paths are relative to
 * `FOOTBALL_API_BASE_URL` (default: https://api.labenditaec.com/api/football).
 *
 * Keep this list aligned with the Postman collection so endpoint names
 * never drift away from the proxy contract.
 */

export const FOOTBALL_ENDPOINTS = {
  leagues: '/leagues',
  teams: '/teams',
  standings: '/standings',
  fixtures: '/fixtures',
  live: '/live',
  topScorers: '/topscorers',
  topAssists: '/topassists',
  topCards: '/topcards',
  rounds: '/rounds',
  venues: '/venues',
  match: '/match',
  lineups: '/lineups',
  events: '/events',
  stats: '/stats',
  playersPerformance: '/players-performance',
  playersSquads: '/players-squads',
  playersStatistics: '/players-statistics',
  players: '/players',
  predictions: '/predictions',
  odds: '/odds',
  coach: '/coach',
  sidelined: '/sidelined',
  injuries: '/injuries',
  trophies: '/trophies',
  transfers: '/transfers',
  headToHead: '/headtohead',
  countries: '/countries',
  seasons: '/seasons',
  timezone: '/timezone',
  bookmakers: '/bookmakers',
  bets: '/bets',
} as const;

export type FootballEndpoint = (typeof FOOTBALL_ENDPOINTS)[keyof typeof FOOTBALL_ENDPOINTS];
