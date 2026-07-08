from aiogram import Bot, Dispatcher, types
from aiogram.client.default import DefaultBotProperties
from aiogram.filters import Command
from aiogram.types import KeyboardButton, ReplyKeyboardMarkup, WebAppInfo

from app.core.config import get_settings
from app.db.session import async_session_factory
from app.services.user_service import get_or_create_or_update_from_telegram_user
from app.telegram.schemas import TelegramUser


def create_bot() -> Bot:
    settings = get_settings()
    if not settings.telegram_bot_token:
        raise RuntimeError("Telegram bot token is not configured")

    return Bot(
        token=settings.telegram_bot_token,
        default=DefaultBotProperties(parse_mode="HTML"),
    )


def create_dispatcher() -> Dispatcher:
    dispatcher = Dispatcher()
    dispatcher.message.register(handle_start, Command("start"))
    return dispatcher


async def handle_start(message: types.Message) -> None:
    from_user = message.from_user
    assert from_user is not None

    settings = get_settings()
    telegram_user = TelegramUser(
        id=from_user.id,
        username=from_user.username,
        first_name=from_user.first_name or "",
        last_name=from_user.last_name,
        language_code=from_user.language_code,
    )

    assert async_session_factory is not None
    async with async_session_factory() as session:
        await get_or_create_or_update_from_telegram_user(session, telegram_user)

    app_url = settings.telegram_mini_app_url or "https://t.me"
    button = ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="Open Mini App", web_app=WebAppInfo(url=app_url))]]
    )

    await message.answer(
        "Welcome to Telegram Task Platform. Open the Mini App to continue.",
        reply_markup=button,
    )
