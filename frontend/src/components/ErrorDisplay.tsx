import { AlertTriangle, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import type { ApiError } from '../types';

interface ErrorDisplayProps {
  error: ApiError;
  onRetry: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const isNetwork = error.type === 'network';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full max-w-3xl mx-auto animate-fade-in"
    >
      <div className="sentinel-card border-risk-high-border bg-risk-high-bg flex flex-col items-center text-center py-10 gap-5">
        <div className="w-12 h-12 rounded-xl bg-risk-high/10 border border-risk-high-border flex items-center justify-center">
          {isNetwork ? (
            <WifiOff className="w-6 h-6 text-risk-high" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-risk-high" />
          )}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-text-primary font-semibold text-base">
            {isNetwork ? 'Unable to reach SENTINEL' : error.message}
          </h3>
          <p className="text-text-secondary text-sm max-w-sm">
            {isNetwork
              ? 'Make sure the backend is running at localhost:8000.'
              : error.details || 'Please check your input and try again.'}
          </p>
        </div>

        {error.type === 'validation' && (
          <div className="flex items-center gap-2 bg-canvas-800 border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary">
            <AlertCircle className="w-4 h-4 text-risk-medium flex-shrink-0" />
            {error.details}
          </div>
        )}

        <button onClick={onRetry} className="btn-primary">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
