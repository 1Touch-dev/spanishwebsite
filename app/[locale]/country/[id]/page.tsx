import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import countriesData from '@/data/countries.json';
import { CountryHeader } from '@/components/country/CountryHeader';
import { CountryNewsClient } from '@/components/country/CountryNewsClient';
import { CountryFootballSection } from '@/components/country/CountryFootballSection';
import type { Country, NewsItem } from '@/types';
import {
  fetchCountryArticles,
  isGolazoProCountryId,
  mapGolazoProArticleToNewsItem,
} from '@/src/lib/cms/golazoProApi';

export const revalidate = 60;

const countries = countriesData as Country[];

type Params = Promise<{ locale: string; id: string }>;

export function generateStaticParams() {
  return countries.flatMap((c) =>
    ['es', 'en'].map((locale) => ({ locale, id: c.id })),
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const country = countries.find((c) => c.id === id);
  if (!country) return {};
  return {
    title: `${country.flag} ${country.name}`,
    description: country.description,
  };
}

export default async function CountryPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const country = countries.find((c) => c.id === id);
  if (!country) notFound();

  let articles: NewsItem[] = [];
  let newsError: string | null = null;

  if (isGolazoProCountryId(id)) {
    try {
      const response = await fetchCountryArticles(id, 1, 30, {
        next: { revalidate: 60 },
      });
      articles = response.data.map(mapGolazoProArticleToNewsItem);
    } catch (error) {
      newsError =
        error instanceof Error ? error.message : 'No pudimos cargar las noticias.';
    }
  }

  return (
    <div className="container-fh py-6">
      <CountryHeader country={country} />
      <CountryFootballSection country={country} />
      <CountryNewsClient country={country} articles={articles} error={newsError} />
    </div>
  );
}
