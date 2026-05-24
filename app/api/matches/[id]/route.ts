import { NextResponse } from 'next/server';
import { fetchMatchDetailPayload } from '@/lib/api-football-cms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = await fetchMatchDetailPayload(id);
    if (!payload.fixture) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (err) {
    console.error('[/api/matches/[id]] error', err);
    return NextResponse.json({ error: 'Failed to load match detail' }, { status: 500 });
  }
}

export async function POST(_req: Request, { params }: RouteParams) {
  return GET(_req, { params });
}
