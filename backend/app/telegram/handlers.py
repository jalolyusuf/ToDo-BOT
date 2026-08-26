"""Basic Telegram bot command handlers."""

from aiogram import Router, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

from app.core.config import get_settings
from app.db import async_session_factory
from app.services.task_service import task_service
from app.services.user_service import get_or_create_user

settings = get_settings()

router = Router()


@router.message(Command("webapp"))
async def cmd_webapp(message: types.Message):
    """Open Web App."""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📋 Vazifalarni ochish",
                    web_app=WebAppInfo(url=settings.telegram_webhook_url)
                )
            ]
        ]
    )
    await message.answer(
        "🌐 **Web interfeys**\n\n"
        "Barcha vazifalarni ko'rish, media eshitish/ko'rish va boshqarish:",
        parse_mode="Markdown",
        reply_markup=keyboard
    )


@router.message(Command("done"))
async def cmd_done(message: types.Message):
    """Mark task as done."""
    try:
        task_id = int(message.text.split()[1])
    except (IndexError, ValueError):
        await message.answer(
            "❌ Xato! Foydalanish: `/done <id>`\n\nMisol: `/done 5`",
            parse_mode="Markdown"
        )
        return

    async with async_session_factory() as session:
        user = await get_or_create_user(
            session,
            telegram_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
            last_name=message.from_user.last_name,
            language_code=message.from_user.language_code,
        )

        task = await task_service.mark_done(session, task_id, user.id)

    if task:
        await message.answer(f"✅ Bajarildi: {task.task_text}")
    else:
        await message.answer("❌ Vazifa topilmadi yoki sizga tegishli emas.")


@router.message(Command("delete"))
async def cmd_delete(message: types.Message):
    """Delete task."""
    try:
        task_id = int(message.text.split()[1])
    except (IndexError, ValueError):
        await message.answer(
            "❌ Xato! Foydalanish: `/delete <id>`\n\nMisol: `/delete 5`",
            parse_mode="Markdown"
        )
        return

    async with async_session_factory() as session:
        user = await get_or_create_user(
            session,
            telegram_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
            last_name=message.from_user.last_name,
            language_code=message.from_user.language_code,
        )

        success = await task_service.delete_task(session, task_id, user.id)

    if success:
        await message.answer("🗑️ O'chirildi")
    else:
        await message.answer("❌ Vazifa topilmadi yoki sizga tegishli emas.")
