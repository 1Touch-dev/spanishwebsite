import { NextResponse } from 'next/server';
import countriesData from '@/data/countries.json';
import { getAggregatedNews } from '@/lib/rss';
import { getArticlesAsNewsItems } from '@/lib/mdx';
import type { Country, NewsItem } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const countries = countriesData as Country[];

function matchesCountry(item: NewsItem, country: Country): boolean {
  const haystack = `${item.title} ${item.excerpt ?? ''} ${String(item.tag ?? '')}`.toLowerCase();
  return country.keywords.some((k) => haystack.includes(k.toLowerCase()));
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const country = countries.find((c) => c.id === id);
    if (!country) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    }

    const [rss, internal] = await Promise.all([
      getAggregatedNews(),
      getArticlesAsNewsItems(),
    ]);
    const merged = [...internal, ...rss];
    const filtered = merged
      .filter((item) => matchesCountry(item, country))
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return NextResponse.json(filtered, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('[/api/country/[id]] error', err);
    return NextResponse.json({ error: 'Failed to load country news' }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return POST(_req, { params });
}
