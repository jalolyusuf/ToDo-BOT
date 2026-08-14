from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import ModelBase
from app.db.types import GUID


class TaskStatus(str, Enum):
    CREATED = "created"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    REVIEW = "review"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class Task(ModelBase):
    __tablename__ = "tasks"

    # Basic fields
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[TaskStatus] = mapped_column(nullable=False, default=TaskStatus.CREATED)
    priority: Mapped[TaskPriority] = mapped_column(nullable=False, default=TaskPriority.NORMAL)
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    creator_id: Mapped[GUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    assignee_id: Mapped[GUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    group_id: Mapped[GUID | None] = mapped_column(
        ForeignKey("groups.id", ondelete="CASCADE"),
        nullable=True,  # Task can be personal (no group) or group-based
        index=True,
    )

    # Relationships
    creator: Mapped["User"] = relationship("User", foreign_keys=[creator_id], back_populates="created_tasks")  # type: ignore # noqa: F821
    assignee: Mapped["User | None"] = relationship("User", foreign_keys=[assignee_id], back_populates="assigned_tasks")  # type: ignore # noqa: F821
    group: Mapped["Group | None"] = relationship("Group", back_populates="tasks")  # type: ignore # noqa: F821
