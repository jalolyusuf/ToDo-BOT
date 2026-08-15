from enum import Enum

from sqlalchemy import Enum as SQLEnum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import ModelBase
from app.db.types import GUID


class MembershipRole(str, Enum):
    OWNER = "owner"
    MEMBER = "member"


class MembershipStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class GroupMembership(ModelBase):
    __tablename__ = "group_memberships"
    __table_args__ = (UniqueConstraint("group_id", "user_id", name="uq_group_user"),)

    group_id: Mapped[GUID] = mapped_column(
        ForeignKey("groups.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[GUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[MembershipRole] = mapped_column(
        SQLEnum(MembershipRole, native_enum=True, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=MembershipRole.MEMBER
    )
    status: Mapped[MembershipStatus] = mapped_column(
        SQLEnum(MembershipStatus, native_enum=True, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=MembershipStatus.ACTIVE
    )

    # Relationships
    group: Mapped["Group"] = relationship("Group", back_populates="memberships")  # type: ignore # noqa: F821
    user: Mapped["User"] = relationship("User", back_populates="memberships")  # type: ignore # noqa: F821
