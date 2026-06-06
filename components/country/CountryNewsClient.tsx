import { NewsCard } from '@/components/home/NewsCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Country, NewsItem } from '@/types';

interface CountryNewsClientProps {
  country: Country;
  articles: NewsItem[];
  error?: string | null;
}

export function CountryNewsClient({
  country,
  articles,
  error = null,
}: CountryNewsClientProps) {
  return (
    <section className="mt-6">
      <h2 className="mb-4 font-display text-xl font-extrabold uppercase tracking-tight text-brand-navy">
        Noticias de {country.name}
      </h2>

      {error ? (
        <ErrorState
          title="No pudimos cargar las noticias"
          message={error}
        />
      ) : articles.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          message={`Todavia no hay articulos asignados al endpoint ${country.name}.`}
        />
      ) : (
        <div className="space-y-3">
          {articles.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export default CountryNewsClient;
