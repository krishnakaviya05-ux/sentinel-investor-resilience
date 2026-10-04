"""
Analysis service for SENTINEL.

Responsibilities:
1. Deterministic red-flag scanner (always runs, provider-independent).
2. LLM-powered deep analysis (when LLM_API_KEY is configured).
3. Merges deterministic score with LLM output into a final AnalyzeResponse.
4. Development fallback: deterministic-only mode when no API key is set.

Risk score → risk level mapping
────────────────────────────────
  0–24   → LOW
  25–49  → MEDIUM
  50–100 → HIGH

Content with no detectable signals → INSUFFICIENT_EVIDENCE
"""

import uuid
import logging
from dataclasses import dataclass, field

from app.config import settings
from app.models.response_models import (
    AnalyzeResponse,
    RiskLevel,
    ClaimItem,
    ClaimAssessment,
    RiskIndicator,
    IndicatorSeverity,
    EvidenceItem,
)
from app.services.llm_service import call_llm, LLMError

logger = logging.getLogger(__name__)


# ─────────────────── Deterministic red-flag definitions ───────────────

@dataclass
class RedFlag:
    keyword: str              # Substring to search (case-insensitive)
    indicator_name: str       # Human-readable name
    severity: IndicatorSeverity
    explanation: str
    points: int               # Score contribution


RED_FLAGS: list[RedFlag] = [
    RedFlag("guaranteed return", "Guaranteed returns promise", IndicatorSeverity.HIGH,
            "No legitimate investment can guarantee fixed returns. This is a classic fraud tactic.", 20),
    RedFlag("guaranteed profit", "Guaranteed profit claim", IndicatorSeverity.HIGH,
            "Promises of guaranteed profits are a hallmark of Ponzi and scam schemes.", 20),
    RedFlag("guaranteed ", "General guarantee language", IndicatorSeverity.HIGH,
            "Use of 'guaranteed' in financial promotion is a strong scam signal.", 20),
    RedFlag("double your money", "Double-your-money claim", IndicatorSeverity.HIGH,
            "Unrealistic doubling promises indicate a high-risk or fraudulent scheme.", 20),
    RedFlag("risk-free", "Risk-free investment claim", IndicatorSeverity.HIGH,
            "All investments carry risk. 'Risk-free' promises are deceptive.", 20),
    RedFlag("risk free", "Risk-free investment claim", IndicatorSeverity.HIGH,
            "All investments carry risk. 'Risk-free' promises are deceptive.", 20),
    RedFlag("insider information", "Insider information offer", IndicatorSeverity.HIGH,
            "Trading on insider information is illegal. This is a common fraud hook.", 20),
    RedFlag("insider tip", "Insider tip offer", IndicatorSeverity.HIGH,
            "Insider tips are illegal and typically fabricated in scam pitches.", 20),
    RedFlag("send money", "Upfront payment request", IndicatorSeverity.HIGH,
            "Requests to send money are a critical fraud warning sign.", 20),
    RedFlag("pay fee to withdraw", "Fee-to-withdraw scam", IndicatorSeverity.HIGH,
            "Legitimate investments never require payment to access your own funds.", 20),
    RedFlag("registration fee", "Upfront fee request", IndicatorSeverity.HIGH,
            "Charging a registration fee before returns is a common advance-fee fraud pattern.", 20),
    RedFlag("secret tip", "Secret tip language", IndicatorSeverity.HIGH,
            "Claims of secret financial tips signal potential fraud.", 20),
    RedFlag("whatsapp group", "WhatsApp investment group", IndicatorSeverity.HIGH,
            "Unregulated investment groups on WhatsApp are a primary scam delivery channel.", 20),
    RedFlag("telegram group", "Telegram investment group", IndicatorSeverity.HIGH,
            "Investment advice from Telegram groups bypasses all regulatory oversight.", 20),
    RedFlag("otp", "OTP collection attempt", IndicatorSeverity.HIGH,
            "Any request for OTPs indicates account takeover or fraud.", 20),
    RedFlag("password", "Password collection attempt", IndicatorSeverity.HIGH,
            "Legitimate financial services never ask for passwords via messages.", 20),
    RedFlag("remote access", "Remote access request", IndicatorSeverity.HIGH,
            "Requests for remote access to devices are a direct threat to financial security.", 20),
    RedFlag("act now", "Urgency pressure tactic", IndicatorSeverity.MEDIUM,
            "Artificial urgency is a manipulation tactic to bypass careful decision-making.", 10),
    RedFlag("limited time", "Limited-time pressure", IndicatorSeverity.MEDIUM,
            "False scarcity is used to pressure victims into hasty decisions.", 10),
    RedFlag("limited slots", "Limited-slots pressure", IndicatorSeverity.MEDIUM,
            "Fake scarcity of 'slots' or 'seats' is a common soft-sell scam tactic.", 10),
    RedFlag("join now", "Urgency to join", IndicatorSeverity.MEDIUM,
            "Pressure to join immediately reduces due-diligence time — a common scam pattern.", 10),
    RedFlag("exclusive group", "Exclusive group offer", IndicatorSeverity.MEDIUM,
            "Claims of exclusive membership are used to create false legitimacy.", 10),
    RedFlag("% return", "Return percentage promise", IndicatorSeverity.MEDIUM,
            "Specific high-return promises without caveats are suspicious.", 10),
    RedFlag("% profit", "Profit percentage promise", IndicatorSeverity.MEDIUM,
            "Specific profit promises without caveats indicate potential fraud.", 10),
    RedFlag("sebi approved", "False SEBI approval claim", IndicatorSeverity.HIGH,
            "SEBI does not approve or endorse investment schemes or guarantee returns.", 20),
    RedFlag("rbi approved", "False RBI approval claim", IndicatorSeverity.HIGH,
            "RBI does not approve retail investment schemes.", 20),
    RedFlag("government approved", "False government approval", IndicatorSeverity.MEDIUM,
            "Government approval claims for investment schemes are frequently fabricated.", 10),
    RedFlag("impersonat", "Impersonation attempt", IndicatorSeverity.HIGH,
            "Impersonating officials or institutions is a common fraud vector.", 20),
    RedFlag("hurry", "Urgency language", IndicatorSeverity.LOW,
            "Urgency language is used to prevent careful decision-making.", 5),
    RedFlag("don't miss", "Fear-of-missing-out", IndicatorSeverity.LOW,
            "FOMO tactics pressure victims into acting without verification.", 5),
    RedFlag("do not miss", "Fear-of-missing-out", IndicatorSeverity.LOW,
            "FOMO tactics pressure victims into acting without verification.", 5),
]


