// SENTINEL API types — use 'export type' for all type/interface declarations
// to ensure Rolldown (Vite 8) handles them correctly.

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'INSUFFICIENT_EVIDENCE';
export type ClaimAssessment = 'SUPPORTED' | 'UNSUPPORTED' | 'UNVERIFIED' | 'MISLEADING';
export type IndicatorSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type SourceType = 'OFFICIAL' | 'OTHER';

export type ClaimItem = {
  claim: string;
  type: string;
  assessment: ClaimAssessment;
  confidence: number;
};

export type RiskIndicator = {
  indicator: string;
  severity: IndicatorSeverity;
  explanation: string;
};

export type EvidenceItem = {
  source_name: string;
  source_type: SourceType;
  reference: string;
  relevance: string;
};

export type AnalyzeResponse = {
  analysis_id: string;
  risk_level: RiskLevel;
  risk_score: number;
  summary: string;
  claims: ClaimItem[];
  risk_indicators: RiskIndicator[];
  evidence_status: string;
  evidence: EvidenceItem[];
  uncertainty: string;
  safe_next_steps: string[];
  disclaimer: string;
};

export type SafetyResponse = {
  error: boolean;
  message: string;
  guidance: string;
  disclaimer: string;
};

export type ApiResponse = AnalyzeResponse | SafetyResponse;

export type ApiError = {
  type: 'network' | 'validation' | 'server' | 'parse';
  message: string;
  details?: string;
};

// Runtime type guards (these must NOT use 'export type' as they are functions)
export function isAnalyzeResponse(r: ApiResponse): r is AnalyzeResponse {
  return 'risk_level' in r;
}

export function isSafetyResponse(r: ApiResponse): r is SafetyResponse {
  return 'guidance' in r;
}
