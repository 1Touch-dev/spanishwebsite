import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { PlayerDetailClient } from '@/components/players/PlayerDetailClient';

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'detail' });
  return {
    title: t('playerTitle', { id }),
    description: t('playerDescription'),
  };
}

export default async function PlayerDetailPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <PlayerDetailClient playerId={id} />;
}
