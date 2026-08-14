from sqlalchemy import BigInteger, Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import ModelBase


class User(ModelBase):
    __tablename__ = "users"

    telegram_user_id: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        unique=True,
        index=True,
    )
    username: Mapped[str | None] = mapped_column(String(64), nullable=True)
    first_name: Mapped[str] = mapped_column(String(128), nullable=False)
    last_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    language_code: Mapped[str | None] = mapped_column(String(16), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    can_create_groups: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    owned_groups: Mapped[list["Group"]] = relationship(  # type: ignore # noqa: F821
        "Group",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    memberships: Mapped[list["GroupMembership"]] = relationship(  # type: ignore # noqa: F821
        "GroupMembership",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    created_tasks: Mapped[list["Task"]] = relationship(  # type: ignore # noqa: F821
        "Task",
        foreign_keys="Task.creator_id",
        back_populates="creator",
        cascade="all, delete-orphan",
    )
    assigned_tasks: Mapped[list["Task"]] = relationship(  # type: ignore # noqa: F821
        "Task",
        foreign_keys="Task.assignee_id",
        back_populates="assignee",
    )
