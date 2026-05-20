import { Badge } from '@/components/ui/Badge';
import type { Country } from '@/types';

interface CountryHeaderProps {
  country: Country;
}

export function CountryHeader({ country }: CountryHeaderProps) {
  return (
    <header className="rounded-2xl bg-gradient-to-r from-brand-navy via-brand-navy to-slate-800 px-6 py-8 text-white shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="text-5xl" aria-hidden>
            {country.flag}
          </span>
          <div>
            <h1 className="font-display text-3xl font-extrabold leading-tight md:text-4xl">
              {country.name}
            </h1>
            {country.description && (
              <p className="mt-1 max-w-xl text-sm text-white/80">{country.description}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {country.leagues.map((league) => (
            <Badge key={league} variant="yellow">
              {league}
            </Badge>
          ))}
        </div>
      </div>
    </header>
  );
}

export default CountryHeader;
