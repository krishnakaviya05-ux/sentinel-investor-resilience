import { useState } from 'react';
import type { ClaimItem } from '../types';
import { getAssessmentConfig } from '../utils/display';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ClaimCardProps {
  claim: ClaimItem;
  index: number;
}

function ClaimCard({ claim, index }: ClaimCardProps) {
  const [expanded, setExpanded] = useState(false);
  const assessment = getAssessmentConfig(claim.assessment);
  const confidencePct = Math.round(claim.confidence * 100);

  return (
    <div className="sentinel-card-subtle space-y-3">
      {/* Top row: claim text + assessment */}
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="text-text-muted text-xs font-mono mt-0.5 flex-shrink-0 w-5">
            {String(index + 1).padStart(2, '0')}
          </span>
          <p className="text-text-primary text-sm font-medium leading-relaxed">
            "{claim.claim}"
          </p>
        </div>
        <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded border ${assessment.color} ${assessment.bg}`}>
          {assessment.label}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 pl-7">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted">Type:</span>
          <span className="text-xs text-text-secondary font-medium bg-canvas-800 border border-border px-2 py-0.5 rounded font-mono">
            {claim.type}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted">Confidence:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1 bg-canvas-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-accent/70"
                style={{ width: `${confidencePct}%` }}
                role="progressbar"
                aria-valuenow={confidencePct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="text-xs text-text-secondary font-mono">{confidencePct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ClaimsSectionProps {
  claims: ClaimItem[];
}

export function ClaimsSection({ claims }: ClaimsSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="section-title mb-0">Claims Detected</p>
        {claims.length > 0 && (
          <span className="text-xs text-text-muted font-mono">{claims.length} extracted</span>
        )}
      </div>

      {claims.length === 0 ? (
        <div className="sentinel-card-subtle flex items-center justify-center py-8">
          <p className="text-text-muted text-sm">
            No specific claims were extracted. This may occur in development mode without AI analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {claims.map((claim, idx) => (
            <ClaimCard key={idx} claim={claim} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
