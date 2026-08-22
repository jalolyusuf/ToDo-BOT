"""Conversational bot handlers with state management."""

import json
import os
from datetime import datetime

from aiogram import F, Router, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

from app.db import async_session_factory
from app.models import Attachment, AttachmentType, SessionState, Task, TaskSource, TaskStatus
from app.services.file_service import file_service
from app.services.session_service import session_service
from app.services.speech_service import speech_service
from app.services.task_service import task_service
from app.services.user_service import get_or_create_user

router = Router()


@router.message(Command("new"))
async def cmd_new(message: types.Message):
    """Start creating a new task."""
    async with async_session_factory() as session:
        user = await get_or_create_user(
            session,
            telegram_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
            last_name=message.from_user.last_name,
            language_code=message.from_user.language_code,
        )

        # Set state to creating task
        await session_service.set_state(session, user.id, SessionState.CREATING_TASK)

    await message.answer(
        "📝 **Yangi vazifa yaratish**\n\n"
        "Vazifa haqida gapiring:\n"
        "• Matn yuboring\n"
        "• Ovozli xabar yuboring\n"
        "• Rasm, video yoki fayl yuboring\n\n"
        "Tayyor bo'lgach **/date** buyrug'ini yuboring.",
        parse_mode="Markdown"
    )


@router.message(Command("date"))
async def cmd_date(message: types.Message):
    """Set date for the task being created."""
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

        if user_session.state != SessionState.CREATING_TASK:
            await message.answer(
                "❌ Avval **/new** buyrug'i bilan vazifa yaratishni boshlang!",
                parse_mode="Markdown"
            )
            return

        task_data = await session_service.get_task_data(session, user.id)

        if not task_data["messages"] and not task_data["attachments"]:
            await message.answer(
                "❌ Avval vazifa haqida ma'lumot yuboring!",
                parse_mode="Markdown"
            )
            return

        # Set state to waiting for date
        await session_service.set_state(session, user.id, SessionState.WAITING_FOR_DATE)

    await message.answer(
        "📅 **Sana kiriting**\n\n"
        "Qachon eslatishim kerak?\n\n"
        "Misol:\n"
        "• Ertaga\n"
        "• 25-avgust\n"
        "• 3 kundan keyin\n"
        "• Dushanba\n\n"
        "Yoki **/cancel** - bekor qilish",
        parse_mode="Markdown"
    )


@router.message(Command("cancel"))
async def cmd_cancel(message: types.Message):
    """Cancel current task creation."""
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

    await message.answer(
        "❌ **Vazifa yaratish bekor qilindi**\n\n"
        "Yangi vazifa uchun /new buyrug'ini yuboring.",
        parse_mode="Markdown"
    )


# State-aware message handlers
@router.message(F.text)
async def handle_text_stateful(message: types.Message):
    """Handle text messages based on state."""
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

        # If creating task - collect message
        if user_session.state == SessionState.CREATING_TASK:
            await session_service.add_task_message(session, user.id, message.text)
            await message.answer(
                "✅ Qabul qilindi!\n\n"
                "Yana ma'lumot qo'shishingiz yoki **/date** ni bosishingiz mumkin.",
                parse_mode="Markdown"
            )
            return

        # If waiting for date - parse and create task
        if user_session.state == SessionState.WAITING_FOR_DATE:
            from datetime import datetime
            from app.services.simple_date_parser import simple_date_parser

            # Parse date with simple parser (NO AI!)
            current_dt = datetime.now()
            parsed = simple_date_parser.parse(message.text, current_dt)

            task_data = await session_service.get_task_data(session, user.id)

            # Combine all messages
            task_text = " | ".join(task_data["messages"])
            original_text = task_text

            # Create task
            task = Task(
                user_id=user.id,
                task_text=task_text,
                original_text=original_text,
                due_date=datetime.fromisoformat(parsed["date"]) if parsed.get("date") else None,
                due_time=parsed.get("time"),
                status=TaskStatus.PENDING,
                source=TaskSource.TEXT,
            )
            session.add(task)
            await session.flush()

            # Link attachments
            if task_data["attachments"]:
                from sqlalchemy import update
                await session.execute(
                    update(Attachment)
                    .where(Attachment.id.in_(task_data["attachments"]))
                    .values(task_id=task.id)
                )

            await session.commit()
            await session.refresh(task)

            # Reset session
            await session_service.reset_session(session, user.id)

            # Format response
            date_str = task.due_date.strftime("%d-%m-%Y") if task.due_date else "Sana ko'rsatilmagan"
            time_str = f" {task.due_time}" if task.due_time else ""
            attachment_count = len(task_data["attachments"])

            await message.answer(
                f"✅ **Vazifa yaratildi!**\n\n"
                f"📝 {task.task_text}\n"
                f"📅 {date_str}{time_str}\n"
                f"📎 {attachment_count} ta media\n"
                f"🆔 #{task.id}\n\n"
                f"Vazifani /webapp da ko'rishingiz mumkin!",
                parse_mode="Markdown"
            )
            return

        # Default - show help
        await message.answer(
            "Vazifa yaratish uchun **/new** buyrug'ini yuboring!",
            parse_mode="Markdown"
        )


