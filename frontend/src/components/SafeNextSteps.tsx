import { CheckCircle } from 'lucide-react';

interface SafeNextStepsProps {
  steps: string[];
}

export function SafeNextSteps({ steps }: SafeNextStepsProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div>
      <p className="section-title">Before You Act</p>
      <div className="sentinel-card border-accent/20 bg-accent-muted/20 space-y-2">
        <p className="text-xs text-text-muted mb-4">
          These steps were recommended based on the analysis. Always verify through official sources before taking any action.
        </p>
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-3 py-2 border-b border-border-subtle last:border-0">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-accent font-mono">{idx + 1}</span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
