"""Telegram bot setup."""

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from app.core.config import get_settings
from app.telegram.handlers import router

settings = get_settings()


def create_bot() -> Bot:
    """Create Telegram bot instance."""
    return Bot(
        token=settings.telegram_bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.MARKDOWN),
    )


def create_dispatcher() -> Dispatcher:
    """Create and configure dispatcher with all handlers."""
    dp = Dispatcher()
    dp.include_router(router)
    return dp
