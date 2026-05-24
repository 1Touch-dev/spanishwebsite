import { NextResponse } from 'next/server';
import { fetchCmsPlayerById, fetchCmsPlayerFixtures } from '@/lib/api-football-cms';
import type { PlayerDetailPayload } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteParams = { params: Promise<{ id: string }> };

async function buildPayload(id: string): Promise<PlayerDetailPayload> {
  const [playerData, fixtures] = await Promise.all([
    fetchCmsPlayerById(id),
    fetchCmsPlayerFixtures(id),
  ]);

  return {
    player: playerData.player,
    statistics: playerData.statistics,
    recentFixtures: fixtures ?? [],
  };
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = await buildPayload(id);
    if (!payload.player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('[/api/players/[id]] error', err);
    return NextResponse.json({ error: 'Failed to load player' }, { status: 500 });
  }
}

export async function POST(_req: Request, { params }: RouteParams) {
  return GET(_req, { params });
}
