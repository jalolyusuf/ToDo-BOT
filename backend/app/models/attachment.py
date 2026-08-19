"""Attachment model for files and media."""

from enum import Enum

from sqlalchemy import Enum as SQLEnum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import ModelBase
from app.db.types import GUID


class AttachmentType(str, Enum):
    """Attachment type enum."""

    PHOTO = "photo"
    VIDEO = "video"
    DOCUMENT = "document"
    AUDIO = "audio"
    VOICE = "voice"
    VIDEO_NOTE = "video_note"
    STICKER = "sticker"
    ANIMATION = "animation"


class Attachment(ModelBase):
    """Attachment model for storing file references."""

    __tablename__ = "attachments"

    # File info
    file_type: Mapped[AttachmentType] = mapped_column(
        SQLEnum(AttachmentType, native_enum=True, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    file_id: Mapped[str] = mapped_column(String(512), nullable=False)  # Telegram file_id
    file_unique_id: Mapped[str] = mapped_column(String(512), nullable=False, index=True)
    file_name: Mapped[str | None] = mapped_column(String(512), nullable=True)
    mime_type: Mapped[str | None] = mapped_column(String(128), nullable=True)
    file_size: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Optional thumbnail for videos/documents
    thumbnail_file_id: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # Foreign keys
    message_id: Mapped[GUID] = mapped_column(
        ForeignKey("messages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Relationships
    message: Mapped["Message"] = relationship("Message", back_populates="attachments")

    def __repr__(self) -> str:
        return f"<Attachment {self.file_type.value}: {self.file_name or self.file_id[:20]}>"
