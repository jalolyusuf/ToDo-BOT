"""Conversational bot handlers with AI-powered intent detection."""

import re
from datetime import datetime
from zoneinfo import ZoneInfo

from aiogram import F, Router, types
from aiogram.filters import Command
from sqlalchemy import select

from app.db import async_session_factory
from app.models import Attachment, AttachmentType, SessionState, Task, TaskSource, TaskStatus
from app.services.claude_client import claude_client
from app.services.file_service import file_service
from app.services.session_service import session_service
from app.services.user_service import get_or_create_user

router = Router()

# Uzbekistan timezone
UZBEKISTAN_TZ = ZoneInfo("Asia/Tashkent")


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

    await message.answer(
        "👋 **Salom! Men vazifa eslatuvchi botman.**\n\n"
        "Menga oddiy yozing:\n"
        "• \"Ertaga soat 15 da shifokorga bor\"\n"
        "• \"5 minutdan keyin qo'ng'iroq qil\"\n"
        "• \"Dushanba kuni hisobotni topshir\"\n\n"
        "Rasm/video/fayl qo'shish uchun:\n"
        "• Vazifa yaratgandan keyin medialarni yuboring\n"
        "• \"tayyor\" deng yoki /done bosing\n\n"
        "📋 /list - vazifalar ro'yxati",
        parse_mode="Markdown"
    )


@router.message(Command("cancel"))
async def cmd_cancel(message: types.Message):
    """Cancel current operation."""
    async with async_session_factory() as session:
        user = await get_or_create_user(
            session,
            telegram_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
            last_name=message.from_user.last_name,
            language_code=message.from_user.language_code,
        )
        await session_service.reset_session(session, user.id)

    await message.answer("✅ Bekor qilindi.")


@router.message(Command("done"))
async def cmd_done(message: types.Message):
    """Finish adding attachments."""
    async with async_session_factory() as session:
        user = await get_or_create_user(
            session,
            telegram_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
            last_name=message.from_user.last_name,
            language_code=message.from_user.language_code,
        )
        await session_service.reset_session(session, user.id)

    await message.answer("✅ Tayyor!")


@router.message(Command("list"))
async def cmd_list(message: types.Message):
    """Show pending tasks."""
    async with async_session_factory() as session:
        user = await get_or_create_user(
            session,
            telegram_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
            last_name=message.from_user.last_name,
            language_code=message.from_user.language_code,
        )

        stmt = (
            select(Task)
            .where(Task.user_id == user.id)
            .where(Task.status == TaskStatus.PENDING)
            .order_by(Task.due_date.asc().nullslast())
            .limit(10)
        )
        result = await session.execute(stmt)
        tasks = result.scalars().all()

    if not tasks:
        await message.answer("📝 Vazifalar yo'q.")
        return

    text = "📝 **Vazifalaringiz:**\n\n"
    for task in tasks:
        date_str = task.due_date.strftime("%d-%m %H:%M") if task.due_date else "—"
        text += f"• {task.task_text[:40]}{'...' if len(task.task_text) > 40 else ''}\n"
        text += f"  📅 {date_str} | /complete_{task.id}\n\n"

    await message.answer(text, parse_mode="Markdown")


@router.message(F.text.startswith("/complete_"))
async def cmd_complete_inline(message: types.Message):
    """Mark task as done via /complete_ID command."""
    match = re.search(r"/complete_(\d+)", message.text)
    if not match:
        return

    task_id = int(match.group(1))

    async with async_session_factory() as session:
        user = await get_or_create_user(
            session,
            telegram_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
            last_name=message.from_user.last_name,
            language_code=message.from_user.language_code,
        )

        stmt = select(Task).where(Task.id == task_id, Task.user_id == user.id)
        result = await session.execute(stmt)
        task = result.scalar_one_or_none()

        if task:
            task.status = TaskStatus.DONE
            task.completed_at = datetime.now(UZBEKISTAN_TZ)
            await session.commit()
            await message.answer(f"✅ Bajarildi: {task.task_text[:50]}")
        else:
            await message.answer("❌ Vazifa topilmadi.")


