"""Create groups table

Revision ID: 0002_create_groups
Revises: 0001_create_users
Create Date: 2026-08-14 00:00:00.000000
"""

import sqlalchemy as sa

from alembic import op
from app.db.types import GUID

revision = "0002_create_groups"
down_revision = "0001_create_users"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "groups",
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
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("owner_id", GUID(), nullable=False),
        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["users.id"],
            name="fk_groups_owner_id_users",
            ondelete="CASCADE",
        ),
    )
    op.create_index("ix_groups_owner_id", "groups", ["owner_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_groups_owner_id", table_name="groups")
    op.drop_table("groups")
