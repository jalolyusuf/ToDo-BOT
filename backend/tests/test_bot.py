from typing import Any, cast

import pytest
from aiogram import types

from app.core.config import Settings
from app.telegram import bot as bot_module
from app.telegram.schemas import TelegramUser


class FakeTelegramFromUser:
    id = 123456789
    username = "mini_app_user"
    first_name = "Mini"
    last_name = "App"
    language_code = "en"


class FakeMessage:
    from_user = FakeTelegramFromUser()

    def __init__(self) -> None:
        self.answer_text: str | None = None
        self.answer_kwargs: dict[str, Any] | None = None

    async def answer(self, text: str, **kwargs: Any) -> None:
        self.answer_text = text
        self.answer_kwargs = kwargs


class FakeSessionContext:
    async def __aenter__(self) -> object:
        return object()

    async def __aexit__(self, exc_type: object, exc: object, traceback: object) -> None:
        return None


@pytest.mark.asyncio
async def test_start_invokes_user_registration_or_update(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    settings = Settings()
    settings.telegram_mini_app_url = "https://example.test/app"
    registered_users: list[TelegramUser] = []

    async def fake_get_or_create_or_update_from_telegram_user(
        session: object,
        telegram_user: TelegramUser,
    ) -> object:
        registered_users.append(telegram_user)
        return object()

    monkeypatch.setattr(bot_module, "get_settings", lambda: settings)
    monkeypatch.setattr(bot_module, "async_session_factory", lambda: FakeSessionContext())
    monkeypatch.setattr(
        bot_module,
        "get_or_create_or_update_from_telegram_user",
        fake_get_or_create_or_update_from_telegram_user,
    )

    await bot_module.handle_start(cast(types.Message, FakeMessage()))

    assert len(registered_users) == 1
    assert registered_users[0].id == FakeTelegramFromUser.id
    assert registered_users[0].username == FakeTelegramFromUser.username
    assert registered_users[0].first_name == FakeTelegramFromUser.first_name


@pytest.mark.asyncio
async def test_start_response_sends_welcome_message(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    settings = Settings()
    settings.telegram_mini_app_url = "https://mini-app.example.test"

    async def fake_get_or_create_or_update_from_telegram_user(
        session: object,
        telegram_user: TelegramUser,
    ) -> object:
        return object()

    monkeypatch.setattr(bot_module, "get_settings", lambda: settings)
    monkeypatch.setattr(bot_module, "async_session_factory", lambda: FakeSessionContext())
    monkeypatch.setattr(
        bot_module,
        "get_or_create_or_update_from_telegram_user",
        fake_get_or_create_or_update_from_telegram_user,
    )
    message = FakeMessage()

    await bot_module.handle_start(cast(types.Message, message))

    assert message.answer_text is not None
    assert "Welcome" in message.answer_text
    assert "Task Platform" in message.answer_text


def test_create_dispatcher_registers_start_handler() -> None:
    dispatcher = bot_module.create_dispatcher()

    message_observer = dispatcher.observers["message"]
    callbacks = [handler.callback for handler in message_observer.handlers]

    assert bot_module.handle_start in callbacks
