"""
SENTINEL — AI-Powered Financial Scam & Claim Verifier
Configuration: all settings loaded from environment variables.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "SENTINEL")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")

    # ── Server ────────────────────────────────────────────────────────
    # PORT: used by hosting platforms (Render, Railway, Fly.io, etc.)
    # Falls back to 8000 for local development.
    PORT: int = int(os.getenv("PORT", "8000"))

    # ── LLM provider (OpenAI-compatible) ──────────────────────────────
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    # Base URL WITHOUT trailing slash, e.g. https://api.openai.com/v1
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
    LLM_TIMEOUT_SECONDS: int = int(os.getenv("LLM_TIMEOUT_SECONDS", "30"))

    # ── CORS ──────────────────────────────────────────────────────────
    # FRONTEND_URL: the deployed frontend origin (e.g. https://sentinel.vercel.app)
    # ALLOWED_ORIGINS: comma-separated list override (optional, for advanced use)
    # In production, set FRONTEND_URL to your deployed frontend URL.
    # For local dev, localhost:5173 is always included.
    _frontend_url: str = os.getenv("FRONTEND_URL", "")
    _allowed_origins_raw: str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )

    @property
    def ALLOWED_ORIGINS(self) -> list[str]:
        origins: list[str] = []
        # Always allow local dev origins
        origins.extend(["http://localhost:5173", "http://127.0.0.1:5173"])
        # Add the deployed frontend URL if set
        if self._frontend_url and self._frontend_url.strip():
            origins.append(self._frontend_url.strip())
        # Also support the legacy ALLOWED_ORIGINS override
        for o in self._allowed_origins_raw.split(","):
            o = o.strip()
            if o and o not in origins:
                origins.append(o)
        return origins

    # ── Content limits ────────────────────────────────────────────────
    CONTENT_MIN_LENGTH: int = 10
    CONTENT_MAX_LENGTH: int = 10_000

    @property
    def llm_available(self) -> bool:
        """True only when a real API key has been configured."""
        return bool(self.LLM_API_KEY and self.LLM_API_KEY.strip())


settings = Settings()
