"""Create group_memberships table

Revision ID: 0003_create_group_memberships
Revises: 0002_create_groups
Create Date: 2026-08-14 00:00:00.000000
"""

import sqlalchemy as sa

from alembic import op
from app.db.types import GUID

revision = "0003_create_group_memberships"
down_revision = "0002_create_groups"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enum types are automatically created by SQLAlchemy from sa.Enum() in columns
    op.create_table(
        "group_memberships",
        sa.Column("id", GUID(), primary_key=True, nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("group_id", GUID(), nullable=False),
        sa.Column("user_id", GUID(), nullable=False),
        sa.Column(
            "role",
            sa.Enum("owner", "member", name="membershiprole"),
            nullable=False,
            server_default="member",
        ),
        sa.Column(
            "status",
            sa.Enum("active", "inactive", name="membershipstatus"),
            nullable=False,
            server_default="active",
        ),
        sa.ForeignKeyConstraint(
            ["group_id"],
            ["groups.id"],
            name="fk_group_memberships_group_id_groups",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_group_memberships_user_id_users",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint("group_id", "user_id", name="uq_group_user"),
    )
    op.create_index("ix_group_memberships_group_id", "group_memberships", ["group_id"], unique=False)
    op.create_index("ix_group_memberships_user_id", "group_memberships", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_group_memberships_user_id", table_name="group_memberships")
    op.drop_index("ix_group_memberships_group_id", table_name="group_memberships")
    op.drop_table("group_memberships")
    # Enum types are automatically dropped by SQLAlchemy
