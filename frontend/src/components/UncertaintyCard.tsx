import { HelpCircle } from 'lucide-react';

interface UncertaintyCardProps {
  uncertainty: string;
}

export function UncertaintyCard({ uncertainty }: UncertaintyCardProps) {
  if (!uncertainty) return null;

  return (
    <div>
      <p className="section-title">What SENTINEL Cannot Confirm</p>
      <div className="sentinel-card-subtle border-border-bright">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-canvas-700 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-4 h-4 text-text-secondary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Uncertainty Statement
            </p>
            <p className="text-text-secondary text-sm leading-relaxed">
              {uncertainty}
            </p>
            <p className="text-text-dim text-xs mt-3 italic">
              SENTINEL communicates uncertainty honestly. This is intentional — responsible AI does not claim false certainty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
