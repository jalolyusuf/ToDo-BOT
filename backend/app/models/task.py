"""Task model."""

from datetime import datetime
from enum import Enum
from uuid import UUID

from sqlalchemy import BigInteger, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import GUID


class TaskStatus(str, Enum):
    """Task status enum."""

    PENDING = "pending"
    DONE = "done"
    DELETED = "deleted"


class TaskSource(str, Enum):
    """Task source enum."""

    TEXT = "text"
    VOICE = "voice"
    WEB = "web"


class Task(Base):
    """Task model for storing user tasks with reminders."""

    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[UUID] = mapped_column(GUID, index=True, nullable=False)

    # Task details
    task_text: Mapped[str] = mapped_column(Text, nullable=False)
    original_text: Mapped[str | None] = mapped_column(Text, nullable=True)  # Original voice/text before parsing

    # Date and time
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    due_time: Mapped[str | None] = mapped_column(String(5), nullable=True)  # HH:MM format

    # Status and source
    status: Mapped[TaskStatus] = mapped_column(String(20), nullable=False, default=TaskStatus.PENDING)
    source: Mapped[TaskSource] = mapped_column(String(20), nullable=False, default=TaskSource.TEXT)

    # Reminder tracking
    reminder_sent: Mapped[bool] = mapped_column(default=False, nullable=False)
    reminder_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    attachments: Mapped[list["Attachment"]] = relationship("Attachment", back_populates="task", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        """String representation."""
        return f"<Task(id={self.id}, user_id={self.user_id}, task='{self.task_text[:30]}...', status={self.status})>"
