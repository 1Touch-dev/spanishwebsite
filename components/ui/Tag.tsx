import { cn } from '@/lib/utils';

const TAG_COLORS: Record<string, string> = {
  'La Liga': 'bg-brand-red',
  Champions: 'bg-blue-800',
  UCL: 'bg-blue-800',
  Mundial: 'bg-emerald-700',
  'World Cup': 'bg-emerald-700',
  'World Cup 2026': 'bg-emerald-700',
  FIFA: 'bg-emerald-700',
  Fichajes: 'bg-violet-700',
  Seleccion: 'bg-amber-600',
  'Selecci\u00f3n': 'bg-amber-600',
  Analisis: 'bg-cyan-700',
  'An\u00e1lisis': 'bg-cyan-700',
  'Copa America': 'bg-emerald-600',
  'Copa Am\u00e9rica': 'bg-emerald-600',
  'Real Madrid': 'bg-slate-800',
  Barca: 'bg-blue-700',
  'Bar\u00e7a': 'bg-blue-700',
  Atletico: 'bg-red-700',
  'Atl\u00e9tico': 'bg-red-700',
  CONMEBOL: 'bg-emerald-700'
};

interface TagProps {
  label: string;
  className?: string;
}

export function Tag({ label, className }: TagProps) {
  const color = TAG_COLORS[label] || 'bg-slate-700';
  return <span className={cn('tag-pill', color, className)}>{label}</span>;
}
