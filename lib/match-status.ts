import type { FixtureDetail, LiveMatch } from '@/types';

const UPCOMING = new Set(['NS', 'TBD', 'PST']);
const LIVE = new Set(['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT']);
const FINISHED = new Set(['FT', 'AET', 'PEN', 'CANC', 'ABD', 'AWD', 'WO']);

export function isUpcomingFixture(match: FixtureDetail): boolean {
  return UPCOMING.has(match.fixture.status.short);
}

export function isLiveFixture(match: FixtureDetail): boolean {
  return LIVE.has(match.fixture.status.short);
}

export function isFinishedFixture(match: FixtureDetail): boolean {
  return FINISHED.has(match.fixture.status.short);
}

export function defaultMatchDetailTab(match: FixtureDetail): 'events' | 'lineups' | 'stats' | 'h2h' {
  if (isUpcomingFixture(match)) return 'h2h';
  if (isLiveFixture(match)) return 'events';
  return 'events';
}

export function showLiveMatchScores(match: LiveMatch): boolean {
  return (
    match.status === 'IN_PLAY' ||
    match.status === 'LIVE' ||
    match.status === 'HT' ||
    match.status === 'PAUSED' ||
    match.status === 'FT' ||
    match.status === 'FINISHED'
  );
}
