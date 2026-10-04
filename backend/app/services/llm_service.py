"""
LLM service for SENTINEL.

Calls an OpenAI-compatible Chat Completions endpoint directly using HTTPX.
The provider, model, and API key are fully configurable via environment variables.

If LLM_API_KEY is not set, callers should use the deterministic fallback
in analysis_service.py instead.
"""

import json
import logging
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# ─────────────────────────── System Prompt ───────────────────────────

SYSTEM_PROMPT = """You are an investor-protection analysis assistant for SENTINEL, \
a financial-scam awareness tool built for retail investors in India.

Your task:
Analyse the submitted financial content for potential scam indicators.

Look for:
- Guaranteed or unrealistic return promises
- Urgency / pressure tactics ("act now", "limited slots")
- False regulatory claims (fake SEBI/RBI/NSDL approval)
- Impersonation of officials or institutions
- Requests for upfront fees, OTPs, or passwords
- "Secret tip" or "insider information" language
- WhatsApp/Telegram investment group invitations
- "Double your money" or "risk-free" claims

Rules you MUST follow:
1. Do NOT recommend buying, selling, or holding any investment.
2. Do NOT predict prices or future returns.
3. Do NOT invent evidence or fake official sources.
4. Do NOT claim something is definitively a scam unless you have clear evidence.
5. If evidence cannot be verified, say so explicitly.
6. Communicate uncertainty clearly.

Return ONLY valid JSON — no markdown, no explanation outside JSON — matching this schema:

{
  "summary": "string — plain-language summary of the risk assessment",
  "claims": [
    {
      "claim": "string — exact claim extracted from the message",
      "type": "string — e.g. RETURN_PROMISE | REGULATORY_CLAIM | URGENCY | FEE_REQUEST | OTHER",
      "assessment": "SUPPORTED | UNSUPPORTED | UNVERIFIED | MISLEADING",
      "confidence": 0.0
    }
  ],
  "risk_indicators": [
    {
      "indicator": "string — name of indicator",
      "severity": "LOW | MEDIUM | HIGH",
      "explanation": "string — why this is a risk signal"
    }
  ],
  "evidence_status": "string — what could and could not be verified",
  "uncertainty": "string — explicit statement of what is unknown",
  "safe_next_steps": ["string"]
}
"""


# ─────────────────────────── LLM caller ──────────────────────────────

class LLMError(Exception):
    """Raised when the LLM call fails for any reason."""


async def call_llm(content: str, request_id: str) -> dict[str, Any]:
    """
    Send content to the configured LLM and return the parsed JSON dict.
    Raises LLMError on any failure so the caller can fall back gracefully.
    """
    url = f"{settings.LLM_BASE_URL.rstrip('/')}/chat/completions"

    payload = {
        "model": settings.LLM_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    "Analyse the following financial message for scam/risk indicators:\n\n"
                    f"{content}"
                ),
            },
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.1,   # Low temperature for consistent, factual output
        "max_tokens": 1500,
    }

    headers = {
        "Authorization": f"Bearer {settings.LLM_API_KEY}",
        "Content-Type": "application/json",
    }

    logger.info("LLM request starting. request_id=%s model=%s", request_id, settings.LLM_MODEL)

    try:
        async with httpx.AsyncClient(timeout=settings.LLM_TIMEOUT_SECONDS) as client:
            response = await client.post(url, json=payload, headers=headers)

        logger.info(
            "LLM responded. request_id=%s status=%d",
            request_id,
            response.status_code,
        )
        response.raise_for_status()

        data = response.json()
        raw_content: str = data["choices"][0]["message"]["content"]
        parsed: dict[str, Any] = json.loads(raw_content)
        return parsed

    except httpx.TimeoutException as exc:
        logger.error("LLM request timed out. request_id=%s", request_id)
        raise LLMError("LLM request timed out.") from exc

    except httpx.ConnectError as exc:
        logger.error("Could not connect to LLM API. request_id=%s", request_id)
        raise LLMError("Could not connect to LLM API.") from exc

    except httpx.HTTPStatusError as exc:
        logger.error(
            "LLM API returned HTTP error. request_id=%s status=%d",
            request_id,
            exc.response.status_code,
        )
        raise LLMError(f"LLM API error: HTTP {exc.response.status_code}") from exc

    except (json.JSONDecodeError, KeyError, IndexError) as exc:
        logger.error("Failed to parse LLM response. request_id=%s error=%s", request_id, str(exc))
        raise LLMError("Malformed response from LLM.") from exc

    except Exception as exc:  # noqa: BLE001
        logger.error("Unexpected LLM error. request_id=%s error=%s", request_id, str(exc))
        raise LLMError(f"Unexpected error: {exc}") from exc
