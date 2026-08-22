"""Reminder callback handlers for interactive buttons."""

from datetime import datetime, timedelta

from aiogram import F, Router, types

from app.db import async_session_factory
from app.models import Task, TaskStatus
from app.services.task_service import task_service
from app.services.user_service import get_or_create_user

router = Router()


@router.callback_query(F.data.startswith("reminder_done_"))
async def callback_reminder_done(callback: types.CallbackQuery):
    """Handle 'Bajarildi' button."""
    task_id = int(callback.data.split("_")[2])

    async with async_session_factory() as session:
        user = await get_or_create_user(
            session,
            telegram_id=callback.from_user.id,
            username=callback.from_user.username,
            first_name=callback.from_user.first_name,
            last_name=callback.from_user.last_name,
            language_code=callback.from_user.language_code,
        )

        task = await task_service.mark_done(session, task_id, user.id)

    if task:
        await callback.message.edit_text(
            f"✅ **Bajarildi!**\n\n"
            f"📝 {task.task_text}\n\n"
            f"_Vazifa bajarilgan deb belgilandi._",
            parse_mode="Markdown"
        )
    else:
        await callback.answer("❌ Vazifa topilmadi", show_alert=True)


@router.callback_query(F.data.startswith("reminder_snooze_"))
async def callback_reminder_snooze(callback: types.CallbackQuery):
    """Handle 'Kechiktir' buttons."""
    parts = callback.data.split("_")
    duration = parts[2]  # "1h" or "1d"
    task_id = int(parts[3])

    async with async_session_factory() as session:
        user = await get_or_create_user(
            session,
            telegram_id=callback.from_user.id,
            username=callback.from_user.username,
            first_name=callback.from_user.first_name,
            last_name=callback.from_user.last_name,
            language_code=callback.from_user.language_code,
        )

        # Get task
        from sqlalchemy import select
        stmt = select(Task).where(Task.id == task_id, Task.user_id == user.id)
        result = await session.execute(stmt)
        task = result.scalar_one_or_none()

        if not task:
            await callback.answer("❌ Vazifa topilmadi", show_alert=True)
            return

        # Calculate new due date
        if duration == "1h":
            new_due = datetime.now() + timedelta(hours=1)
            duration_text = "1 soat"
        elif duration == "1d":
            new_due = datetime.now() + timedelta(days=1)
            duration_text = "1 kun"
        else:
            await callback.answer("❌ Xato", show_alert=True)
            return

        # Update task
        task.due_date = new_due
        task.due_time = new_due.strftime("%H:%M")
        task.reminder_sent = False  # Reset reminder flag
        task.reminder_sent_at = None
        await session.commit()

        date_str = new_due.strftime("%d-%m-%Y %H:%M")

        await callback.message.edit_text(
            f"⏰ **Kechiktirildi**\n\n"
            f"📝 {task.task_text}\n"
            f"📅 Yangi sana: {date_str}\n\n"
            f"_{duration_text}dan keyin yana eslataman._",
            parse_mode="Markdown"
        )


@router.callback_query(F.data.startswith("reminder_delete_"))
async def callback_reminder_delete(callback: types.CallbackQuery):
    """Handle 'O'chirish' button."""
    task_id = int(callback.data.split("_")[2])

    async with async_session_factory() as session:
        user = await get_or_create_user(
            session,
            telegram_id=callback.from_user.id,
            username=callback.from_user.username,
            first_name=callback.from_user.first_name,
            last_name=callback.from_user.last_name,
            language_code=callback.from_user.language_code,
        )

        success = await task_service.delete_task(session, task_id, user.id)

    if success:
        await callback.message.edit_text(
            f"🗑️ **O'chirildi**\n\n"
            f"_Vazifa o'chirildi._",
            parse_mode="Markdown"
        )
    else:
        await callback.answer("❌ Vazifa topilmadi", show_alert=True)
