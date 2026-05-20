'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Algo salió mal',
  message = 'No pudimos cargar los datos. Por favor inténtalo de nuevo.',
  onRetry,
  retryLabel = 'Reintentar',
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <AlertCircle className="h-8 w-8 text-red-600" aria-hidden />
      <h3 className="font-display text-lg font-bold text-red-700">{title}</h3>
      <p className="max-w-md text-sm text-red-600">{message}</p>
      {onRetry ? (
        <Button size="sm" variant="danger" onClick={onRetry} leftIcon={<RefreshCw className="h-4 w-4" />}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default ErrorState;
