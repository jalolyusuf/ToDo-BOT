"""User session model for conversational bot."""

from datetime import datetime
from enum import Enum
from uuid import UUID

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.types import GUID


class SessionState(str, Enum):
    """Session state enum."""

    IDLE = "idle"
    CREATING_TASK = "creating_task"
    WAITING_FOR_DATE = "waiting_for_date"
    WAITING_FOR_CONFIRMATION = "waiting_for_confirmation"
    WAITING_FOR_ATTACHMENTS = "waiting_for_attachments"


class UserSession(Base):
    """User session for conversational bot state."""

    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[UUID] = mapped_column(GUID, index=True, nullable=False, unique=True)

    # Session state
    state: Mapped[SessionState] = mapped_column(String(50), nullable=False, default=SessionState.IDLE)

    # Task creation temporary data
    task_messages: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array of messages
    task_attachments: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array of attachment IDs
    last_task_id: Mapped[int | None] = mapped_column(nullable=True)  # Last created task for attachments

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

    def __repr__(self) -> str:
        """String representation."""
        return f"<UserSession(user_id={self.user_id}, state={self.state})>"
