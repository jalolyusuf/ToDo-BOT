"""Reminder service for sending scheduled notifications."""

import logging
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import async_session_factory
from app.models import Task, TaskStatus, User
from app.telegram.bot import create_bot

logger = logging.getLogger(__name__)

# Uzbekistan timezone (UTC+5)
UZBEKISTAN_TZ = ZoneInfo("Asia/Tashkent")


class ReminderService:
    """Service for checking and sending reminders."""

    @staticmethod
    async def check_and_send_reminders():
        """
        Check for tasks that need reminders and send notifications.

        Runs periodically (every minute).
        """
        logger.info("Checking for reminders...")

        try:
            async with async_session_factory() as session:
                # Get tasks that need reminders
                now = datetime.now(timezone.utc)

                # Find tasks where:
                # 1. Status is PENDING
                # 2. Has due_date
                # 3. Due date/time has arrived
                # 4. Reminder not sent yet
                stmt = (
                    select(Task)
                    .where(Task.status == TaskStatus.PENDING)
                    .where(Task.due_date.isnot(None))
                    .where(Task.reminder_sent == False)
                )

                result = await session.execute(stmt)
                tasks = result.scalars().all()

                logger.info(f"Found {len(tasks)} pending tasks with due_date and reminder_sent=False")

                sent_count = 0
                for task in tasks:
                    # Check if reminder time has arrived
                    if await ReminderService._should_send_reminder(task, now):
                        await ReminderService._send_reminder(session, task)
                        sent_count += 1

                logger.info(f"Sent {sent_count} reminders out of {len(tasks)} candidates")

        except Exception as e:
            logger.error(f"Error checking reminders: {e}")

    @staticmethod
    async def _should_send_reminder(task: Task, now: datetime) -> bool:
        """Check if reminder should be sent for this task."""
        if not task.due_date:
            return False

        # Get due_datetime (already includes time from when task was created)
        due_datetime = task.due_date

        # Make sure both datetimes are timezone-aware for comparison
        # If due_datetime is naive, assume it's in Uzbekistan timezone
        if due_datetime.tzinfo is None:
            due_datetime = due_datetime.replace(tzinfo=UZBEKISTAN_TZ)

        # Convert now to Uzbekistan timezone for comparison
        now_uz = now.astimezone(UZBEKISTAN_TZ)

        # Debug logging
        logger.info(f"Task {task.id}: due={due_datetime}, now={now_uz}, should_send={due_datetime <= now_uz}")

        # Send reminder if due time has arrived
        return due_datetime <= now_uz

    @staticmethod
    async def _send_reminder(session: AsyncSession, task: Task):
        """Send reminder notification to user."""
        try:
            # Get user
            stmt = select(User).where(User.id == task.user_id)
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()

            if not user or not user.telegram_id:
                logger.warning(f"User not found for task {task.id}")
                return

            # Create bot
            bot = create_bot()

            # Format message
            date_str = task.due_date.strftime("%d-%m-%Y") if task.due_date else ""
            time_str = f" soat {task.due_time}" if task.due_time else ""

            message = (
                f"🔔 **ESLATMA!**\n\n"
                f"📝 {task.task_text}\n"
                f"📅 {date_str}{time_str}\n\n"
                f"Bu vazifani qildingizmi?"
            )

            # Attachment info
            if hasattr(task, 'attachments') and task.attachments:
                attachment_count = len(task.attachments)
                message += f"\n📎 {attachment_count} ta media bor"

            # Interactive buttons
            keyboard = InlineKeyboardMarkup(
                inline_keyboard=[
                    [
                        InlineKeyboardButton(
                            text="✅ Bajarildi",
                            callback_data=f"reminder_done_{task.id}"
                        ),
                    ],
                    [
                        InlineKeyboardButton(
                            text="⏰ 1 soatga kechiktir",
                            callback_data=f"reminder_snooze_1h_{task.id}"
                        ),
                        InlineKeyboardButton(
                            text="📅 Ertaga sur",
                            callback_data=f"reminder_snooze_1d_{task.id}"
                        ),
                    ],
                    [
                        InlineKeyboardButton(
                            text="🗑️ O'chirish",
                            callback_data=f"reminder_delete_{task.id}"
                        ),
                    ],
                ]
            )

            # Send message
            await bot.send_message(
                chat_id=user.telegram_id,
                text=message,
                parse_mode="Markdown",
                reply_markup=keyboard
            )

            # Mark reminder as sent
            task.reminder_sent = True
            task.reminder_sent_at = datetime.now(timezone.utc)
            await session.commit()

            logger.info(f"Reminder sent for task {task.id}")

            await bot.session.close()

        except Exception as e:
            logger.error(f"Error sending reminder for task {task.id}: {e}")


reminder_service = ReminderService()
