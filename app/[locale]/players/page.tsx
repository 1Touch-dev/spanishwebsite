import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { TopScorersPageClient } from '@/components/players/TopScorersPageClient';

export const revalidate = 600;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return { title: t('players') };
}

export default async function PlayersPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TopScorersPageClient />;
}
