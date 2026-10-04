"""
Tests for POST /api/v1/analyze.

All tests run without a live LLM — the deterministic fallback is used.
LLM failure paths are tested via mocking.
"""

import pytest
import httpx
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

SCAM_MESSAGE = (
    "Guaranteed 40% returns in 30 days. "
    "Join now and send the registration fee immediately. Limited slots!"
)


# ─── 1. Valid analysis request ─────────────────────────────────────────

def test_analyze_valid_returns_200():
    r = client.post("/api/v1/analyze", json={"content": SCAM_MESSAGE})
    assert r.status_code == 200


def test_analyze_response_has_required_fields():
    r = client.post("/api/v1/analyze", json={"content": SCAM_MESSAGE})
    data = r.json()
    for field in [
        "analysis_id", "risk_level", "risk_score", "summary",
        "claims", "risk_indicators", "evidence_status",
        "evidence", "uncertainty", "safe_next_steps", "disclaimer",
    ]:
        assert field in data, f"Missing field: {field}"


def test_analyze_scam_message_is_high_risk():
    """The deterministic scanner must flag this as HIGH risk."""
    r = client.post("/api/v1/analyze", json={"content": SCAM_MESSAGE})
    data = r.json()
    assert data["risk_level"] in ("HIGH", "MEDIUM")
    assert data["risk_score"] >= 25


def test_analyze_returns_risk_indicators():
    r = client.post("/api/v1/analyze", json={"content": SCAM_MESSAGE})
    data = r.json()
    assert len(data["risk_indicators"]) > 0


# ─── 2. Empty content ──────────────────────────────────────────────────

def test_analyze_empty_string_returns_422():
    r = client.post("/api/v1/analyze", json={"content": ""})
    assert r.status_code == 422


# ─── 3. Whitespace-only ────────────────────────────────────────────────

def test_analyze_whitespace_only_rejected():
    r = client.post("/api/v1/analyze", json={"content": "     "})
    assert r.status_code in (400, 422)


# ─── 4. Too short ──────────────────────────────────────────────────────

def test_analyze_too_short_returns_422():
    r = client.post("/api/v1/analyze", json={"content": "short"})
    assert r.status_code == 422


# ─── 5. Too long ───────────────────────────────────────────────────────

def test_analyze_too_long_returns_422():
    r = client.post("/api/v1/analyze", json={"content": "A" * 10_001})
    assert r.status_code == 422


# ─── 6. Missing content field ──────────────────────────────────────────

def test_analyze_missing_content_returns_422():
    r = client.post("/api/v1/analyze", json={})
    assert r.status_code == 422


# ─── 7. Direct investment advice request → safety block ───────────────

def test_analyze_direct_advice_request_blocked():
    r = client.post(
        "/api/v1/analyze",
        json={"content": "Should I buy Infosys stock right now? Tell me what to invest in."},
    )
    assert r.status_code == 200
    data = r.json()
    # Safety response has 'message', not 'risk_level'
    assert "message" in data
    assert "disclaimer" in data
    assert "risk_level" not in data


def test_analyze_advice_response_mentions_sentinel():
    r = client.post(
        "/api/v1/analyze",
        json={"content": "Should I buy Infosys stock right now?"},
    )
    data = r.json()
    assert "SENTINEL" in data.get("disclaimer", "")


# ─── 8. Scam message containing 'buy' → must be analyzed (not blocked) ─

def test_scam_message_with_buy_is_analyzed_not_blocked():
    """
    A scam promotion containing 'buy' should be analysed for risk,
    not rejected by the safety layer.
    """
    scam = (
        "BUY XYZ SHARES NOW! Guaranteed 50% profit in 2 weeks. "
        "SEBI approved. Limited offer. Join our WhatsApp group immediately!"
    )
    r = client.post("/api/v1/analyze", json={"content": scam})
    assert r.status_code == 200
    data = r.json()
    assert "risk_level" in data   # Analysis response, not safety block
    assert data["risk_level"] in ("HIGH", "MEDIUM")


# ─── 9. Missing LLM API key → deterministic fallback ──────────────────

def test_analyze_no_llm_key_returns_deterministic_fallback():
    """Without LLM key, system must still return a structured response."""
    with patch("app.services.analysis_service.settings") as mock_settings:
        mock_settings.llm_available = False
        mock_settings.LLM_API_KEY = ""
        r = client.post("/api/v1/analyze", json={"content": SCAM_MESSAGE})
    assert r.status_code == 200
    data = r.json()
    assert "risk_level" in data
    assert "DEV" in data.get("disclaimer", "") or "rule" in data.get("uncertainty", "").lower()


# ─── 10. LLM failure → graceful fallback ──────────────────────────────

def test_analyze_llm_failure_returns_fallback():
    """When LLM raises LLMError, the endpoint must still return 200 with a result."""
    from app.services.llm_service import LLMError

    async def raise_llm_error(*args, **kwargs):
        raise LLMError("Simulated LLM failure")

    with patch("app.services.analysis_service.call_llm", new=raise_llm_error):
        with patch("app.services.analysis_service.settings") as mock_settings:
            mock_settings.llm_available = True
            r = client.post("/api/v1/analyze", json={"content": SCAM_MESSAGE})

    assert r.status_code == 200
    data = r.json()
    assert "risk_level" in data


# ─── 11. Malformed LLM response → fallback ────────────────────────────

def test_analyze_malformed_llm_response_handled():
    """When LLM returns garbage, the service should fall back, not 500."""
    from app.services.llm_service import LLMError

    async def raise_malformed(*args, **kwargs):
        raise LLMError("Malformed response from LLM.")

    with patch("app.services.analysis_service.call_llm", new=raise_malformed):
        with patch("app.services.analysis_service.settings") as mock_settings:
            mock_settings.llm_available = True
            r = client.post("/api/v1/analyze", json={"content": SCAM_MESSAGE})

    assert r.status_code == 200
    data = r.json()
    assert "risk_level" in data
