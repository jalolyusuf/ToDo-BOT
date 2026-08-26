"""Attachment model for task files."""

from datetime import datetime
from enum import Enum

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AttachmentType(str, Enum):
    """Attachment type enum."""

    PHOTO = "photo"
    VOICE = "voice"
    VIDEO = "video"
    DOCUMENT = "document"
    AUDIO = "audio"


class Attachment(Base):
    """Attachment model for storing task-related files."""

    __tablename__ = "attachments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("tasks.id"), nullable=False, index=True)

    # File details
    file_type: Mapped[AttachmentType] = mapped_column(String(20), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)  # None for Telegram-stored files
    file_size: Mapped[int | None] = mapped_column(BigInteger, nullable=True)  # bytes
    mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Telegram specific
    telegram_file_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    telegram_file_unique_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    thumbnail_path: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Video thumbnail
    channel_message_id: Mapped[int | None] = mapped_column(Integer, nullable=True)  # Message ID in storage channel

    # Media metadata
    duration: Mapped[int | None] = mapped_column(Integer, nullable=True)  # seconds (for audio/video)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)  # pixels (for photo/video)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)  # pixels (for photo/video)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationship
    task: Mapped["Task"] = relationship("Task", back_populates="attachments")

    def __repr__(self) -> str:
        """String representation."""
        return f"<Attachment(id={self.id}, task_id={self.task_id}, type={self.file_type}, file={self.file_name})>"