# ───────────────────────── Deterministic scanner ───────────────────────

def run_deterministic_scan(content: str) -> tuple[list[RiskIndicator], int]:
    """
    Scans for known red-flag keywords.

    Returns:
        (list of detected RiskIndicators, raw score before capping)
    """
    content_lower = content.lower()
    seen_names: set[str] = set()
    indicators: list[RiskIndicator] = []
    score = 0

    for flag in RED_FLAGS:
        if flag.keyword in content_lower and flag.indicator_name not in seen_names:
            seen_names.add(flag.indicator_name)
            indicators.append(
                RiskIndicator(
                    indicator=flag.indicator_name,
                    severity=flag.severity,
                    explanation=flag.explanation,
                )
            )
            score += flag.points

    return indicators, min(score, 100)


def score_to_risk_level(score: int, has_indicators: bool) -> RiskLevel:
    if not has_indicators:
        return RiskLevel.INSUFFICIENT_EVIDENCE
    if score >= 50:
        return RiskLevel.HIGH
    if score >= 25:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW


# ─────────────────── Development fallback (no LLM) ───────────────────

def _build_deterministic_response(
    content: str,
    request_id: str,
    indicators: list[RiskIndicator],
    score: int,
    risk_level: RiskLevel,
) -> AnalyzeResponse:
    """
    Constructs a fully deterministic response when no LLM is available.
    Clearly labelled as rule-based — not AI analysis.
    """
    if risk_level == RiskLevel.INSUFFICIENT_EVIDENCE:
        summary = (
            "No common scam indicators were detected by the rule-based scanner. "
            "This does not confirm the message is safe — the scanner covers known patterns only."
        )
    elif risk_level == RiskLevel.HIGH:
        summary = (
            f"Multiple high-risk indicators detected (rule-based score: {score}/100). "
            "This message contains patterns commonly associated with financial scams. "
            "Exercise extreme caution."
        )
    elif risk_level == RiskLevel.MEDIUM:
        summary = (
            f"Several suspicious patterns detected (rule-based score: {score}/100). "
            "Verify this content through official channels before acting."
        )
    else:
        summary = (
            f"Low number of suspicious patterns detected (rule-based score: {score}/100). "
            "Remain cautious and verify through official sources."
        )

    return AnalyzeResponse(
        analysis_id=request_id,
        risk_level=risk_level,
        risk_score=score,
        summary=summary,
        claims=[],   # Deterministic scanner does not extract claims
        risk_indicators=indicators,
        evidence_status=(
            "Evidence could not be independently verified by this prototype. "
            "[DEVELOPMENT MODE: This result is from a rule-based scanner, not AI analysis.]"
        ),
        evidence=[],
        uncertainty=(
            "This assessment is based on keyword pattern matching only. "
            "The absence of detected indicators does not confirm the message is legitimate. "
            "AI-powered analysis is disabled — LLM_API_KEY is not configured."
        ),
        safe_next_steps=_safe_steps(risk_level),
        disclaimer=(
            "This analysis is for investor awareness and safety. "
            "It is not investment advice. "
            "[DEVELOPMENT MODE — rule-based analysis only]"
        ),
    )


