import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
}

export function EmptyState({
  title = 'Sin resultados',
  message = 'No encontramos noticias para esta sección todavía. Vuelve más tarde.',
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="text-slate-400">{icon ?? <Inbox className="h-8 w-8" aria-hidden />}</div>
      <h3 className="font-display text-lg font-bold text-brand-navy">{title}</h3>
      <p className="max-w-md text-sm text-slate-500">{message}</p>
    </div>
  );
}

export default EmptyState;
