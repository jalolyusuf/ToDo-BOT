"""Task service for managing tasks with authorization."""

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.group_membership import GroupMembership, MembershipStatus
from app.models.task import Task, TaskPriority, TaskStatus
from app.models.user import User
from app.schemas.task import TaskCreate, TaskFilterParams, TaskUpdate


async def create_task(
    session: AsyncSession,
    task_data: TaskCreate,
    creator: User,
) -> Task:
    """
    Create a new task.

    Business rules:
    - Creator is automatically set to current user
    - If group_id is provided, creator must be a member of the group
    - Task can be personal (no group_id) or group-based
    """
    # If group_id is provided, check membership
    if task_data.group_id is not None:
        membership = await _check_user_group_membership(
            session, str(task_data.group_id), str(creator.id)
        )
        if membership is None:
            raise PermissionError("You are not a member of this group")

    task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        deadline=task_data.deadline,
        creator_id=creator.id,
        assignee_id=task_data.assignee_id,
        group_id=task_data.group_id,
        status=TaskStatus.CREATED,
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task


async def get_task(
    session: AsyncSession,
    task_id: str,
) -> Task | None:
    """Get a task by ID with relationships."""
    stmt = (
        select(Task)
        .where(Task.id == task_id)
        .options(
            selectinload(Task.creator),
            selectinload(Task.assignee),
            selectinload(Task.group),
        )
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def check_task_access(
    session: AsyncSession,
    task: Task,
    user: User,
) -> bool:
    """
    Check if user has access to view the task.

    Access rules:
    - Task creator: YES
    - Task assignee: YES
    - Group member (if task is in a group): YES
    - Other users: NO

    Note: Master Admin logic can be added here later if needed.
    """
    # Creator has access
    if task.creator_id == user.id:
        return True

    # Assignee has access
    if task.assignee_id is not None and task.assignee_id == user.id:
        return True

    # If task is in a group, check membership
    if task.group_id is not None:
        membership = await _check_user_group_membership(
            session, str(task.group_id), str(user.id)
        )
        if membership is not None:
            return True

    return False


async def check_task_delete_permission(
    task: Task,
    user: User,
) -> bool:
    """
    Check if user can delete the task.

    CRITICAL BUSINESS RULE:
    - Only CREATOR can delete a task
    - Master Admin CANNOT delete tasks
    - Group Owner CANNOT delete tasks (unless they are creator)
    """
    return task.creator_id == user.id


async def list_user_tasks(
    session: AsyncSession,
    user: User,
    filters: TaskFilterParams | None = None,
) -> list[Task]:
    """
    List all tasks accessible to the user with optional filters.

    Returns tasks where user is:
    - Creator
    - Assignee
    - Group member (for group tasks)
    """
    # Get user's group memberships
    user_group_ids_stmt = select(GroupMembership.group_id).where(
        GroupMembership.user_id == user.id,
        GroupMembership.status == MembershipStatus.ACTIVE.value,
    )
    user_group_ids_result = await session.execute(user_group_ids_stmt)
    user_group_ids = [row[0] for row in user_group_ids_result.all()]

    # Build query
    stmt = (
        select(Task)
        .options(
            selectinload(Task.creator),
            selectinload(Task.assignee),
        )
        .where(
            or_(
                Task.creator_id == user.id,  # User is creator
                Task.assignee_id == user.id,  # User is assignee
                and_(  # Task is in user's group
                    Task.group_id.in_(user_group_ids),
                    Task.group_id.isnot(None),
                )
                if user_group_ids
                else False,
            )
        )
    )

    # Apply filters
    if filters:
        if filters.status is not None:
            stmt = stmt.where(Task.status == filters.status.value)
        if filters.priority is not None:
            stmt = stmt.where(Task.priority == filters.priority.value)
        if filters.assignee_id is not None:
            stmt = stmt.where(Task.assignee_id == filters.assignee_id)
        if filters.creator_id is not None:
            stmt = stmt.where(Task.creator_id == filters.creator_id)
        if filters.group_id is not None:
            stmt = stmt.where(Task.group_id == filters.group_id)
        if filters.has_deadline is not None:
            if filters.has_deadline:
                stmt = stmt.where(Task.deadline.isnot(None))
            else:
                stmt = stmt.where(Task.deadline.is_(None))

    stmt = stmt.order_by(Task.created_at.desc())

    result = await session.execute(stmt)
    return list(result.scalars().all())


async def update_task(
    session: AsyncSession,
    task: Task,
    task_data: TaskUpdate,
) -> Task:
    """
    Update a task.

    Note: Authorization check must be done in route handler.
    """
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.priority is not None:
        task.priority = task_data.priority
    if task_data.deadline is not None:
        task.deadline = task_data.deadline
    if task_data.assignee_id is not None:
        task.assignee_id = task_data.assignee_id

    await session.commit()
    await session.refresh(task)
    return task


async def update_task_status(
    session: AsyncSession,
    task: Task,
    new_status: TaskStatus,
) -> Task:
    """
    Update task status.

    Note: State machine validation can be added here.
    """
    task.status = new_status
    await session.commit()
    await session.refresh(task)
    return task


async def assign_task(
    session: AsyncSession,
    task: Task,
    assignee_id: str | None,
) -> Task:
    """
    Assign task to a user.

    Note: Authorization check must be done in route handler.
    """
    task.assignee_id = assignee_id
    if assignee_id is not None and task.status == TaskStatus.CREATED.value:
        task.status = TaskStatus.ASSIGNED.value

    await session.commit()
    await session.refresh(task)
    return task


async def delete_task(
    session: AsyncSession,
    task: Task,
) -> None:
    """
    Delete a task.

    CRITICAL: Only creator can delete.
    Authorization check MUST be done in route handler.
    """
    await session.delete(task)
    await session.commit()


async def _check_user_group_membership(
    session: AsyncSession,
    group_id: str,
    user_id: str,
) -> GroupMembership | None:
    """Helper: Check if user is a member of the group."""
    stmt = select(GroupMembership).where(
        GroupMembership.group_id == group_id,
        GroupMembership.user_id == user_id,
        GroupMembership.status == MembershipStatus.ACTIVE.value,
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()
