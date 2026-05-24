import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MatchDetailClient } from '@/components/matches/MatchDetailClient';

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'detail' });
  return {
    title: t('matchTitle', { id }),
    description: t('matchDescription'),
  };
}

export default async function MatchDetailPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <MatchDetailClient matchId={id} />;
}
