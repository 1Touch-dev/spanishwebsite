import type { MetadataRoute } from 'next';
import { getAllArticleSlugs } from '@/lib/mdx';
import countriesData from '@/data/countries.json';
import type { Country } from '@/types';

const countries = countriesData as Country[];

const STATIC_PATHS = ['', '/news', '/world-cup', '/matches', '/standings'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://futhoy.com';
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: path === '' ? 1 : 0.7,
  }));

  const countryEntries: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${base}/country/${c.id}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: 0.8,
  }));

  const slugs = await getAllArticleSlugs();
  const articleEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${base}/news/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticEntries, ...countryEntries, ...articleEntries];
}
