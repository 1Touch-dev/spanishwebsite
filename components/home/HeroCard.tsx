'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Tag } from '@/components/ui/Tag';
import { RelativeTime } from '@/components/ui/RelativeTime';
import type { NewsItem } from '@/lib/types';

interface HeroCardProps {
  item: NewsItem;
}

export function HeroCard({ item }: HeroCardProps) {
  const t = useTranslations('home');
  const isExclusive = item.exclusive;

  const content = (
    <>
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-105"
          loading="eager"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/70 to-brand-navy/30" />

      <div className="relative flex min-h-[280px] flex-col justify-between p-6 sm:min-h-[340px] sm:p-8">
        <div className="flex items-center justify-between">
          {isExclusive ? (
            <span className="tag-pill bg-brand-red text-white">{t('exclusive')}</span>
          ) : (
            <span />
          )}
          {item.tag && <Tag label={String(item.tag)} />}
        </div>

        <div className="text-white">
          <h2 className="font-display text-2xl font-extrabold leading-tight text-balance sm:text-3xl md:text-4xl">
            {item.title}
          </h2>
          <p className="mt-3 text-sm text-white/80">
            {item.author && (
              <>
                <span>Por {item.author}</span>
                <span className="mx-2 opacity-50">·</span>
              </>
            )}
            <RelativeTime date={item.pubDate} className="inline" />
          </p>
          {item.excerpt && (
            <p className="mt-3 hidden text-sm text-white/85 sm:block line-clamp-2">{item.excerpt}</p>
          )}
        </div>
      </div>
    </>
  );

  if (item.isInternal) {
    return (
      <Link
        href={item.url}
        className="group relative block overflow-hidden rounded-lg bg-brand-navy shadow-card transition-shadow hover:shadow-card-hover"
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-lg bg-brand-navy shadow-card transition-shadow hover:shadow-card-hover"
    >
      {content}
    </a>
  );
}
