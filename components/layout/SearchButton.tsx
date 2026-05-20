'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function SearchButton() {
  const t = useTranslations('nav');

  return (
    <Link
      href="/search"
      className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
      aria-label={t('search')}
    >
      <Search className="h-4 w-4 shrink-0" aria-hidden />
      <span>{t('search')}</span>
    </Link>
  );
}
