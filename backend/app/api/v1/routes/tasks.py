"""Task management API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db_session
from app.models.task import TaskPriority, TaskStatus
from app.models.user import User
from app.schemas.task import (
    TaskAssignUpdate,
    TaskCreate,
    TaskFilterParams,
    TaskListResponse,
    TaskResponse,
    TaskStatusUpdate,
    TaskUpdate,
    TaskWithDetailsResponse,
)
from app.services import task_service

router = APIRouter()


@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task_route(
    task_data: TaskCreate,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TaskResponse:
    """
    Create a new task.

    Can be personal (no group_id) or group-based.
    If group_id is provided, user must be a member.
    """
    try:
        task = await task_service.create_task(session, task_data, current_user)
        return TaskResponse.model_validate(task)
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        ) from e


@router.get("/tasks", response_model=TaskListResponse)
async def list_tasks_route(
    session: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    status_filter: TaskStatus | None = Query(None, alias="status"),
    priority: TaskPriority | None = None,
    assignee_id: str | None = None,
    creator_id: str | None = None,
    group_id: str | None = None,
    has_deadline: bool | None = None,
) -> TaskListResponse:
    """
    List all tasks accessible to current user.

    Returns tasks where user is creator, assignee, or group member.
    Supports filtering by status, priority, assignee, creator, group, and deadline.
    """
    filters = TaskFilterParams(
        status=status_filter,
        priority=priority,
        assignee_id=assignee_id,
        creator_id=creator_id,
        group_id=group_id,
        has_deadline=has_deadline,
    )

    tasks = await task_service.list_user_tasks(session, current_user, filters)

    tasks_with_details = [
        TaskWithDetailsResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            deadline=task.deadline,
            creator_id=task.creator_id,
            assignee_id=task.assignee_id,
            group_id=task.group_id,
            created_at=task.created_at,
            updated_at=task.updated_at,
            creator_first_name=task.creator.first_name,
            creator_last_name=task.creator.last_name,
            creator_username=task.creator.username,
            assignee_first_name=task.assignee.first_name if task.assignee else None,
            assignee_last_name=task.assignee.last_name if task.assignee else None,
            assignee_username=task.assignee.username if task.assignee else None,
        )
        for task in tasks
    ]

    return TaskListResponse(
        tasks=tasks_with_details,
        total=len(tasks_with_details),
    )


@router.get("/tasks/{task_id}", response_model=TaskWithDetailsResponse)
async def get_task_route(
    task_id: str,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TaskWithDetailsResponse:
    """
    Get a specific task.

    User must have access to the task (creator, assignee, or group member).
    """
    task = await task_service.get_task(session, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Authorization check
    has_access = await task_service.check_task_access(session, task, current_user)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You do not have permission to view this task.",
        )

    return TaskWithDetailsResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        deadline=task.deadline,
        creator_id=task.creator_id,
        assignee_id=task.assignee_id,
        group_id=task.group_id,
        created_at=task.created_at,
        updated_at=task.updated_at,
        creator_first_name=task.creator.first_name,
        creator_last_name=task.creator.last_name,
        creator_username=task.creator.username,
        assignee_first_name=task.assignee.first_name if task.assignee else None,
        assignee_last_name=task.assignee.last_name if task.assignee else None,
        assignee_username=task.assignee.username if task.assignee else None,
    )


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
async def update_task_route(
    task_id: str,
    task_data: TaskUpdate,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TaskResponse:
    """
    Update a task.

    Only creator or assignee can update.
    Authorization rules can be expanded later.
    """
    task = await task_service.get_task(session, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Authorization: Creator or assignee can update
    if task.creator_id != current_user.id and task.assignee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only task creator or assignee can update the task",
        )

    task = await task_service.update_task(session, task, task_data)
    return TaskResponse.model_validate(task)


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_route(
    task_id: str,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """
    Delete a task.

    CRITICAL BUSINESS RULE:
    - Only CREATOR can delete a task
    - Master Admin CANNOT delete tasks
    - Group Owner CANNOT delete tasks (unless they are creator)
    """
    task = await task_service.get_task(session, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Authorization: ONLY CREATOR can delete
    can_delete = await task_service.check_task_delete_permission(task, current_user)
    if not can_delete:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only task creator can delete the task",
        )

    await task_service.delete_task(session, task)


@router.patch("/tasks/{task_id}/status", response_model=TaskResponse)
async def update_task_status_route(
    task_id: str,
    status_data: TaskStatusUpdate,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TaskResponse:
    """
    Update task status.

    Creator or assignee can update status.
    """
    task = await task_service.get_task(session, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Authorization: Creator or assignee can update status
    if task.creator_id != current_user.id and task.assignee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only task creator or assignee can update status",
        )

    task = await task_service.update_task_status(session, task, status_data.status)
    return TaskResponse.model_validate(task)


@router.patch("/tasks/{task_id}/assign", response_model=TaskResponse)
async def assign_task_route(
    task_id: str,
    assign_data: TaskAssignUpdate,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TaskResponse:
    """
    Assign task to a user.

    Only creator or current assignee can reassign.
    """
    task = await task_service.get_task(session, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Authorization: Creator or current assignee can reassign
    if task.creator_id != current_user.id and task.assignee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only task creator or current assignee can reassign",
        )

    task = await task_service.assign_task(session, task, str(assign_data.assignee_id))
    return TaskResponse.model_validate(task)
