'use client';

import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, activeId, onChange, className }: TabsProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              suppressHydrationWarning
              onClick={() => onChange(item.id)}
              className={cn(
                'whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
                active
                  ? 'border-brand-red bg-brand-red text-white shadow-sm'
                  : 'border-slate-200 bg-white text-brand-navy hover:border-brand-red/40 hover:text-brand-red',
              )}
            >
              {item.label}
              {typeof item.count === 'number' ? (
                <span
                  className={cn(
                    'ml-2 rounded-full px-1.5 py-0.5 text-xs font-bold',
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600',
                  )}
                >
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Tabs;
