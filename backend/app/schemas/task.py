from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.db.types import GUID
from app.models.task import TaskPriority, TaskStatus


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=256)
    description: str | None = Field(None, max_length=5000)
    priority: TaskPriority = TaskPriority.NORMAL
    deadline: datetime | None = None


class TaskCreate(TaskBase):
    assignee_id: GUID | None = None
    group_id: GUID | None = None  # Optional: personal task or group task


class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=256)
    description: str | None = Field(None, max_length=5000)
    priority: TaskPriority | None = None
    deadline: datetime | None = None
    assignee_id: GUID | None = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskAssignUpdate(BaseModel):
    assignee_id: GUID | None


class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: GUID
    status: TaskStatus
    creator_id: GUID
    assignee_id: GUID | None
    group_id: GUID | None
    created_at: datetime
    updated_at: datetime


class TaskWithDetailsResponse(TaskResponse):
    """Task with creator and assignee details."""

    creator_first_name: str
    creator_last_name: str | None
    creator_username: str | None
    assignee_first_name: str | None = None
    assignee_last_name: str | None = None
    assignee_username: str | None = None


class TaskListResponse(BaseModel):
    tasks: list[TaskWithDetailsResponse]
    total: int


class TaskFilterParams(BaseModel):
    """Query parameters for filtering tasks."""

    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    assignee_id: GUID | None = None
    creator_id: GUID | None = None
    group_id: GUID | None = None
    has_deadline: bool | None = None  # True: has deadline, False: no deadline
