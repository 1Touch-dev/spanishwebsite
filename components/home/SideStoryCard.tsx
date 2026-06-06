import { Link } from '@/i18n/navigation';
import { Tag } from '@/components/ui/Tag';
import { RelativeTime } from '@/components/ui/RelativeTime';
import type { NewsItem } from '@/lib/types';

interface SideStoryCardProps {
  item: NewsItem;
}

export function SideStoryCard({ item }: SideStoryCardProps) {
  const content = (
    <>
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35 transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/70 to-brand-navy/20" />

      <div className="relative flex min-h-[180px] flex-col justify-between p-4">
        <div>{item.tag && <Tag label={String(item.tag)} />}</div>
        <div className="text-white">
          <h3 className="font-display text-base font-bold leading-snug text-balance sm:text-lg line-clamp-3">
            {item.title}
          </h3>
          <p className="mt-2 text-xs uppercase tracking-wide text-white/70">
            {item.source}
            <span className="mx-1.5 opacity-50">·</span>
            <RelativeTime date={item.pubDate} className="inline" />
          </p>
        </div>
      </div>
    </>
  );

  if (item.isInternal) {
    return (
      <Link
        href={item.url}
        className="group relative block h-full overflow-hidden rounded-lg bg-brand-navy shadow-card transition-shadow hover:shadow-card-hover"
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
      className="group relative block h-full overflow-hidden rounded-lg bg-brand-navy shadow-card transition-shadow hover:shadow-card-hover"
    >
      {content}
    </a>
  );
}
