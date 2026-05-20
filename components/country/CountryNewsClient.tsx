'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNewsByCountry } from '@/store/features/newsSlice';
import { NewsCard } from '@/components/home/NewsCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Country } from '@/types';

interface CountryNewsClientProps {
  country: Country;
}

export function CountryNewsClient({ country }: CountryNewsClientProps) {
  const dispatch = useAppDispatch();
  const t = useTranslations('states');
  const tCountry = useTranslations('country');
  const articles = useAppSelector((s) => s.news.byCountry[country.id] ?? []);
  const status = useAppSelector((s) => s.news.countryStatus[country.id] ?? 'idle');
  const error = useAppSelector((s) => s.news.error);

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchNewsByCountry(country.id));
    }
  }, [country.id, dispatch, status]);

  return (
    <section className="mt-6">
      <h2 className="mb-4 font-display text-xl font-extrabold uppercase tracking-tight text-brand-navy">
        {tCountry('newsTitle', { country: country.name })}
      </h2>

      {status === 'loading' && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {status === 'failed' && (
        <ErrorState
          title={t('errorTitle')}
          message={error ?? t('errorMessage')}
          retryLabel={t('retry')}
          onRetry={() => void dispatch(fetchNewsByCountry(country.id))}
        />
      )}

      {status === 'succeeded' && articles.length === 0 && (
        <EmptyState title={t('emptyTitle')} message={t('emptyMessage')} />
      )}

      {status === 'succeeded' && articles.length > 0 && (
        <div className="space-y-3">
          {articles.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export default CountryNewsClient;
