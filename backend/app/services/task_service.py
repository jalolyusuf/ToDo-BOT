"""Task service for CRUD operations."""

from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Task, TaskSource, TaskStatus
from app.services.claude_client import claude_client

# Uzbekistan timezone (UTC+5)
UZBEKISTAN_TZ = ZoneInfo("Asia/Tashkent")


class TaskService:
    """Service for task management."""

    async def create_task_from_text(
        self,
        session: AsyncSession,
        user_id: int,
        text: str,
        source: TaskSource = TaskSource.TEXT,
    ) -> Task:
        """Parse text and create task."""
        # Parse with Claude
        parsed = await claude_client.parse_task(text)

        # Parse due_date with timezone
        due_date = None
        if parsed.get("date"):
            date_str = parsed["date"]
            time_str = parsed.get("time", "09:00")
            dt_str = f"{date_str} {time_str}"
            naive_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
            due_date = naive_dt.replace(tzinfo=UZBEKISTAN_TZ)

        # Create task
        task = Task(
            user_id=user_id,
            task_text=parsed["task"],
            original_text=text,
            due_date=due_date,
            due_time=parsed.get("time"),
            source=source,
            status=TaskStatus.PENDING,
        )
        session.add(task)
        await session.commit()
        await session.refresh(task)
        return task

    async def get_tasks(
        self,
        session: AsyncSession,
        user_id: int,
        status: TaskStatus | None = None,
    ) -> list[Task]:
        """Get user tasks."""
        stmt = select(Task).where(Task.user_id == user_id)
        if status:
            stmt = stmt.where(Task.status == status)
        stmt = stmt.order_by(Task.due_date.asc().nullslast(), Task.created_at.desc())
        result = await session.execute(stmt)
        return list(result.scalars().all())

    async def get_task(self, session: AsyncSession, task_id: int, user_id: int) -> Task | None:
        """Get single task."""
        stmt = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def mark_done(self, session: AsyncSession, task_id: int, user_id: int) -> Task | None:
        """Mark task as done."""
        task = await self.get_task(session, task_id, user_id)
        if task:
            task.status = TaskStatus.DONE
            task.completed_at = datetime.now(UZBEKISTAN_TZ)
            await session.commit()
            await session.refresh(task)
        return task

    async def delete_task(self, session: AsyncSession, task_id: int, user_id: int) -> bool:
        """Delete task."""
        task = await self.get_task(session, task_id, user_id)
        if task:
            task.status = TaskStatus.DELETED
            await session.commit()
            return True
        return False


# Singleton
task_service = TaskService()
