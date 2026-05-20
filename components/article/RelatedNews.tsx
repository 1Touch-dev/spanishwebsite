import { Link } from '@/i18n/navigation';
import { Tag } from '@/components/ui/Tag';
import { RelativeTime } from '@/components/ui/RelativeTime';
import type { Article } from '@/lib/types';

interface RelatedNewsProps {
  articles: Article[];
}

export function RelatedNews({ articles }: RelatedNewsProps) {
  if (!articles.length) return null;
  return (
    <section className="mx-auto mt-12 max-w-3xl">
      <h2 className="mb-4 border-b border-brand-border pb-2 font-display text-xl font-extrabold uppercase tracking-tight text-brand-navy">
        Noticias relacionadas
      </h2>
      <div className="space-y-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/news/${article.slug}`}
            className="group flex gap-4 rounded-lg bg-white p-4 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5"
          >
            {article.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.image}
                alt=""
                className="h-20 w-28 shrink-0 rounded-md object-cover"
                loading="lazy"
              />
            )}
            <div className="flex-1 min-w-0">
              <Tag label={String(article.tag)} />
              <h3 className="mt-2 font-display text-base font-bold leading-snug text-brand-navy group-hover:text-brand-red line-clamp-2">
                {article.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                <RelativeTime date={article.date} />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
