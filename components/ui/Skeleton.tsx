import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-700/40',
        className,
      )}
    />
  );
}

interface SkeletonCardProps {
  withImage?: boolean;
  className?: string;
}

export function SkeletonCard({ withImage = true, className }: SkeletonCardProps) {
  return (
    <div className={cn('space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm', className)}>
      {withImage ? <Skeleton className="aspect-video w-full" /> : null}
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

interface SkeletonListProps {
  count?: number;
  className?: string;
  itemClassName?: string;
  withImage?: boolean;
}

export function SkeletonList({ count = 4, className, itemClassName, withImage = true }: SkeletonListProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} withImage={withImage} className={itemClassName} />
      ))}
    </div>
  );
}

export default Skeleton;
