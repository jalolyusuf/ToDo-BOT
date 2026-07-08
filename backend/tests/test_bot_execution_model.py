import importlib
from pathlib import Path
from typing import Any

import pytest
from httpx import AsyncClient

from app.core.config import Settings
from app.main import create_app


@pytest.mark.asyncio
async def test_webhook_rejects_requests_when_secret_is_not_configured(
    client: AsyncClient,
) -> None:
    response = await client.post("/api/v1/telegram/webhook", json={})

    assert response.status_code == 503
    assert response.json()["detail"] == "Telegram webhook is not configured"


@pytest.mark.asyncio
async def test_webhook_validates_secret_before_dispatching_update() -> None:
    from httpx import ASGITransport

    settings = Settings()
    settings.telegram_webhook_secret = "expected-secret"
    app = create_app(settings)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as async_client:
        response = await async_client.post(
            "/api/v1/telegram/webhook",
            headers={"X-Telegram-Bot-Api-Secret-Token": "wrong-secret"},
            json={"update_id": 1},
        )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid webhook secret"


@pytest.mark.asyncio
async def test_webhook_feeds_update_after_valid_secret(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from app.api.v1.routes import telegram_webhook as webhook_module

    class FakeDispatcher:
        def __init__(self) -> None:
            self.received_body: dict[str, Any] | None = None

        async def feed_raw_update(self, bot: object, body: dict[str, Any]) -> None:
            self.received_body = body
            dispatched_updates.append((bot, body))

    settings = Settings()
    settings.telegram_webhook_secret = "expected-secret"
    app = create_app(settings)
    app.state.redis = object()
    fake_bot = object()
    fake_dispatcher = FakeDispatcher()
    dispatched_updates: list[tuple[object, dict[str, Any]]] = []

    monkeypatch.setattr(webhook_module, "create_bot", lambda: fake_bot)
    monkeypatch.setattr(webhook_module, "create_dispatcher", lambda: fake_dispatcher)

    from httpx import ASGITransport

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as async_client:
        response = await async_client.post(
            "/api/v1/telegram/webhook",
            headers={"X-Telegram-Bot-Api-Secret-Token": "expected-secret"},
            json={"update_id": 42},
        )

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert dispatched_updates == [(fake_bot, {"update_id": 42})]


def test_fastapi_import_does_not_create_telegram_bot_or_start_polling(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from aiogram import Bot, Dispatcher

    def fail_bot_init(self: object, *args: object, **kwargs: object) -> None:
        raise AssertionError("Bot must not be constructed at module import time")

    async def fail_start_polling(self: object, *args: object, **kwargs: object) -> None:
        raise AssertionError("Polling must not start at module import time")

    monkeypatch.setattr(Bot, "__init__", fail_bot_init)
    monkeypatch.setattr(Dispatcher, "start_polling", fail_start_polling)

    import app.main as main_module
    import app.telegram.bot as bot_module

    importlib.reload(bot_module)
    importlib.reload(main_module)


def test_development_polling_is_not_auto_started_by_application_modules() -> None:
    app_dir = Path(__file__).resolve().parents[1] / "app"
    checked_files = [path for path in app_dir.rglob("*.py") if "__pycache__" not in path.parts]

    for path in checked_files:
        source = path.read_text(encoding="utf-8")
        assert ".start_polling(" not in source
        assert ".run_polling(" not in source