def _safe_steps(risk_level: RiskLevel) -> list[str]:
    base = [
        "Never share OTPs, passwords, or banking credentials with anyone.",
        "Verify any SEBI registration claims at https://www.sebi.gov.in/sebiweb/other/"
        "OtherAction.do?doRecognisedFpi=yes&intmId=13",
        "Report suspicious messages to SEBI at scores@sebi.gov.in",
        "Check NSDL resources at https://www.nsdl.com",
    ]
    if risk_level in (RiskLevel.HIGH, RiskLevel.MEDIUM):
        base.insert(0, "Do NOT transfer money or share personal details based on this message.")
        base.insert(1, "Do NOT click any links in the message without verifying the sender.")
    return base


# ─────────────────────── LLM response merger ─────────────────────────

def _parse_llm_claims(raw_claims: list[dict]) -> list[ClaimItem]:
    items: list[ClaimItem] = []
    for c in raw_claims:
        try:
            items.append(
                ClaimItem(
                    claim=str(c.get("claim", "")),
                    type=str(c.get("type", "OTHER")),
                    assessment=ClaimAssessment(c.get("assessment", "UNVERIFIED")),
                    confidence=float(c.get("confidence", 0.5)),
                )
            )
        except Exception:  # noqa: BLE001
            continue  # Skip malformed claim items
    return items


def _parse_llm_indicators(raw_indicators: list[dict]) -> list[RiskIndicator]:
    items: list[RiskIndicator] = []
    for r in raw_indicators:
        try:
            items.append(
                RiskIndicator(
                    indicator=str(r.get("indicator", "")),
                    severity=IndicatorSeverity(r.get("severity", "MEDIUM")),
                    explanation=str(r.get("explanation", "")),
                )
            )
        except Exception:  # noqa: BLE001
            continue
    return items


def _merge_llm_response(
    llm_data: dict,
    deterministic_indicators: list[RiskIndicator],
    deterministic_score: int,
    request_id: str,
) -> AnalyzeResponse:
    """
    Merges LLM output with the deterministic score.
    The deterministic score anchors the risk level — LLM enriches with claims/explanation.
    """
    llm_indicators = _parse_llm_indicators(llm_data.get("risk_indicators", []))

    # Merge: deterministic indicators + LLM indicators (deduplicate by name)
    seen = {ind.indicator for ind in deterministic_indicators}
    merged_indicators = list(deterministic_indicators)
    for ind in llm_indicators:
        if ind.indicator not in seen:
            merged_indicators.append(ind)
            seen.add(ind.indicator)

    final_score = min(deterministic_score, 100)
    risk_level = score_to_risk_level(final_score, bool(merged_indicators))

    return AnalyzeResponse(
        analysis_id=request_id,
        risk_level=risk_level,
        risk_score=final_score,
        summary=llm_data.get("summary", "Analysis completed."),
        claims=_parse_llm_claims(llm_data.get("claims", [])),
        risk_indicators=merged_indicators,
        evidence_status=llm_data.get(
            "evidence_status",
            "Evidence could not be independently verified by this prototype.",
        ),
        evidence=[],  # MVP: no live evidence lookup — do not invent sources
        uncertainty=llm_data.get(
            "uncertainty",
            "Some aspects of this content could not be independently verified.",
        ),
        safe_next_steps=llm_data.get("safe_next_steps", _safe_steps(risk_level)),
    )


# ─────────────────────── Main orchestrator ────────────────────────────

async def analyse_content(content: str, request_id: str) -> AnalyzeResponse:
    """
    Main analysis pipeline:
    1. Always run deterministic scanner first.
    2. If LLM available → enrich with LLM analysis.
    3. If LLM unavailable → return deterministic result.
    """
    logger.info("Deterministic scan starting. request_id=%s", request_id)
    det_indicators, det_score = run_deterministic_scan(content)
    det_risk = score_to_risk_level(det_score, bool(det_indicators))
    logger.info(
        "Deterministic scan done. request_id=%s score=%d risk=%s indicators=%d",
        request_id, det_score, det_risk, len(det_indicators),
    )

    if not settings.llm_available:
        logger.warning(
            "[DEV MODE] LLM_API_KEY not configured. Returning deterministic result. request_id=%s",
            request_id,
        )
        return _build_deterministic_response(content, request_id, det_indicators, det_score, det_risk)

    # LLM path
    try:
        logger.info("LLM analysis starting. request_id=%s", request_id)
        llm_data = await call_llm(content, request_id)
        logger.info("LLM analysis completed. request_id=%s", request_id)
        return _merge_llm_response(llm_data, det_indicators, det_score, request_id)

    except LLMError as exc:
        logger.error(
            "LLM failed, falling back to deterministic result. request_id=%s error=%s",
            request_id, str(exc),
        )
        return _build_deterministic_response(content, request_id, det_indicators, det_score, det_risk)
