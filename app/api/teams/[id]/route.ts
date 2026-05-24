import { NextResponse } from 'next/server';
import {
  fetchCmsStandings,
  fetchCmsTeamById,
  fetchCmsTeamFixtures,
  fetchCmsTeamSquad,
  resolveTeamLeagueFromFixtures,
} from '@/lib/api-football-cms';
import type { TeamDetailPayload } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteParams = { params: Promise<{ id: string }> };

async function buildPayload(id: string): Promise<TeamDetailPayload> {
  const [team, squad, fixtures, results] = await Promise.all([
    fetchCmsTeamById(id),
    fetchCmsTeamSquad(id),
    fetchCmsTeamFixtures(id, { next: 5 }),
    fetchCmsTeamFixtures(id, { last: 5 }),
  ]);

  const leagueCtx = await resolveTeamLeagueFromFixtures(id);
  let standings: TeamDetailPayload['standings'] = [];
  if (leagueCtx) {
    standings = (await fetchCmsStandings(leagueCtx.leagueId, leagueCtx.season)) ?? [];
  }

  return {
    team,
    squad,
    fixtures: fixtures ?? [],
    results: results ?? [],
    standings,
    leagueId: leagueCtx?.leagueId,
    season: leagueCtx?.season,
  };
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = await buildPayload(id);
    if (!payload.team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('[/api/teams/[id]] error', err);
    return NextResponse.json({ error: 'Failed to load team' }, { status: 500 });
  }
}

export async function POST(_req: Request, { params }: RouteParams) {
  return GET(_req, { params });
}
