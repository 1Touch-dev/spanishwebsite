'use client';

interface MatchDetailEmptyProps {
  title: string;
  message: string;
  icon?: string;
}

export function MatchDetailEmpty({ title, message, icon = '⚽' }: MatchDetailEmptyProps) {
  return (
    <div className="rounded-xl border border-dashed border-brand-border bg-brand-surface/60 px-6 py-10 text-center">
      <span className="text-3xl" aria-hidden>
        {icon}
      </span>
      <p className="mt-3 font-display text-base font-bold text-brand-navy">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
    </div>
  );
}

export default MatchDetailEmpty;
