import { Logo } from './Logo';
import { Nav } from './Nav';
import { MobileNav } from './MobileNav';
import { LocaleSwitcher } from './LocaleSwitcher';
import { HeaderSearch } from './HeaderSearch';

export function Header() {
  return (
    <header className="sticky top-0 z-40 shadow-md">
      <div className="bg-brand-red text-white">
        <div className="container-fh flex h-14 items-center gap-3 sm:gap-4">
          <Logo size="md" variant="light" />
          <HeaderSearch />
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LocaleSwitcher />
            <MobileNav />
          </div>
        </div>
      </div>
      <Nav />
    </header>
  );
}
