"""Create tasks table

Revision ID: 0004_create_tasks
Revises: 0003_create_group_memberships
Create Date: 2026-08-14 00:00:00.000000
"""

import sqlalchemy as sa

from alembic import op
from app.db.types import GUID

revision = "0004_create_tasks"
down_revision = "0003_create_group_memberships"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enum types are automatically created by SQLAlchemy from sa.Enum() in columns
    op.create_table(
        "tasks",
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
        sa.Column("title", sa.String(length=256), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "created",
                "assigned",
                "in_progress",
                "on_hold",
                "review",
                "completed",
                "cancelled",
                name="taskstatus",
            ),
            nullable=False,
            server_default="created",
        ),
        sa.Column(
            "priority",
            sa.Enum("low", "normal", "high", "urgent", name="taskpriority"),
            nullable=False,
            server_default="normal",
        ),
        sa.Column("deadline", sa.DateTime(timezone=True), nullable=True),
        sa.Column("creator_id", GUID(), nullable=False),
        sa.Column("assignee_id", GUID(), nullable=True),
        sa.Column("group_id", GUID(), nullable=True),
        sa.ForeignKeyConstraint(
            ["creator_id"],
            ["users.id"],
            name="fk_tasks_creator_id_users",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["assignee_id"],
            ["users.id"],
            name="fk_tasks_assignee_id_users",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["group_id"],
            ["groups.id"],
            name="fk_tasks_group_id_groups",
            ondelete="CASCADE",
        ),
    )

    # Create indexes for common queries
    op.create_index("ix_tasks_creator_id", "tasks", ["creator_id"], unique=False)
    op.create_index("ix_tasks_assignee_id", "tasks", ["assignee_id"], unique=False)
    op.create_index("ix_tasks_group_id", "tasks", ["group_id"], unique=False)
    op.create_index("ix_tasks_status", "tasks", ["status"], unique=False)
    op.create_index("ix_tasks_deadline", "tasks", ["deadline"], unique=False)
    op.create_index("ix_tasks_priority", "tasks", ["priority"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_tasks_priority", table_name="tasks")
    op.drop_index("ix_tasks_deadline", table_name="tasks")
    op.drop_index("ix_tasks_status", table_name="tasks")
    op.drop_index("ix_tasks_group_id", table_name="tasks")
    op.drop_index("ix_tasks_assignee_id", table_name="tasks")
    op.drop_index("ix_tasks_creator_id", table_name="tasks")
    op.drop_table("tasks")
    # Enum types are automatically dropped by SQLAlchemy
