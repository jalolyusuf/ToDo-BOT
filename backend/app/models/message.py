"""Message model for chat messages."""

from enum import Enum

from sqlalchemy import Enum as SQLEnum, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import ModelBase
from app.db.types import GUID


class MessageRole(str, Enum):
    """Message role enum."""

    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Message(ModelBase):
    """Message model representing individual chat messages."""

    __tablename__ = "messages"

    # Message content
    role: Mapped[MessageRole] = mapped_column(
        SQLEnum(MessageRole, native_enum=True, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Telegram message info
    telegram_message_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Token usage tracking
    input_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True, default=0)
    output_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True, default=0)

    # Foreign keys
    conversation_id: Mapped[GUID] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Relationships
    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="messages")
    attachments: Mapped[list["Attachment"]] = relationship(
        "Attachment",
        back_populates="message",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"<Message {self.role.value}: {preview}>"
