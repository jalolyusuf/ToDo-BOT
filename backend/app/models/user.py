"""User model for Telegram users."""

from sqlalchemy import BigInteger, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import ModelBase


class User(ModelBase):
    """User model representing Telegram users."""

    __tablename__ = "users"

    # Telegram user info
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False, index=True)
    username: Mapped[str | None] = mapped_column(String(255), nullable=True)
    first_name: Mapped[str] = mapped_column(String(255), nullable=False)
    last_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    language_code: Mapped[str | None] = mapped_column(String(10), nullable=True, default="en")

    # User preferences
    preferred_language: Mapped[str] = mapped_column(String(10), nullable=False, default="en")
    reminder_time: Mapped[str] = mapped_column(String(5), nullable=False, default="09:00")  # HH:MM format

    @property
    def full_name(self) -> str:
        """Get user's full name."""
        if self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name

    def __repr__(self) -> str:
        return f"<User {self.telegram_id} (@{self.username})>"
