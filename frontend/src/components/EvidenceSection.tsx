import type { EvidenceItem } from '../types';
import { AlertTriangle, ExternalLink, Shield } from 'lucide-react';

interface EvidenceSectionProps {
  evidenceStatus: string;
  evidence: EvidenceItem[];
}

export function EvidenceSection({ evidenceStatus, evidence }: EvidenceSectionProps) {
  const hasEvidence = evidence && evidence.length > 0;

  return (
    <div>
      <p className="section-title">Evidence &amp; Verification</p>

      {/* Evidence status — always shown, always honest */}
      <div className="flex items-start gap-3 bg-risk-medium-bg border border-risk-medium-border rounded-xl p-4 mb-4">
        <AlertTriangle className="w-4 h-4 text-risk-medium flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-risk-medium uppercase tracking-wider mb-1">
            Evidence Status
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            {evidenceStatus || 'Evidence could not be independently verified by this prototype.'}
          </p>
        </div>
      </div>

      {/* Verified evidence items (if any) */}
      {hasEvidence ? (
        <div className="space-y-2">
          {evidence.map((ev, idx) => (
            <div key={idx} className="sentinel-card-subtle space-y-2">
              <div className="flex items-start gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-text-primary text-sm font-semibold">
                    {ev.source_name}
                  </span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                  ev.source_type === 'OFFICIAL'
                    ? 'text-risk-low bg-risk-low-bg border-risk-low-border'
                    : 'text-text-muted bg-canvas-800 border-border'
                }`}>
                  {ev.source_type}
                </span>
              </div>
              <p className="text-text-secondary text-sm pl-6">{ev.relevance}</p>
              {ev.reference && (
                <div className="pl-6">
                  <a
                    href={ev.reference}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-light transition-colors"
                  >
                    {ev.reference}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="sentinel-card-subtle border-dashed flex flex-col items-center justify-center py-6 gap-2 text-center">
          <p className="text-text-muted text-sm">
            No verified evidence sources were returned.
          </p>
          <p className="text-text-dim text-xs max-w-sm">
            SENTINEL does not fabricate sources. Independent verification through official channels is recommended.
          </p>
        </div>
      )}
    </div>
  );
}
