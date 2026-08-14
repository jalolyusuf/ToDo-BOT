from fastapi import APIRouter

from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.groups import router as groups_router
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.tasks import router as tasks_router
from app.api.v1.routes.telegram_webhook import router as telegram_webhook_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router, tags=["auth"])
api_router.include_router(groups_router, tags=["groups"])
api_router.include_router(tasks_router, tags=["tasks"])
api_router.include_router(telegram_webhook_router, tags=["telegram"])
