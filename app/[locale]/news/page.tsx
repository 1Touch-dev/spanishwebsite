import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { NewsListingClient } from '@/components/news/NewsListingClient';
import { ErrorState } from '@/components/ui/ErrorState';
import { fetchNewsArticles, type GolazoProArticle } from '@/src/lib/cms/golazoProApi';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return {
    title: t('news'),
    description: 'Ultimas noticias del futbol del mundo hispano',
  };
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'nav' });
  const tSite = await getTranslations({ locale, namespace: 'site' });

  let articles: GolazoProArticle[] = [];
  let loadError: string | null = null;

  try {
    const response = await fetchNewsArticles(1, 30, {
      next: { revalidate: 60 },
    });
    articles = response.data;
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'No pudimos cargar las noticias.';
  }

  if (loadError) {
    return (
      <section className="container-fh py-6">
        <ErrorState
          title="No pudimos cargar las noticias"
          message={loadError}
        />
      </section>
    );
  }

  return (
    <NewsListingClient
      articles={articles}
      title={t('news')}
      description={tSite('tagline')}
    />
  );
}
