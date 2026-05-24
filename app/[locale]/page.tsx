import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { HomeNewsClient } from '@/components/home/HomeNewsClient';
import { HighlightVideoCard } from '@/components/home/HighlightVideoCard';
import { LiveScoresWidget } from '@/components/sidebar/LiveScoresWidget';
import { HomeSidebarData } from '@/components/sidebar/HomeSidebarData';

export const revalidate = 300;

const HIGHLIGHTS = [
  {
    title: 'Gol olímpico de Mbappé',
    subtitle: 'Real Madrid 3-1 Barça',
    duration: '2:34',
    thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: 'Barça aplasta al Bayern',
    subtitle: 'Champions League',
    duration: '4:12',
    thumbnail: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: 'Resumen Jornada 34',
    subtitle: 'La Liga',
    duration: '1:58',
    thumbnail: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&q=80&auto=format&fit=crop',
  },
];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');

  return (
    <div className="container-fh py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-6">
          <HomeNewsClient />

          <div>
            <div className="mb-3 flex items-end justify-between border-b border-brand-border pb-2">
              <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-brand-navy">
                {t('highlightsOfDay')}
              </h2>
              <Link
                href="/news"
                className="inline-flex items-center gap-1 text-sm font-bold text-brand-red hover:underline"
              >
                {t('seeMore')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {HIGHLIGHTS.map((h, idx) => (
                <HighlightVideoCard key={idx} {...h} />
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
