import { setRequestLocale } from 'next-intl/server';
import { SearchClient } from '@/components/search/SearchClient';

export const revalidate = 300;

export async function generateMetadata() {
  return { title: 'Search' };
}

export default async function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SearchClient />;
}
