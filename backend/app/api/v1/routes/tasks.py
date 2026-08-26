"""Task management API endpoints."""

from datetime import datetime, timezone
from uuid import UUID
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_current_user_id
from app.db import get_session
from app.models import Attachment, Task, TaskStatus

router = APIRouter()

# Uzbekistan timezone (UTC+5)
UZBEKISTAN_TZ = ZoneInfo("Asia/Tashkent")


class AttachmentResponse(BaseModel):
    """Attachment response schema."""

    id: int
    file_type: str
    file_name: str
    file_url: str
    file_size: int | None
    mime_type: str | None
    duration: int | None
    width: int | None
    height: int | None

    model_config = {"from_attributes": True}


class TaskCreate(BaseModel):
    """Task creation schema."""

    task_text: str
    due_date: str | None = None  # YYYY-MM-DD
    due_time: str | None = None  # HH:MM


class TaskUpdate(BaseModel):
    """Task update schema."""

    task_text: str | None = None
    due_date: str | None = None
    due_time: str | None = None
    status: TaskStatus | None = None


class TaskResponse(BaseModel):
    """Task response schema."""

    id: int
    task_text: str
    due_date: str | None
    due_time: str | None
    status: str
    source: str
    original_text: str | None
    created_at: str
    attachments: list[AttachmentResponse]

    model_config = {"from_attributes": True}


@router.get("/tasks", response_model=list[TaskResponse])
async def get_tasks(
    status: TaskStatus | None = None,
    session: AsyncSession = Depends(get_session),
    user_id: UUID = Depends(get_current_user_id),
):
    """Get all tasks for user."""
    stmt = select(Task).where(Task.user_id == user_id).options(selectinload(Task.attachments))
    if status:
        stmt = stmt.where(Task.status == status)
    stmt = stmt.order_by(Task.due_date.asc().nullslast(), Task.created_at.desc())

    result = await session.execute(stmt)
    tasks = result.scalars().all()

    return [
        TaskResponse(
            id=task.id,
            task_text=task.task_text,
            due_date=task.due_date.strftime("%Y-%m-%d") if task.due_date else None,
            due_time=task.due_time,
            status=task.status.value if hasattr(task.status, 'value') else task.status,
            source=task.source.value if hasattr(task.source, 'value') else task.source,
            original_text=task.original_text,
            created_at=task.created_at.isoformat(),
            attachments=[
                AttachmentResponse(
                    id=att.id,
                    file_type=att.file_type.value if hasattr(att.file_type, 'value') else att.file_type,
                    file_name=att.file_name,
                    file_url=f"/api/v1/files/{att.id}",
                    file_size=att.file_size,
                    mime_type=att.mime_type,
                    duration=att.duration,
                    width=att.width,
                    height=att.height,
                )
                for att in task.attachments
            ],
        )
        for task in tasks
    ]


@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    session: AsyncSession = Depends(get_session),
    user_id: UUID = Depends(get_current_user_id),
):
    """Create new task."""
    # Parse due_date with timezone
    due_date = None
    if task_data.due_date:
        date_str = task_data.due_date
        time_str = task_data.due_time or "09:00"
        dt_str = f"{date_str} {time_str}"
        naive_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        due_date = naive_dt.replace(tzinfo=UZBEKISTAN_TZ)

    task = Task(
        user_id=user_id,
        task_text=task_data.task_text,
        due_date=due_date,
        due_time=task_data.due_time,
        status=TaskStatus.PENDING,
    )
    session.add(task)
    await session.commit()
    await session.refresh(task, ["attachments"])

    return TaskResponse(
        id=task.id,
        task_text=task.task_text,
        due_date=task.due_date.strftime("%Y-%m-%d") if task.due_date else None,
        due_time=task.due_time,
        status=task.status.value if hasattr(task.status, 'value') else task.status,
        source=task.source.value if hasattr(task.source, 'value') else task.source,
        original_text=task.original_text,
        created_at=task.created_at.isoformat(),
        attachments=[],
    )


@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    session: AsyncSession = Depends(get_session),
    user_id: UUID = Depends(get_current_user_id),
):
    """Update task."""
    stmt = select(Task).where(Task.id == task_id, Task.user_id == user_id).options(selectinload(Task.attachments))
    result = await session.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_data.task_text is not None:
        task.task_text = task_data.task_text
    if task_data.due_date is not None:
        # Parse due_date with timezone
        date_str = task_data.due_date
        time_str = task_data.due_time or task.due_time or "09:00"
        dt_str = f"{date_str} {time_str}"
        naive_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        task.due_date = naive_dt.replace(tzinfo=UZBEKISTAN_TZ)
        task.reminder_sent = False  # Reset reminder when date changes
    if task_data.due_time is not None:
        task.due_time = task_data.due_time
    if task_data.status is not None:
        task.status = task_data.status
        if task_data.status == TaskStatus.DONE:
            task.completed_at = datetime.now(UZBEKISTAN_TZ)

    await session.commit()
    await session.refresh(task, ["attachments"])

    return TaskResponse(
        id=task.id,
        task_text=task.task_text,
        due_date=task.due_date.strftime("%Y-%m-%d") if task.due_date else None,
        due_time=task.due_time,
        status=task.status.value if hasattr(task.status, 'value') else task.status,
        source=task.source.value if hasattr(task.source, 'value') else task.source,
        original_text=task.original_text,
        created_at=task.created_at.isoformat(),
        attachments=[
            AttachmentResponse(
                id=att.id,
                file_type=att.file_type.value if hasattr(att.file_type, 'value') else att.file_type,
                file_name=att.file_name,
                file_url=f"/api/v1/files/{att.id}",
                file_size=att.file_size,
                mime_type=att.mime_type,
                duration=att.duration,
                width=att.width,
                height=att.height,
            )
            for att in task.attachments
        ],
    )


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    session: AsyncSession = Depends(get_session),
    user_id: UUID = Depends(get_current_user_id),
):
    """Delete task permanently."""
    stmt = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Delete attachments first, then task
    await session.delete(task)
    await session.commit()
