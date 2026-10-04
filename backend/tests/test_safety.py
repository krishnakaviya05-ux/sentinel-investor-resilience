"""
Tests for the safety service (unit tests — no HTTP calls needed).
"""

import pytest
from app.services.safety_service import is_investment_advice_request, build_safety_response


# ─── Patterns that SHOULD be blocked ──────────────────────────────────

@pytest.mark.parametrize("content", [
    "Should I buy Infosys stock right now?",
    "Should I sell my Reliance shares?",
    "Which stock should I invest in?",
    "Tell me the best stock to buy.",
    "Where should I invest my money?",
    "How should I invest my savings?",
    "Will XYZ stock price go up next week?",
    "Predict tomorrow's stock price for TCS.",
    "Give me a stock recommendation.",
    "Which broker should I use?",
])
def test_advice_patterns_are_blocked(content: str):
    assert is_investment_advice_request(content) is True, f"Expected blocked: {content!r}"


# ─── Scam messages that MUST NOT be blocked ────────────────────────────

@pytest.mark.parametrize("content", [
    "Guaranteed 40% returns in 30 days. Join our exclusive investment group now.",
    "BUY XYZ SHARES NOW! Guaranteed 50% profit. SEBI approved.",
    "Urgent! Send the registration fee to unlock your guaranteed returns.",
    "Double your money in 7 days. Risk-free investment opportunity.",
    "Join our WhatsApp group for insider tips and secret stock picks.",
    "This message is from SEBI. Your investment is at risk. Call immediately.",
    "Limited slots available. Act now to secure your 200% returns.",
])
def test_scam_messages_are_not_blocked(content: str):
    assert is_investment_advice_request(content) is False, f"Should NOT be blocked: {content!r}"


# ─── Safety response structure ────────────────────────────────────────

def test_build_safety_response_has_required_keys():
    resp = build_safety_response()
    assert "error" in resp
    assert "message" in resp
    assert "guidance" in resp
    assert "disclaimer" in resp


def test_build_safety_response_error_is_false():
    resp = build_safety_response()
    assert resp["error"] is False


def test_build_safety_response_mentions_sentinel():
    resp = build_safety_response()
    assert "SENTINEL" in resp["disclaimer"]
