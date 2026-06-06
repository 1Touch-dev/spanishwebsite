import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { HighlightVideoCard } from '@/components/home/HighlightVideoCard';
import { HeroCard } from '@/components/home/HeroCard';
import { SideStoryCard } from '@/components/home/SideStoryCard';
import { NewsCard } from '@/components/home/NewsCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { LiveScoresWidget } from '@/components/sidebar/LiveScoresWidget';
import { HomeSidebarData } from '@/components/sidebar/HomeSidebarData';
import type { NewsItem } from '@/types';
import {
  fetchWorldCupArticles,
  mapGolazoProArticleToNewsItem,
} from '@/src/lib/cms/golazoProApi';

export const revalidate = 60;

const HIGHLIGHTS = [
  {
    title: 'Road to the Final',
    subtitle: 'FIFA World Cup 2026',
    duration: '3:08',
    thumbnail:
      'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=600&q=80&auto=format&fit=crop',
    href: '/world-cup',
  },
  {
    title: 'Group Stage Storylines',
    subtitle: 'Mexico, USA and Canada',
    duration: '4:21',
    thumbnail:
      'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=600&q=80&auto=format&fit=crop',
    href: '/standings',
  },
  {
    title: 'Stars to Watch',
    subtitle: 'World Cup 2026',
    duration: '2:41',
    thumbnail:
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&q=80&auto=format&fit=crop',
    href: '/players',
  },
];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  let loadError: string | null = null;
  let articles: NewsItem[] = [];

  try {
    const response = await fetchWorldCupArticles(1, 9, {
      next: { revalidate: 60 },
    });
    articles = response.data.map(mapGolazoProArticleToNewsItem);
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Could not load news.';
  }

  const hero = articles[0];
  const sideStories = articles.slice(1, 3);
  const latestNews = articles.slice(3, 9);

  return (
    <div className="container-fh py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          {loadError ? (
            <ErrorState title="Could not load the news" message={loadError} />
          ) : articles.length === 0 ? (
            <EmptyState
              title="No featured stories"
              message="There are no World Cup 2026 stories available yet."
            />
          ) : (
            <>
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
            </>
          )}

          <div>
            <div className="mb-3 flex items-end justify-between border-b border-brand-border pb-2">
              <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-brand-navy">
                {t('highlightsOfDay')}
              </h2>
              <Link
                href="/world-cup"
                className="inline-flex items-center gap-1 text-sm font-bold text-brand-red hover:underline"
              >
                {t('seeMore')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {HIGHLIGHTS.map((highlight, idx) => (
                <HighlightVideoCard key={idx} {...highlight} />
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          <LiveScoresWidget />
          <HomeSidebarData />
        </aside>
      </div>
    </div>
  );
}
