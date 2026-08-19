"""Conversation model for chat sessions."""

from enum import Enum

from sqlalchemy import Enum as SQLEnum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import ModelBase
from app.db.types import GUID


class ConversationStatus(str, Enum):
    """Conversation status enum."""

    ACTIVE = "active"
    ARCHIVED = "archived"
    DELETED = "deleted"


class Conversation(ModelBase):
    """Conversation model representing chat sessions."""

    __tablename__ = "conversations"

    # Basic fields
    title: Mapped[str | None] = mapped_column(String(512), nullable=True)
    status: Mapped[ConversationStatus] = mapped_column(
        SQLEnum(ConversationStatus, native_enum=True, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=ConversationStatus.ACTIVE.value,
    )
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Foreign keys
    user_id: Mapped[GUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="conversations")
    messages: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )

    def __repr__(self) -> str:
        return f"<Conversation {self.id} - {self.title or 'Untitled'}>"
