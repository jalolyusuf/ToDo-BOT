from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import ModelBase
from app.db.types import GUID


class Group(ModelBase):
    __tablename__ = "groups"

    name: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_id: Mapped[GUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="owned_groups")  # type: ignore # noqa: F821
    memberships: Mapped[list["GroupMembership"]] = relationship(  # type: ignore # noqa: F821
        "GroupMembership",
        back_populates="group",
        cascade="all, delete-orphan",
    )
    tasks: Mapped[list["Task"]] = relationship(  # type: ignore # noqa: F821
        "Task",
        back_populates="group",
        cascade="all, delete-orphan",
    )
