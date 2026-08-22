"""Basic Telegram bot command handlers."""

from aiogram import Router, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

from app.core.config import get_settings
from app.db import async_session_factory
from app.models import TaskStatus
from app.services.task_service import task_service
from app.services.user_service import get_or_create_user

settings = get_settings()

router = Router()


@router.message(Command("start"))
async def cmd_start(message: types.Message):
    """Handle /start command."""
    async with async_session_factory() as session:
        await get_or_create_user(
            session,
            telegram_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
            last_name=message.from_user.last_name,
            language_code=message.from_user.language_code,
        )

    welcome_text = """🎯 **Vazifa Eslatuvchi Bot**

Vazifalaringizni boshqaring va eslatmalar oling!

**Yangi vazifa yaratish:**
1. /new - vazifa yaratishni boshlang
2. Matn, ovoz, rasm, video yuboring
3. /date - sanani belgilang
4. ✅ Tayyor!

**Boshqa buyruqlar:**
/webapp - Web interfeys
/list - Barcha vazifalar
/done <id> - Vazifani bajarildi deb belgilash
/delete <id> - Vazifani o'chirish
/cancel - Vazifa yaratishni bekor qilish

**Web App:** Barcha vazifalarni ko'rish, media ko'rish va boshqarish!"""

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📋 Vazifalar (Web App)",
                    web_app=WebAppInfo(url=settings.telegram_webhook_url)
                )
            ],
            [
                InlineKeyboardButton(
                    text="➕ Yangi vazifa",
                    callback_data="new_task"
                )
            ]
        ]
    )

    await message.answer(welcome_text, parse_mode="Markdown", reply_markup=keyboard)


@router.callback_query(lambda c: c.data == "new_task")
async def callback_new_task(callback: types.CallbackQuery):
    """Handle new task button."""
    await callback.answer()
    await callback.message.answer(
        "📝 **Yangi vazifa yaratish**\n\n"
        "Vazifa haqida gapiring:\n"
        "• Matn yuboring\n"
        "• Ovozli xabar yuboring\n"
        "• Rasm, video yoki fayl yuboring\n\n"
        "Tayyor bo'lgach **/date** buyrug'ini yuboring.",
        parse_mode="Markdown"
    )


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
        "Barcha vazifalarni ko'rish, media eshitish/ko'rish va boshqarish uchun quyidagi tugmani bosing:",
        parse_mode="Markdown",
        reply_markup=keyboard
    )


@router.message(Command("list"))
async def cmd_list(message: types.Message):
    """Show all pending tasks."""
    async with async_session_factory() as session:
        user = await get_or_create_user(
            session,
            telegram_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
            last_name=message.from_user.last_name,
            language_code=message.from_user.language_code,
        )

        tasks = await task_service.get_tasks(session, user.id, TaskStatus.PENDING)

    if not tasks:
        await message.answer(
            "📝 Vazifalar yo'q.\n\n"
            "Yangi vazifa yaratish uchun /new buyrug'ini yuboring!",
            parse_mode="Markdown"
        )
        return

    text = "📝 **Sizning vazifalaringiz:**\n\n"
    for task in tasks[:10]:  # Show max 10
        date_str = task.due_date.strftime("%d-%m-%Y") if task.due_date else "Sana yo'q"
        time_str = f" {task.due_time}" if task.due_time else ""
        attachment_count = len(task.attachments) if hasattr(task, 'attachments') else 0
        media_icon = f" 📎{attachment_count}" if attachment_count > 0 else ""

        text += f"**#{task.id}** - {task.task_text[:50]}\n"
        text += f"   📅 {date_str}{time_str}{media_icon}\n\n"

    if len(tasks) > 10:
        text += f"\n_...va yana {len(tasks) - 10} ta vazifa. /webapp da ko'ring!_"

    await message.answer(text, parse_mode="Markdown")


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
