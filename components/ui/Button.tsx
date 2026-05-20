'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand-red text-white hover:bg-red-700 focus-visible:ring-brand-red shadow-sm',
  secondary:
    'bg-brand-navy text-white hover:bg-slate-800 focus-visible:ring-brand-navy',
  outline:
    'border border-slate-300 text-brand-navy bg-white hover:bg-slate-50 focus-visible:ring-brand-navy',
  ghost:
    'text-brand-navy hover:bg-slate-100 focus-visible:ring-brand-navy',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = 'primary', size = 'md', leftIcon, rightIcon, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      suppressHydrationWarning
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {leftIcon ? <span className="-ml-1 flex items-center">{leftIcon}</span> : null}
      {children}
      {rightIcon ? <span className="-mr-1 flex items-center">{rightIcon}</span> : null}
    </button>
  );
});

export default Button;
