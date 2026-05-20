'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
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

export function SearchClient() {
  const dispatch = useAppDispatch();
  const t = useTranslations('search');
  const tStates = useTranslations('states');
  const [query, setQuery] = useState('');

  const { articles, status, error } = useAppSelector((s) => s.news);

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

  return (
    <section className="container-fh py-8">
      <h1 className="font-display text-3xl font-extrabold text-brand-navy">{t('title')}</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-600">{t('subtitle')}</p>

      <div className="relative mt-6 max-w-2xl">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('placeholder')}
          autoFocus
          className="w-full rounded-xl border border-brand-border bg-white py-3 pl-12 pr-4 text-brand-navy shadow-card outline-none transition-shadow focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
          aria-label={t('placeholder')}
        />
      </div>

      {status === 'loading' && articles.length === 0 && (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {status === 'failed' && (
        <div className="mt-8">
          <ErrorState
            title={tStates('errorTitle')}
            message={error ?? tStates('errorMessage')}
            retryLabel={tStates('retry')}
            onRetry={() => void dispatch(fetchNews())}
          />
        </div>
      )}

      {status === 'succeeded' && trimmed && results.length === 0 && (
        <div className="mt-8">
          <EmptyState title={t('noResultsTitle')} message={t('noResultsMessage', { query })} />
        </div>
      )}

      {status === 'succeeded' && trimmed && results.length > 0 && (
        <div className="mt-8">
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

      {status === 'succeeded' && !trimmed && (
        <p className="mt-8 text-sm text-slate-500">{t('hint')}</p>
      )}
    </section>
  );
}

export default SearchClient;