@router.message(F.photo)
async def handle_photo_stateful(message: types.Message):
    """Handle photo with state."""
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

        if user_session.state != SessionState.CREATING_TASK:
            await message.answer("Avval /new buyrug'ini yuboring!")
            return

        # Save photo temporarily
        file_data = await file_service.download_telegram_file(message.bot, message, AttachmentType.PHOTO)

        # Create temporary attachment (without task_id yet)
        attachment = Attachment(task_id=0, **file_data)  # task_id will be updated later
        session.add(attachment)
        await session.commit()
        await session.refresh(attachment)

        # Add to session
        await session_service.add_task_attachment(session, user.id, attachment.id)

        caption = message.caption or ""
        if caption:
            await session_service.add_task_message(session, user.id, f"[RASM: {caption}]")

    await message.answer(
        "✅ Rasm saqlandi!\n\n"
        "Yana ma'lumot qo'shishingiz yoki **/date** ni bosishingiz mumkin.",
        parse_mode="Markdown"
    )


@router.message(F.video)
async def handle_video_stateful(message: types.Message):
    """Handle video with state."""
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

        if user_session.state != SessionState.CREATING_TASK:
            await message.answer("Avval /new buyrug'ini yuboring!")
            return

        # Save video
        file_data = await file_service.download_telegram_file(message.bot, message, AttachmentType.VIDEO)
        attachment = Attachment(task_id=0, **file_data)
        session.add(attachment)
        await session.commit()
        await session.refresh(attachment)

        await session_service.add_task_attachment(session, user.id, attachment.id)

        caption = message.caption or ""
        if caption:
            await session_service.add_task_message(session, user.id, f"[VIDEO: {caption}]")

    await message.answer(
        "✅ Video saqlandi!\n\n"
        "Yana ma'lumot qo'shishingiz yoki **/date** ni bosishingiz mumkin.",
        parse_mode="Markdown"
    )


@router.message(F.document)
async def handle_document_stateful(message: types.Message):
    """Handle document with state."""
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

        if user_session.state != SessionState.CREATING_TASK:
            await message.answer("Avval /new buyrug'ini yuboring!")
            return

        # Save document
        file_data = await file_service.download_telegram_file(message.bot, message, AttachmentType.DOCUMENT)
        attachment = Attachment(task_id=0, **file_data)
        session.add(attachment)
        await session.commit()
        await session.refresh(attachment)

        await session_service.add_task_attachment(session, user.id, attachment.id)

        caption = message.caption or ""
        if caption:
            await session_service.add_task_message(session, user.id, f"[FAYL: {message.document.file_name} - {caption}]")

    await message.answer(
        f"✅ Fayl saqlandi: {message.document.file_name}\n\n"
        "Yana ma'lumot qo'shishingiz yoki **/date** ni bosishingiz mumkin.",
        parse_mode="Markdown"
    )


@router.message(F.voice)
async def handle_voice_stateful(message: types.Message):
    """Handle voice with state - transcribe and save."""
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

        if user_session.state != SessionState.CREATING_TASK:
            await message.answer("Avval /new buyrug'ini yuboring!")
            return

        # Download voice
        file = await message.bot.get_file(message.voice.file_id)
        file_path = f"/tmp/voice_{message.voice.file_id}.ogg"
        await message.bot.download_file(file.file_path, file_path)

        try:
            # Transcribe (if OpenAI available)
            try:
                text = await speech_service.transcribe_audio(file_path)
                await session_service.add_task_message(session, user.id, text)
                await message.answer(f"🎤 Eshitdim: _{text}_", parse_mode="Markdown")
            except Exception as e:
                await message.answer("⚠️ Ovozni matnga aylantirib bo'lmadi, lekin saqlandi!")

            # Save voice file
            file_data = await file_service.download_telegram_file(message.bot, message, AttachmentType.VOICE)
            attachment = Attachment(task_id=0, **file_data)
            session.add(attachment)
            await session.commit()
            await session.refresh(attachment)

            await session_service.add_task_attachment(session, user.id, attachment.id)

        finally:
            if os.path.exists(file_path):
                os.remove(file_path)

    await message.answer(
        "✅ Ovoz saqlandi!\n\n"
        "Yana ma'lumot qo'shishingiz yoki **/date** ni bosishingiz mumkin.",
        parse_mode="Markdown"
    )
