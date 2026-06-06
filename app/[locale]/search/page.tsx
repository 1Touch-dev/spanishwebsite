import { setRequestLocale, getTranslations } from 'next-intl/server';
import { NewsCard } from '@/components/home/NewsCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  mapGolazoProArticleToNewsItem,
  searchArticles,
  type GolazoProArticle,
} from '@/src/lib/cms/golazoProApi';

export const revalidate = 60;

export async function generateMetadata() {
  return { title: 'Search' };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'search' });
  const query = q?.trim() ?? '';

  if (!query) {
    return (
      <p className="container-fh py-12 text-center text-sm text-slate-500">
        {t('useHeaderSearch')}
      </p>
    );
  }

  let articles: GolazoProArticle[] = [];
  let loadError: string | null = null;

  try {
    const response = await searchArticles(query, { limit: 40 }, {
      next: { revalidate: 60 },
    });
    articles = response.data;
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'No pudimos cargar la busqueda.';
  }

  const results = articles.map(mapGolazoProArticleToNewsItem);

  return (
    <section className="container-fh py-8">
      <p className="text-sm font-semibold text-slate-600">
        {t('resultsFor', { query })}
      </p>

      {loadError ? (
        <div className="mt-6">
          <ErrorState
            title="No pudimos cargar la busqueda"
            message={loadError}
          />
        </div>
      ) : results.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t('noResultsTitle')} message={t('noResultsMessage', { query })} />
        </div>
      ) : (
        <div className="mt-6">
          <p className="mb-4 text-sm font-semibold text-slate-600">
            {t('resultsCount', { count: results.length })}
          </p>
          <div className="space-y-3">
            {results.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
