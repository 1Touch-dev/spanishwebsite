'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export const NAV_LINKS = [
  { key: 'news', href: '/news', flag: null },
  { key: 'worldCup', href: '/world-cup', flag: null },
  { key: 'mexico', href: '/country/mexico', flag: '🇲🇽' },
  { key: 'colombia', href: '/country/colombia', flag: '🇨🇴' },
  { key: 'argentina', href: '/country/argentina', flag: '🇦🇷' },
  { key: 'spain', href: '/country/spain', flag: '🇪🇸' },
  { key: 'peru', href: '/country/peru', flag: '🇵🇪' },
] as const;

export function Nav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <nav className="hidden lg:block bg-brand-red">
      <div className="container-fh">
        <ul className="flex items-center gap-1 text-sm font-semibold text-white/90">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-3 transition-colors hover:bg-brand-red-dark hover:text-white',
                    isActive && 'bg-brand-red-dark text-white shadow-inner',
                  )}
                >
                  {link.flag ? <span aria-hidden>{link.flag}</span> : null}
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
