import type { RiskIndicator } from '../types';
import { getSeverityConfig, getIndicatorIcon } from '../utils/display';

interface RiskIndicatorsProps {
  indicators: RiskIndicator[];
}

export function RiskIndicators({ indicators }: RiskIndicatorsProps) {
  if (!indicators || indicators.length === 0) {
    return (
      <div>
        <p className="section-title">Risk Indicators</p>
        <div className="sentinel-card-subtle flex items-center justify-center py-8">
          <p className="text-text-muted text-sm">No risk indicators detected.</p>
        </div>
      </div>
    );
  }

  // Sort: HIGH first, then MEDIUM, then LOW
  const sorted = [...indicators].sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="section-title mb-0">Risk Indicators</p>
        <span className="text-xs text-text-muted font-mono">
          {indicators.length} detected
        </span>
      </div>

      <div className="space-y-2">
        {sorted.map((indicator, idx) => {
          const sev = getSeverityConfig(indicator.severity);
          const icon = getIndicatorIcon(indicator.indicator);

          return (
            <div
              key={idx}
              className={`rounded-lg border p-4 ${sev.bg} transition-all duration-200`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <span className="text-lg flex-shrink-0 mt-0.5" aria-hidden="true">
                  {icon}
                </span>

                <div className="flex-1 min-w-0">
                  {/* Name + severity */}
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-text-primary text-sm font-semibold">
                      {indicator.indicator}
                    </span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded font-mono ${sev.color} bg-canvas-950/50`}>
                      {sev.label}
                    </span>
                  </div>
                  {/* Explanation */}
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {indicator.explanation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
