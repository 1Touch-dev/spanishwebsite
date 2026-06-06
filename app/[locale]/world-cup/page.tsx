import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/Badge';
import { NewsListingClient } from '@/components/news/NewsListingClient';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  fetchWorldCupArticles,
  type GolazoProArticle,
} from '@/src/lib/cms/golazoProApi';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return {
    title: t('worldCup'),
    description: 'Coverage of FIFA World Cup 2026 news, fixtures, standings and stars.',
  };
}

export default async function WorldCupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  let articles: GolazoProArticle[] = [];
  let loadError: string | null = null;

  try {
    const response = await fetchWorldCupArticles(1, 30, {
      next: { revalidate: 60 },
    });
    articles = response.data;
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Could not load news.';
  }

  return (
    <div>
      <header className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 py-10">
        <div className="container-fh">
          <Badge variant="navy" className="mb-3">
            FIFA
          </Badge>
          <h1 className="font-display text-4xl font-extrabold text-brand-navy md:text-5xl">
            {tNav('worldCup')}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-brand-navy/80">
            Daily coverage of FIFA World Cup 2026 with matchday updates, group drama and breakout stars.
          </p>
        </div>
      </header>

      {loadError ? (
        <section className="container-fh py-6">
          <ErrorState title="Could not load the news" message={loadError} />
        </section>
      ) : (
        <NewsListingClient articles={articles} showTabs={false} />
      )}
    </div>
  );
}
