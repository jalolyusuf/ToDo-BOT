import pytest
from httpx import AsyncClient

from app.api.v1.routes import health as health_module


@pytest.mark.asyncio
async def test_health_endpoint_reports_ok(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def fake_database_check() -> health_module.DependencyHealth:
        return health_module.DependencyHealth(status="ok")

    monkeypatch.setattr(health_module, "_check_database", fake_database_check)
    response = await client.get("/api/v1/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"]["status"] == "ok"
    assert body["redis"]["status"] == "ok"
