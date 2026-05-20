import { NextResponse } from 'next/server';
import { getAggregatedNews } from '@/lib/rss';
import { getArticlesAsNewsItems } from '@/lib/mdx';
import type { NewsItem } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function buildPayload(category?: string): Promise<NewsItem[]> {
  const [rss, internal] = await Promise.all([
    getAggregatedNews(),
    getArticlesAsNewsItems(),
  ]);

  const merged: NewsItem[] = [...internal, ...rss].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  );

  if (!category) return merged;

  const lower = category.toLowerCase();
  return merged.filter((n) => String(n.tag ?? '').toLowerCase().includes(lower));
}

export async function POST(req: Request) {
  try {
    let category: string | undefined;
    try {
      const body = await req.json();
      if (body && typeof body.category === 'string') {
        category = body.category;
      }
    } catch {
    }

    const items = await buildPayload(category);
    return NextResponse.json(items, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('[/api/news] error', err);
    return NextResponse.json({ error: 'Failed to load news' }, { status: 500 });
  }
}

export async function GET() {
  const items = await buildPayload();
  return NextResponse.json(items);
}
