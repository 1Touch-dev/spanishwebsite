import { NextResponse, type NextRequest } from 'next/server';
import { getStandings, getTopScorers } from '@/lib/football-api';
import type { RankingsPayload } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function buildPayload(countryId?: string): Promise<RankingsPayload> {
  const [standings, topScorers] = await Promise.all([
    getStandings(countryId),
    getTopScorers(countryId),
  ]);
  return { standings, topScorers };
}

async function readBody(req: NextRequest): Promise<{ countryId?: string }> {
  try {
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== 'object') return {};
    const obj = raw as Record<string, unknown>;
    return {
      countryId: typeof obj.countryId === 'string' ? obj.countryId : undefined,
    };
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  try {
    const { countryId } = await readBody(req);
    const payload = await buildPayload(countryId);
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800' },
    });
  } catch (err) {
    console.error('[/api/rankings] error', err);
    return NextResponse.json({ error: 'Failed to load rankings' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const countryId = url.searchParams.get('countryId') ?? undefined;
  const payload = await buildPayload(countryId);
  return NextResponse.json(payload);
}
