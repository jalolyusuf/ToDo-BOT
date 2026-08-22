"""Task management API endpoints."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models import Task, TaskStatus

router = APIRouter()


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
    created_at: str

    model_config = {"from_attributes": True}


@router.get("/tasks", response_model=list[TaskResponse])
async def get_tasks(
    status: TaskStatus | None = None,
    user_id: str = "temp-user",  # TODO: Get from auth
    session: AsyncSession = Depends(get_session),
):
    """Get all tasks for user."""
    stmt = select(Task).where(Task.user_id == user_id)
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
            status=task.status.value,
            created_at=task.created_at.isoformat(),
        )
        for task in tasks
    ]


@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    user_id: str = "temp-user",  # TODO: Get from auth
    session: AsyncSession = Depends(get_session),
):
    """Create new task."""
    task = Task(
        user_id=user_id,
        task_text=task_data.task_text,
        due_date=datetime.fromisoformat(task_data.due_date) if task_data.due_date else None,
        due_time=task_data.due_time,
        status=TaskStatus.PENDING,
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)

    return TaskResponse(
        id=task.id,
        task_text=task.task_text,
        due_date=task.due_date.strftime("%Y-%m-%d") if task.due_date else None,
        due_time=task.due_time,
        status=task.status.value,
        created_at=task.created_at.isoformat(),
    )


@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    user_id: str = "temp-user",  # TODO: Get from auth
    session: AsyncSession = Depends(get_session),
):
    """Update task."""
    stmt = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_data.task_text is not None:
        task.task_text = task_data.task_text
    if task_data.due_date is not None:
        task.due_date = datetime.fromisoformat(task_data.due_date)
    if task_data.due_time is not None:
        task.due_time = task_data.due_time
    if task_data.status is not None:
        task.status = task_data.status
        if task_data.status == TaskStatus.DONE:
            task.completed_at = datetime.now()

    await session.commit()
    await session.refresh(task)

    return TaskResponse(
        id=task.id,
        task_text=task.task_text,
        due_date=task.due_date.strftime("%Y-%m-%d") if task.due_date else None,
        due_time=task.due_time,
        status=task.status.value,
        created_at=task.created_at.isoformat(),
    )


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    user_id: str = "temp-user",  # TODO: Get from auth
    session: AsyncSession = Depends(get_session),
):
    """Delete task."""
    stmt = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = TaskStatus.DELETED
    await session.commit()
