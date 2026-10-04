"""
Safety service for SENTINEL.

Detects when the user is ASKING SENTINEL for investment advice directly,
which is out of scope.

CRITICAL DISTINCTION
────────────────────
  ❌ "Should I buy Infosys stock?" → blocked (user wants advice)
  ✅ "BUY XYZ! Guaranteed 50% return!" → analyzed (message to assess)

Only the first category is blocked. Scam messages that *contain* investment
language are legitimate analysis targets and must NOT be blocked here.
"""

import re
import logging

logger = logging.getLogger(__name__)

# Patterns that match a user directly seeking investment advice from SENTINEL.
# These are first-person or imperative ask forms — not passive quoted content.
_ADVICE_PATTERNS: list[re.Pattern] = [
    re.compile(r"\bshould\s+i\s+(buy|sell|hold|invest\s+in)\b", re.IGNORECASE),
    re.compile(r"\b(tell|advise|recommend)\s+(me\s+)?(to\s+)?(buy|sell|hold)\b", re.IGNORECASE),
    re.compile(r"\bwhat\s+(stock|share|fund|etf|crypto|coin)\s+should\s+i\b", re.IGNORECASE),
    re.compile(r"\bwhich\s+(stock|share|fund|etf|crypto)\s+(is\s+)?best\s+to\s+(buy|invest)\b", re.IGNORECASE),
    re.compile(r"\bbest\s+stock\s+to\s+buy\b", re.IGNORECASE),
    re.compile(r"\bgive\s+me\s+(a\s+)?stock\s+(tip|recommendation|pick)\b", re.IGNORECASE),
    re.compile(r"\bwill\s+\w+\s+(stock|share|price)\b", re.IGNORECASE),
    re.compile(r"\bwill\s+(\w+\s+){1,3}(go\s+up|rise|fall|drop|increase|decrease)\b", re.IGNORECASE),
    re.compile(r"\bwhat\s+will\s+(the\s+)?(price|value)\s+of\s+\w+\s+be\b", re.IGNORECASE),
    re.compile(r"\bwhat\s+will\s+\w+\s+(be|do)\b", re.IGNORECASE),
    re.compile(r"\bpredict\b.*\b(price|stock|share|return|movement)\b", re.IGNORECASE),
    re.compile(r"\bforecast\b.*\b(price|stock|share|return|movement)\b", re.IGNORECASE),
    re.compile(r"\bwhere\s+should\s+i\s+invest\b", re.IGNORECASE),
    re.compile(r"\bhow\s+should\s+i\s+invest\b", re.IGNORECASE),
    re.compile(r"\bwhat\s+is\s+the\s+best\s+investment\s+for\s+me\b", re.IGNORECASE),
    re.compile(r"\bwhich\s+broker\s+should\s+i\s+(use|choose)\b", re.IGNORECASE),
    re.compile(r"\bpick\s+(the\s+best\s+)?stock\s+for\s+me\b", re.IGNORECASE),
    re.compile(r"\btell\s+me\s+(which|what)\s+(stock|share|fund)\s+to\s+buy\b", re.IGNORECASE),
]


def is_investment_advice_request(content: str) -> bool:
    """Return True only when the user is directly asking SENTINEL for advice."""
    for pattern in _ADVICE_PATTERNS:
        if pattern.search(content):
            logger.info("Safety guardrail triggered — pattern: %s", pattern.pattern[:60])
            return True
    return False


def build_safety_response() -> dict:
    return {
        "error": False,
        "message": "SENTINEL does not provide investment recommendations.",
        "guidance": (
            "SENTINEL is designed for investor safety, scam detection and "
            "financial-content verification. It does not provide investment "
            "recommendations or price predictions.\n\n"
            "If you have received a suspicious financial message, paste that "
            "message and SENTINEL will analyse it for potential risk indicators.\n\n"
            "For regulated investment guidance, consult a SEBI-registered investment "
            "advisor: https://www.sebi.gov.in/sebiweb/other/OtherAction.do"
            "?doRecognisedFpi=yes&intmId=13"
        ),
        "disclaimer": (
            "SENTINEL is an investor-safety and scam-verification tool. "
            "It does not provide investment advice, buy/sell/hold recommendations, "
            "or stock price predictions."
        ),
    }
