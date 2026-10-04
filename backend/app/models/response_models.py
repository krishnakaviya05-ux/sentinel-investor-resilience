"""
Strongly typed Pydantic response models for the SENTINEL API.
"""

from enum import Enum
from pydantic import BaseModel, Field


# ─────────────────────────── Enumerations ────────────────────────────

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"


class ClaimAssessment(str, Enum):
    SUPPORTED = "SUPPORTED"
    UNSUPPORTED = "UNSUPPORTED"
    UNVERIFIED = "UNVERIFIED"
    MISLEADING = "MISLEADING"


class IndicatorSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class SourceType(str, Enum):
    OFFICIAL = "OFFICIAL"
    OTHER = "OTHER"


# ─────────────────────────── Sub-models ──────────────────────────────

class ClaimItem(BaseModel):
    claim: str
    type: str
    assessment: ClaimAssessment
    confidence: float = Field(..., ge=0.0, le=1.0)


class RiskIndicator(BaseModel):
    indicator: str
    severity: IndicatorSeverity
    explanation: str


class EvidenceItem(BaseModel):
    source_name: str
    source_type: SourceType
    reference: str
    relevance: str


# ─────────────────────────── Main response ───────────────────────────

class AnalyzeResponse(BaseModel):
    analysis_id: str
    risk_level: RiskLevel
    risk_score: int = Field(..., ge=0, le=100)
    summary: str
    claims: list[ClaimItem] = Field(default_factory=list)
    risk_indicators: list[RiskIndicator] = Field(default_factory=list)
    evidence_status: str = "Evidence could not be independently verified by this prototype."
    evidence: list[EvidenceItem] = Field(default_factory=list)
    uncertainty: str
    safe_next_steps: list[str] = Field(default_factory=list)
    disclaimer: str = (
        "This analysis is for investor awareness and safety. "
        "It is not investment advice."
    )


# ─────────────────────────── Error / Safety ──────────────────────────

class ErrorResponse(BaseModel):
    error: bool = True
    message: str


class SafetyResponse(BaseModel):
    error: bool = False
    message: str
    guidance: str
    disclaimer: str = (
        "SENTINEL is an investor-safety and scam-verification tool. "
        "It does not provide investment advice, buy/sell/hold recommendations, "
        "or stock price predictions."
    )