# Main text handler - AI-powered
@router.message(F.text)
async def handle_text(message: types.Message):
    """Handle all text messages with AI intent detection."""
    # Skip commands
    if message.text.startswith("/"):
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

        user_session = await session_service.get_or_create_session(session, user.id)
        lower_text = message.text.lower().strip()

        # Check for "done/finish" words - reset session
        done_words = ["tayyor", "tamom", "bas", "yetadi", "finish", "done", "ok", "ready"]
        if any(lower_text == word or lower_text == word + "!" for word in done_words):
            if user_session.last_task_id:
                await session_service.reset_session(session, user.id)
                await message.answer("✅ Tayyor!")
                return

        try:
            # Use AI to analyze the message
            current_dt = datetime.now(UZBEKISTAN_TZ)
            current_datetime = current_dt.strftime("%Y-%m-%d %H:%M")

            if claude_client.is_available:
                analysis = await claude_client.analyze_message(message.text, current_datetime)
            else:
                # Fallback - treat everything as potential task
                analysis = {"intent": "create_task", "task_text": message.text, "date": None, "time": None}

            intent = analysis.get("intent", "other")

            # Handle different intents
            if intent == "create_task":
                task_text = analysis.get("task_text") or message.text
                date_str = analysis.get("date")
                time_str = analysis.get("time") or current_dt.strftime("%H:%M")

                # Parse due_date
                due_date = None
                if date_str:
                    dt_str = f"{date_str} {time_str}"
                    naive_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
                    due_date = naive_dt.replace(tzinfo=UZBEKISTAN_TZ)

                # Create task
                task = Task(
                    user_id=user.id,
                    task_text=task_text,
                    original_text=message.text,
                    due_date=due_date,
                    due_time=time_str if date_str else None,
                    status=TaskStatus.PENDING,
                    source=TaskSource.TEXT,
                )
                session.add(task)
                await session.commit()
                await session.refresh(task)

                # Save last task ID - ready for attachments
                await session_service.set_last_task(session, user.id, task.id)
                await session_service.set_state(session, user.id, SessionState.WAITING_FOR_ATTACHMENTS)

                # Format response
                if due_date:
                    date_display = due_date.strftime("%d-%m-%Y %H:%M")
                    await message.answer(
                        f"✅ **Vazifa yaratildi!**\n\n"
                        f"📝 {task_text}\n"
                        f"📅 {date_display}\n\n"
                        f"_Rasm/video/fayl yuborishingiz mumkin_\n"
                        f"_Tayyor bo'lgach \"tayyor\" deng yoki /done_",
                        parse_mode="Markdown"
                    )
                else:
                    await message.answer(
                        f"✅ **Vazifa yaratildi!**\n\n"
                        f"📝 {task_text}\n"
                        f"📅 Sana ko'rsatilmagan\n\n"
                        f"_Rasm/video/fayl yuborishingiz mumkin_\n"
                        f"_Tayyor bo'lgach \"tayyor\" deng yoki /done_",
                        parse_mode="Markdown"
                    )

            elif intent == "greeting":
                await message.answer(
                    "👋 Salom! Menga vazifa yozing, eslataman.\n\n"
                    "Masalan: \"Ertaga soat 10 da uchrashuv\"",
                    parse_mode="Markdown"
                )

            elif intent == "question":
                await message.answer(
                    "❓ Men vazifa eslatuvchi botman.\n\n"
                    "Menga vazifa yozing:\n"
                    "• \"Ertaga shifokorga bor\"\n"
                    "• \"5 minutdan keyin qo'ng'iroq qil\"\n\n"
                    "📋 /list - vazifalar",
                    parse_mode="Markdown"
                )

            else:
                # If we have a last task, maybe they want to add note
                if user_session.last_task_id:
                    await message.answer(
                        "📝 Yangi vazifa yaratmoqchimisiz?\n"
                        "Yoki \"tayyor\" deng oldingi vazifani yakunlash uchun.",
                        parse_mode="Markdown"
                    )
                else:
                    await message.answer(
                        "🤔 Tushunmadim. Vazifa yaratmoqchimisiz?\n\n"
                        "Masalan: \"Ertaga soat 15 da do'konga bor\"",
                        parse_mode="Markdown"
                    )

        except Exception as e:
            await message.answer(
                f"❌ Xatolik: {str(e)}\n\n/cancel - bekor qilish",
                parse_mode="Markdown"
            )


# Media handlers - attach to last task automatically
@router.message(F.photo)
async def handle_photo(message: types.Message):
    """Handle photo - attach to last task."""
    await _handle_media(message, AttachmentType.PHOTO, "Rasm")


@router.message(F.video)
async def handle_video(message: types.Message):
    """Handle video."""
    await _handle_media(message, AttachmentType.VIDEO, "Video")


@router.message(F.document)
async def handle_document(message: types.Message):
    """Handle document."""
    await _handle_media(message, AttachmentType.DOCUMENT, "Fayl")


@router.message(F.voice)
async def handle_voice(message: types.Message):
    """Handle voice."""
    await _handle_media(message, AttachmentType.VOICE, "Ovoz")


@router.message(F.audio)
async def handle_audio(message: types.Message):
    """Handle audio."""
    await _handle_media(message, AttachmentType.AUDIO, "Audio")


async def _handle_media(message: types.Message, file_type: AttachmentType, type_name: str):
    """Generic media handler - automatically attach to last task."""
    async with async_session_factory() as session:
        user = await get_or_create_user(
            session,
            telegram_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
            last_name=message.from_user.last_name,
            language_code=message.from_user.language_code,
        )

        user_session = await session_service.get_or_create_session(session, user.id)

        # Check if we have a task to attach to
        last_task_id = user_session.last_task_id

        if not last_task_id:
            await message.answer(
                f"📎 {type_name} qabul qilindi, lekin vazifa yo'q.\n\n"
                "Avval vazifa yarating:\n"
                "\"Ertaga soat 10 da uchrashuv\"",
                parse_mode="Markdown"
            )
            return

        # Get the task
        stmt = select(Task).where(Task.id == last_task_id, Task.user_id == user.id)
        result = await session.execute(stmt)
        task = result.scalar_one_or_none()

        if not task:
            await message.answer("❌ Vazifa topilmadi. Yangi vazifa yarating.")
            return

        try:
            # Save the file (forwards to channel if configured)
            file_data = await file_service.download_telegram_file(message.bot, message, file_type)

            # Create attachment linked to task
            attachment = Attachment(task_id=task.id, **file_data)
            session.add(attachment)
            await session.commit()

            await message.answer(
                f"✅ {type_name} qo'shildi!\n\n"
                f"📝 _{task.task_text[:30]}..._\n\n"
                f"Yana yuborishingiz yoki \"tayyor\" deng",
                parse_mode="Markdown"
            )

        except Exception as e:
            await message.answer(f"❌ Xatolik: {str(e)}")
