import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { TeamDetailClient } from '@/components/teams/TeamDetailClient';

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'detail' });
  return {
    title: t('teamTitle', { id }),
    description: t('teamDescription'),
  };
}

export default async function TeamDetailPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <TeamDetailClient teamId={id} />;
}
