"""
Analysis route for SENTINEL.

POST /api/v1/analyze

Pipeline:
  1. Pydantic validates the request.
  2. Safety service blocks direct investment-advice requests.
  3. Analysis service runs deterministic + LLM analysis.
  4. Structured response returned.
"""

import uuid
import logging
from typing import Union

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.models.request_models import AnalyzeRequest
from app.models.response_models import AnalyzeResponse, SafetyResponse
from app.services.analysis_service import analyse_content
from app.services.safety_service import is_investment_advice_request, build_safety_response

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/analyze",
    summary="Analyse a suspicious financial message",
    description=(
        "Accepts a suspicious financial message or claim and returns an explainable "
        "risk assessment. **This endpoint does NOT provide investment advice.**"
    ),
    response_model=Union[AnalyzeResponse, SafetyResponse],
    responses={
        200: {"description": "Analysis result or safety guidance."},
        422: {"description": "Validation error."},
    },
    tags=["Analysis"],
)
async def analyze_message(body: AnalyzeRequest) -> Union[AnalyzeResponse, SafetyResponse]:
    request_id = str(uuid.uuid4())
    logger.info("Analysis request received. request_id=%s content_len=%d", request_id, len(body.content))

    # ── Safety guardrail ───────────────────────────────────────────────
    if is_investment_advice_request(body.content):
        logger.info("Safety guardrail triggered. request_id=%s", request_id)
        return JSONResponse(content=build_safety_response())

    # ── Content quality check ──────────────────────────────────────────
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Content must not be empty or whitespace-only.")

    # ── Analyse ────────────────────────────────────────────────────────
    logger.info("Analysis starting. request_id=%s", request_id)
    result = await analyse_content(body.content, request_id)
    logger.info(
        "Analysis completed. request_id=%s risk_level=%s risk_score=%d",
        request_id, result.risk_level, result.risk_score,
    )
    return result
