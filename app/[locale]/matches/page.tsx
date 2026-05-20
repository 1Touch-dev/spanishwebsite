import { setRequestLocale } from 'next-intl/server';
import { MatchesClient } from '@/components/matches/MatchesClient';

export const revalidate = 60;

export async function generateMetadata() {
  return { title: 'Resultados en vivo' };
}

export default async function MatchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MatchesClient />;
}
