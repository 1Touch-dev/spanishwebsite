import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { NewsListingClient } from '@/components/news/NewsListingClient';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return {
    title: t('worldCup'),
    description: 'Cobertura completa de la Copa del Mundo de la FIFA',
  };
}

export default async function WorldCupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  return (
    <div>
      <header className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 py-10">
        <div className="container-fh">
          <Badge variant="navy" className="mb-3">
            FIFA
          </Badge>
          <h1 className="font-display text-4xl font-extrabold text-brand-navy md:text-5xl">
            {tNav('worldCup')}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-brand-navy/80">
            Toda la actualidad del torneo más importante del fútbol mundial.
          </p>
        </div>
      </header>

      <NewsListingClient initialFilter="worldCup" />
    </div>
  );
}
