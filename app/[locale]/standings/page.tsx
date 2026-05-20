import { setRequestLocale } from 'next-intl/server';
import { StandingsClient } from '@/components/matches/StandingsClient';

export const revalidate = 600;

export async function generateMetadata() {
  return { title: 'Clasificación La Liga' };
}

export default async function StandingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <StandingsClient />;
}
