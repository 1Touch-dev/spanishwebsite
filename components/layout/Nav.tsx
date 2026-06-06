'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export const NAV_LINKS = [
  { key: 'worldCup', href: '/world-cup' },
  { key: 'news', href: '/news' },
  { key: 'matches', href: '/matches' },
  { key: 'standings', href: '/standings' },
  { key: 'players', href: '/players' },
] as const;

export type NavLinkKey = (typeof NAV_LINKS)[number]['key'];

function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href !== '/' && pathname.startsWith(`${href}/`)) return true;
  return false;
}

export function Nav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <nav className="hidden bg-brand-red lg:block">
      <div className="container-fh">
        <ul className="flex items-center gap-0.5 text-sm font-semibold text-white/90">
          {NAV_LINKS.map((link) => {
            const isActive = isNavActive(pathname, link.href);
            return (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className={cn(
                    'inline-flex items-center px-3.5 py-3 transition-colors hover:bg-brand-red-dark hover:text-white xl:px-4',
                    isActive && 'bg-brand-red-dark text-white shadow-inner',
                  )}
                >
                  {t(link.key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
