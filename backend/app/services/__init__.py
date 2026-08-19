"""Services package."""

from app.services.ai_service import ai_service
from app.services.bedrock_client import bedrock_client

__all__ = [
    "bedrock_client",
    "ai_service",
]
