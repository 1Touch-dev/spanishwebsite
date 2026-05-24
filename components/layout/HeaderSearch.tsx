'use client';

import { FormEvent, useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

export function HeaderSearch() {
  const t = useTranslations('search');
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setQuery('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-w-0 flex-1 max-w-[140px] items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 sm:max-w-[200px] md:max-w-xs lg:max-w-sm"
      role="search"
    >
      <Search className="h-4 w-4 shrink-0 text-white/80" aria-hidden />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('placeholderShort')}
        className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
        aria-label={t('placeholder')}
      />
    </form>
  );
}

export default HeaderSearch;
