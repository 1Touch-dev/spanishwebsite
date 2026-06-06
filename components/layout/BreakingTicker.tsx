'use client';

import { useTranslations } from 'next-intl';
import { Zap } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { NewsItem } from '@/lib/types';

interface BreakingTickerProps {
  items: NewsItem[];
}

export function BreakingTicker({ items }: BreakingTickerProps) {
  const t = useTranslations('ticker');

  if (!items.length) return null;

  const tickerItems = [...items, ...items];

  return (
    <div className="border-b border-yellow-600/30 bg-brand-yellow text-brand-navy">
      <div className="container-fh flex items-stretch overflow-hidden">
        <div className="flex shrink-0 items-center gap-1.5 bg-brand-yellow-dark px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider">
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span>{t('label')}</span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-track py-1.5 text-sm font-medium">
            {tickerItems.map((item, idx) =>
              item.isInternal ? (
                <Link
                  key={`${item.id}-${idx}`}
                  href={item.url}
                  className="inline-flex items-center gap-2 hover:underline"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />
                  <span>{item.title}</span>
                </Link>
              ) : (
                <a
                  key={`${item.id}-${idx}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:underline"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />
                  <span>{item.title}</span>
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
