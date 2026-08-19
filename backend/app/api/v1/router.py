"""API v1 router."""

from fastapi import APIRouter

from app.api.v1.routes import telegram

api_router = APIRouter()

# Include route modules
api_router.include_router(telegram.router, tags=["telegram"])


@api_router.get("/health")
async def health_check():
    """API health check."""
    return {"status": "ok", "api_version": "v1"}
