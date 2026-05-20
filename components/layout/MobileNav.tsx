'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import { HydrationSafeButton } from '@/components/ui/HydrationSafeButton';
import { NAV_LINKS } from './Nav';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('nav');

  return (
    <>
      <HydrationSafeButton
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex items-center justify-center rounded p-2 text-white hover:bg-brand-red-dark"
        aria-label="Abrir menú"
      >
        <Menu className="h-6 w-6 shrink-0" aria-hidden />
      </HydrationSafeButton>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-brand-navy text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="font-display text-lg font-bold">Menú</span>
              <HydrationSafeButton
                onClick={() => setOpen(false)}
                className="rounded p-1 hover:bg-white/10"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5 shrink-0" aria-hidden />
              </HydrationSafeButton>
            </div>
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 border-b border-white/5 px-4 py-3 text-sm font-semibold hover:bg-white/5"
                  >
                    {link.flag ? <span aria-hidden>{link.flag}</span> : null}
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
