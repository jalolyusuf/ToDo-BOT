from typing import Literal

from fastapi import APIRouter, Request
from pydantic import BaseModel
from redis.asyncio import Redis
from sqlalchemy import text

from app.db.session import engine

router = APIRouter()


class DependencyHealth(BaseModel):
    status: Literal["ok", "error"]
    detail: str | None = None


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    app: DependencyHealth
    database: DependencyHealth
    redis: DependencyHealth


async def _check_database() -> DependencyHealth:
    if engine is None:
        return DependencyHealth(status="error", detail="engine_not_configured")

    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001 - health checks must return dependency failures.
        return DependencyHealth(status="error", detail=exc.__class__.__name__)
    return DependencyHealth(status="ok")


async def _check_redis(redis_client: Redis) -> DependencyHealth:
    try:
        await redis_client.ping()
    except Exception as exc:  # noqa: BLE001 - health checks must return dependency failures.
        return DependencyHealth(status="error", detail=exc.__class__.__name__)
    return DependencyHealth(status="ok")


@router.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    database = await _check_database()
    redis_client: Redis = request.app.state.redis
    redis = await _check_redis(redis_client)
    app = DependencyHealth(status="ok")
    overall: Literal["ok", "degraded"] = (
        "ok" if database.status == "ok" and redis.status == "ok" else "degraded"
    )
    return HealthResponse(status=overall, app=app, database=database, redis=redis)
