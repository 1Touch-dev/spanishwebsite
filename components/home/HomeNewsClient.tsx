'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNews } from '@/store/features/newsSlice';
import { HeroCard } from './HeroCard';
import { SideStoryCard } from './SideStoryCard';
import { NewsCard } from './NewsCard';
import { SkeletonCard, Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

export function HomeNewsClient() {
  const dispatch = useAppDispatch();
  const t = useTranslations('home');
  const { articles, status, error } = useAppSelector((s) => s.news);

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchNews());
    }
  }, [dispatch, status]);

  const { hero, sideStories, latestNews } = useMemo(() => {
    const heroPick = articles.find((n) => n.exclusive) ?? articles[0];
    const side = articles.filter((n) => n.id !== heroPick?.id).slice(0, 2);
    const latest = articles
      .filter((n) => n.id !== heroPick?.id && !side.some((s) => s.id === n.id))
      .slice(0, 8);
    return { hero: heroPick, sideStories: side, latestNews: latest };
  }, [articles]);

  if (status === 'loading' && articles.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="aspect-[16/9] w-full rounded-lg" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <ErrorState
        title="No pudimos cargar las noticias"
        message={error ?? 'Inténtalo de nuevo en unos segundos.'}
        onRetry={() => void dispatch(fetchNews())}
      />
    );
  }

  if (status === 'succeeded' && articles.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {hero && <HeroCard item={hero} />}

      {sideStories.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sideStories.map((item) => (
            <SideStoryCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {latestNews.length > 0 && (
        <div>
          <div className="mb-3 flex items-end justify-between border-b border-brand-border pb-2">
            <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-brand-navy">
              {t('latestNews')}
            </h2>
            <Link
              href="/news"
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-red hover:underline"
            >
              {t('seeAll')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {latestNews.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeNewsClient;
