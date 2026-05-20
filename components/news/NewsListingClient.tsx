'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNews } from '@/store/features/newsSlice';
import { NewsCard } from '@/components/home/NewsCard';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

type FilterId = 'all' | 'laliga' | 'champions' | 'worldCup' | 'transfers' | 'national' | 'analysis';

const FILTER_MATCHERS: Record<FilterId, string[]> = {
  all: [],
  laliga: ['la liga', 'real madrid', 'barça', 'barca', 'atlético', 'atletico'],
  champions: ['champions', 'uefa'],
  worldCup: ['mundial', 'world cup', 'copa del mundo'],
  transfers: ['fichaje', 'fichajes', 'transfer'],
  national: ['selección', 'seleccion', 'la roja', 'albiceleste', 'tricolor', 'cafetero', 'blanquirroja'],
  analysis: ['análisis', 'analisis'],
};

function matchesFilter(item: { title?: string; excerpt?: string; tag?: unknown }, filter: FilterId): boolean {
  if (filter === 'all') return true;
  const haystack = `${item.title ?? ''} ${item.excerpt ?? ''} ${String(item.tag ?? '')}`.toLowerCase();
  return FILTER_MATCHERS[filter].some((needle) => haystack.includes(needle));
}

interface NewsListingClientProps {
  initialFilter?: FilterId;
  title?: string;
  description?: string;
}

export function NewsListingClient({
  initialFilter = 'all',
  title,
  description,
}: NewsListingClientProps) {
  const dispatch = useAppDispatch();
  const t = useTranslations('filters');
  const tStates = useTranslations('states');
  const [filter, setFilter] = useState<FilterId>(initialFilter);

  const { articles, status, error } = useAppSelector((s) => s.news);

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchNews());
    }
  }, [dispatch, status]);

  const filtered = useMemo(
    () => articles.filter((item) => matchesFilter(item, filter)),
    [articles, filter],
  );

  const tabItems: TabItem[] = useMemo(
    () => [
      { id: 'all', label: t('all'), count: articles.length },
      { id: 'laliga', label: t('laliga') },
      { id: 'champions', label: t('champions') },
      { id: 'worldCup', label: t('worldCup') },
      { id: 'transfers', label: t('transfers') },
      { id: 'national', label: t('national') },
      { id: 'analysis', label: t('analysis') },
    ],
    [articles.length, t],
  );

  return (
    <section className="container-fh py-6">
      {(title || description) && (
        <header className="mb-6">
          {title && (
            <h1 className="font-display text-3xl font-extrabold text-brand-navy md:text-4xl">
              {title}
            </h1>
          )}
          {description && <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>}
        </header>
      )}

      <Tabs
        items={tabItems}
        activeId={filter}
        onChange={(id) => setFilter(id as FilterId)}
        className="mb-6"
      />

      {status === 'loading' && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {status === 'failed' && (
        <ErrorState
          title={tStates('errorTitle')}
          message={error ?? tStates('errorMessage')}
          retryLabel={tStates('retry')}
          onRetry={() => void dispatch(fetchNews())}
        />
      )}

      {status === 'succeeded' && filtered.length === 0 && (
        <EmptyState title={tStates('emptyTitle')} message={tStates('emptyMessage')} />
      )}

      {status === 'succeeded' && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export default NewsListingClient;
