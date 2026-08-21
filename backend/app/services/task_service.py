"""Task service for CRUD operations."""

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Task, TaskSource, TaskStatus
from app.services.claude_client import claude_client


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

        # Create task
        task = Task(
            user_id=user_id,
            task_text=parsed["task"],
            original_text=text,
            due_date=datetime.fromisoformat(parsed["date"]) if parsed.get("date") else None,
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
            task.completed_at = datetime.now()
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
