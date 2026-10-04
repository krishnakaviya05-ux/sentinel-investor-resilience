import { MessageSquare, Info } from 'lucide-react';
import type { SafetyResponse } from '../types';

interface SafetyBlockProps {
  response: SafetyResponse;
}

export function SafetyBlock({ response }: SafetyBlockProps) {
  return (
    <div className="w-full max-w-3xl mx-auto animate-slide-up">
      <div className="sentinel-card border-accent/30 bg-accent-muted/10 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-text-primary font-semibold">{response.message}</h3>
            <p className="text-text-muted text-xs mt-0.5">Out-of-scope request detected</p>
          </div>
        </div>

        {/* Guidance */}
        <div className="bg-canvas-900 rounded-lg p-4 border border-border">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
              {response.guidance}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-text-dim text-xs border-t border-border pt-4 leading-relaxed">
          {response.disclaimer}
        </p>
      </div>
    </div>
  );
}
