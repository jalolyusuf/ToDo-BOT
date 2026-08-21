"""Telegram bot handlers for task management."""

import os
from datetime import datetime

from aiogram import F, Router, types
from aiogram.filters import Command

from app.db import async_session_factory
from app.models import TaskSource, TaskStatus
from app.services.speech_service import speech_service
from app.services.task_service import task_service
from app.services.user_service import get_or_create_user

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

Vazifalaringizni boshqaring!

**Qanday ishlaydi:**
• Matn yoki ovoz xabari yuboring - vazifa qo'shiladi
• Sana avtomatik ajratiladi (masalan: "ertaga", "3-sentabrda")

**Buyruqlar:**
/list - Vazifalar ro'yxati
/done <id> - Bajarildi
/delete <id> - O'chirish

**Misol:**
"3-sentabrda hisobot topshirish" ✅"""

    await message.answer(welcome_text, parse_mode="Markdown")


@router.message(Command("list"))
async def cmd_list(message: types.Message):
    """Show all tasks."""
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
        await message.answer("📝 Vazifalar yo'q. Matn yoki ovoz yuboring!")
        return

    text = "📝 **Sizning vazifalaringiz:**\n\n"
    for task in tasks:
        status_emoji = "✅" if task.status == TaskStatus.DONE else "⏳"
        date_str = task.due_date.strftime("%d-%m-%Y") if task.due_date else "Sana yo'q"
        time_str = f" {task.due_time}" if task.due_time else ""

        text += f"{status_emoji} **#{task.id}** - {task.task_text}\n"
        text += f"   📅 {date_str}{time_str}\n\n"

    await message.answer(text, parse_mode="Markdown")


@router.message(Command("done"))
async def cmd_done(message: types.Message):
    """Mark task as done."""
    try:
        task_id = int(message.text.split()[1])
    except (IndexError, ValueError):
        await message.answer("❌ Xato! Foydalanish: /done <id>\n\nMisol: /done 5")
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
        await message.answer("❌ Vazifa topilmadi")


@router.message(Command("delete"))
async def cmd_delete(message: types.Message):
    """Delete task."""
    try:
        task_id = int(message.text.split()[1])
    except (IndexError, ValueError):
        await message.answer("❌ Xato! Foydalanish: /delete <id>\n\nMisol: /delete 5")
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
        await message.answer("❌ Vazifa topilmadi")


@router.message(F.voice)
async def handle_voice(message: types.Voice):
    """Handle voice messages."""
    # Download voice file
    file = await message.bot.get_file(message.voice.file_id)
    file_path = f"/tmp/voice_{message.voice.file_id}.ogg"
    await message.bot.download_file(file.file_path, file_path)

    # Transcribe
    try:
        text = await speech_service.transcribe_audio(file_path)
        await message.answer(f"🎤 Eshitdim: _{text}_", parse_mode="Markdown")

        # Create task
        async with async_session_factory() as session:
            user = await get_or_create_user(
                session,
                telegram_id=message.from_user.id,
                username=message.from_user.username,
                first_name=message.from_user.first_name,
                last_name=message.from_user.last_name,
                language_code=message.from_user.language_code,
            )

            task = await task_service.create_task_from_text(
                session,
                user.id,
                text,
                TaskSource.VOICE,
            )

        # Format response
        date_str = task.due_date.strftime("%d-%m-%Y") if task.due_date else "Sana ko'rsatilmagan"
        await message.answer(
            f"✅ **Vazifa qo'shildi!**\n\n"
            f"📝 {task.task_text}\n"
            f"📅 {date_str}\n"
            f"🆔 #{task.id}",
            parse_mode="Markdown",
        )

    finally:
        # Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)


@router.message(F.text)
async def handle_text(message: types.Message):
    """Handle text messages - create task."""
    text = message.text

    async with async_session_factory() as session:
        user = await get_or_create_user(
            session,
            telegram_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
            last_name=message.from_user.last_name,
            language_code=message.from_user.language_code,
        )

        task = await task_service.create_task_from_text(
            session,
            user.id,
            text,
            TaskSource.TEXT,
        )

    # Format response
    date_str = task.due_date.strftime("%d-%m-%Y") if task.due_date else "Sana ko'rsatilmagan"
    time_str = f" {task.due_time}" if task.due_time else ""

    await message.answer(
        f"✅ **Vazifa qo'shildi!**\n\n"
        f"📝 {task.task_text}\n"
        f"📅 {date_str}{time_str}\n"
        f"🆔 #{task.id}",
        parse_mode="Markdown",
    )
