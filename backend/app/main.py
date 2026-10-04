"""
SENTINEL — AI-Powered Financial Scam & Claim Verifier
FastAPI application entry point.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.utils.logging_config import configure_logging
from app.routes import health, analyze

configure_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "SENTINEL starting. version=%s llm_available=%s",
        settings.APP_VERSION,
        settings.llm_available,
    )
    if not settings.llm_available:
        logger.warning(
            "[DEV MODE] LLM_API_KEY not set. Running in deterministic fallback mode. "
            "Set LLM_API_KEY in .env to enable AI-powered analysis."
        )
    yield
    logger.info("SENTINEL shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "**SENTINEL** — AI-Powered Financial Scam & Claim Verifier.\n\n"
        "Helps retail investors identify potential financial fraud and verify suspicious claims.\n\n"
        "> ⚠️ **Disclaimer:** This service is for investor awareness and safety only. "
        "It does not constitute investment advice."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)

# ── Exception handlers ────────────────────────────────────────────────

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception on %s: %s", request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": True, "message": "An unexpected error occurred. Please try again later."},
    )

# ── Routers ───────────────────────────────────────────────────────────

API_PREFIX = "/api/v1"
app.include_router(health.router, prefix=API_PREFIX)
app.include_router(analyze.router, prefix=API_PREFIX)


@app.get("/", include_in_schema=False)
async def root() -> dict:
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/v1/health",
        "analyze": "/api/v1/analyze",
    }
