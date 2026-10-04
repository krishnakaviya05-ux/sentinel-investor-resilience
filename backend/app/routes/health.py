"""Health check route."""

from fastapi import APIRouter
from app.config import settings

router = APIRouter()


@router.get("/health", summary="Health Check", tags=["Health"])
async def health_check() -> dict:
    return {
        "status": "healthy",
        "service": "sentinel-backend",
        "version": settings.APP_VERSION,
    }
