import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'red' | 'yellow' | 'navy' | 'outline' | 'live' | 'muted';

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-brand-navy text-white',
  red: 'bg-brand-red text-white',
  yellow: 'bg-brand-yellow text-brand-navy',
  navy: 'bg-brand-navy text-white',
  outline: 'border border-slate-300 text-brand-navy bg-white',
  live: 'bg-emerald-500 text-white animate-pulse',
  muted: 'bg-slate-100 text-slate-700',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
