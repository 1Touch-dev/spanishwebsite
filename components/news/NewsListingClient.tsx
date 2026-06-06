'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { NewsCard } from '@/components/home/NewsCard';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  mapGolazoProArticleToNewsItem,
  type GolazoProArticle,
} from '@/src/lib/cms/golazoProApi';
import { filterArticlesByTab, type NewsTab } from '@/src/lib/cms/newsTabs';

interface NewsListingClientProps {
  articles: GolazoProArticle[];
  initialFilter?: NewsTab;
  title?: string;
  description?: string;
  showTabs?: boolean;
}

export function NewsListingClient({
  articles,
  initialFilter = 'all',
  title,
  description,
  showTabs = true,
}: NewsListingClientProps) {
  const t = useTranslations('filters');
  const tStates = useTranslations('states');
  const [filter, setFilter] = useState<NewsTab>(initialFilter);

  const filtered = useMemo(
    () => filterArticlesByTab(articles, filter),
    [articles, filter],
  );

  const displayArticles = useMemo(
    () => filtered.map(mapGolazoProArticleToNewsItem),
    [filtered],
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

      {showTabs && (
        <Tabs
          items={tabItems}
          activeId={filter}
          onChange={(id) => setFilter(id as NewsTab)}
          className="mb-6"
        />
      )}

      {displayArticles.length === 0 && (
        <EmptyState title={tStates('emptyTitle')} message={tStates('emptyMessage')} />
      )}

      {displayArticles.length > 0 && (
        <div className="space-y-3">
          {displayArticles.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export default NewsListingClient;
