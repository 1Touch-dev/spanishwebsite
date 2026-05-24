'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNews } from '@/store/features/newsSlice';
import { NewsCard } from '@/components/home/NewsCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

function matchesQuery(
  item: { title?: string; excerpt?: string; tag?: unknown; source?: string },
  query: string,
): boolean {
  const haystack = `${item.title ?? ''} ${item.excerpt ?? ''} ${String(item.tag ?? '')} ${item.source ?? ''}`.toLowerCase();
  return haystack.includes(query);
}

function SearchResults() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const t = useTranslations('search');
  const tStates = useTranslations('states');
  const qParam = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(qParam);

  const { articles, status, error } = useAppSelector((s) => s.news);

  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchNews());
    }
  }, [dispatch, status]);

  const trimmed = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!trimmed) return [];
    return articles.filter((item) => matchesQuery(item, trimmed));
  }, [articles, trimmed]);

  if (!trimmed) {
    return (
      <p className="container-fh py-12 text-center text-sm text-slate-500">{t('useHeaderSearch')}</p>
    );
  }

  return (
    <section className="container-fh py-8">
      <p className="text-sm font-semibold text-slate-600">
        {t('resultsFor', { query })}
      </p>

      {status === 'loading' && articles.length === 0 && (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {status === 'failed' && (
        <div className="mt-6">
          <ErrorState
            title={tStates('errorTitle')}
            message={error ?? tStates('errorMessage')}
            retryLabel={tStates('retry')}
            onRetry={() => void dispatch(fetchNews())}
          />
        </div>
      )}

      {status === 'succeeded' && results.length === 0 && (
        <div className="mt-6">
          <EmptyState title={t('noResultsTitle')} message={t('noResultsMessage', { query })} />
        </div>
      )}

      {status === 'succeeded' && results.length > 0 && (
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

export function SearchClient() {
  return (
    <Suspense
      fallback={
        <div className="container-fh py-8">
          <Skeleton className="h-8 w-48" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}

export default SearchClient;
