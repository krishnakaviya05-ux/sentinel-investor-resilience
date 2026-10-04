import type { AnalyzeResponse } from '../types';
import { getRiskConfig, truncateId } from '../utils/display';
import { Hash } from 'lucide-react';

interface RiskLevelCardProps {
  result: AnalyzeResponse;
}

export function RiskLevelCard({ result }: RiskLevelCardProps) {
  const config = getRiskConfig(result.risk_level);

  return (
    <div className={`rounded-xl border p-6 ${config.cardBg}`}>
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2 font-medium">
            Risk Assessment
          </p>
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">{config.icon}</span>
            <h3 className={`text-2xl font-bold ${config.textColor}`}>
              {config.label}
            </h3>
          </div>
          <p className="text-text-secondary text-sm mt-2 max-w-md">
            {config.description}
          </p>
        </div>

        {/* Risk score */}
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1 font-medium">
            Risk Score
          </p>
          <div className="flex items-baseline gap-1 justify-end">
            <span className={`text-4xl font-bold font-mono ${config.textColor}`}>
              {result.risk_score}
            </span>
            <span className="text-text-muted text-sm font-mono">/100</span>
          </div>
          {/* Score bar */}
          <div className="mt-2 w-24 h-1.5 bg-canvas-900 rounded-full overflow-hidden ml-auto">
            <div
              className={`h-full rounded-full ${config.dotColor} transition-all duration-700`}
              style={{ width: `${result.risk_score}%` }}
              role="progressbar"
              aria-valuenow={result.risk_score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Risk score: ${result.risk_score} out of 100`}
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      {result.summary && (
        <div className="bg-canvas-950/50 rounded-lg p-4 border border-canvas-700/50">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">
            Why this was flagged
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            {result.summary}
          </p>
        </div>
      )}

      {/* Analysis ID */}
      <div className="flex items-center gap-1.5 mt-4 text-text-dim">
        <Hash className="w-3 h-3" />
        <span className="text-xs font-mono">
          Analysis ID: {truncateId(result.analysis_id)}
        </span>
      </div>
    </div>
  );
}
