"""Telegram bot setup."""

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from app.core.config import get_settings
from app.telegram import conversational_handlers, handlers, reminder_handlers

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

    # Register routers (order matters!)
    dp.include_router(reminder_handlers.router)  # Reminder callbacks (buttons)
    dp.include_router(conversational_handlers.router)  # State-aware handlers
    dp.include_router(handlers.router)  # Basic commands (/start, /list, etc.)

    return dp
