import type { AnalyzeResponse } from '../types';
import { RiskLevelCard } from './RiskLevelCard';
import { RiskIndicators } from './RiskIndicators';
import { ClaimsSection } from './ClaimsSection';
import { EvidenceSection } from './EvidenceSection';
import { UncertaintyCard } from './UncertaintyCard';
import { SafeNextSteps } from './SafeNextSteps';
import { RotateCcw } from 'lucide-react';

interface AnalysisResultProps {
  result: AnalyzeResponse;
  onReset: () => void;
}

export function AnalysisResult({ result, onReset }: AnalysisResultProps) {
  return (
    <div className="w-full max-w-3xl mx-auto animate-slide-up space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Analysis Result</h2>
          <p className="text-text-muted text-sm mt-0.5">
            Based on risk-indicator detection and AI-powered claim analysis
          </p>
        </div>
        <button
          onClick={onReset}
          className="btn-secondary text-sm"
          aria-label="Analyze another message"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Analyze Another</span>
        </button>
      </div>

      {/* Risk Level Card */}
      <RiskLevelCard result={result} />

      {/* Divider */}
      <div className="divider" />

      {/* Risk Indicators */}
      <RiskIndicators indicators={result.risk_indicators} />

      {/* Divider */}
      {result.claims.length > 0 && <div className="divider" />}

      {/* Claims */}
      {result.claims.length > 0 && <ClaimsSection claims={result.claims} />}

      {/* Divider */}
      <div className="divider" />

      {/* Evidence */}
      <EvidenceSection evidenceStatus={result.evidence_status} evidence={result.evidence} />

      {/* Divider */}
      <div className="divider" />

      {/* Uncertainty */}
      <UncertaintyCard uncertainty={result.uncertainty} />

      {/* Divider */}
      {result.safe_next_steps.length > 0 && <div className="divider" />}

      {/* Safe next steps */}
      <SafeNextSteps steps={result.safe_next_steps} />

      {/* Disclaimer */}
      <div className="bg-canvas-900 border border-border rounded-xl p-4 mt-4">
        <p className="text-text-dim text-xs leading-relaxed text-center">
          {result.disclaimer || 'SENTINEL provides educational risk analysis for investor safety. It does not provide investment advice or guarantee whether a claim is genuine.'}
        </p>
      </div>

      {/* Analyze another button at bottom */}
      <div className="flex justify-center pb-4">
        <button onClick={onReset} className="btn-secondary">
          <RotateCcw className="w-4 h-4" />
          Analyze Another Message
        </button>
      </div>
    </div>
  );
}
