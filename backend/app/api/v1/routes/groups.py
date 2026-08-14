"""Group management API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db_session
from app.models.user import User
from app.schemas.group import (
    GroupCreate,
    GroupListResponse,
    GroupResponse,
    GroupUpdate,
)
from app.schemas.membership import (
    AddMemberRequest,
    MemberListResponse,
    MembershipWithUserResponse,
)
from app.services import group_service

router = APIRouter()


@router.post("/groups", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group_route(
    group_data: GroupCreate,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> GroupResponse:
    """
    Create a new group.

    Requires can_create_groups permission.
    """
    try:
        group = await group_service.create_group(session, group_data, current_user)
        return GroupResponse.model_validate(group)
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        ) from e


@router.get("/groups", response_model=GroupListResponse)
async def list_groups_route(
    session: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> GroupListResponse:
    """
    List all groups where current user is a member.
    """
    groups = await group_service.list_user_groups(session, current_user)
    return GroupListResponse(
        groups=[GroupResponse.model_validate(g) for g in groups],
        total=len(groups),
    )


@router.get("/groups/{group_id}", response_model=GroupResponse)
async def get_group_route(
    group_id: str,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> GroupResponse:
    """
    Get a specific group.

    User must be a member of the group.
    """
    group = await group_service.get_group(session, group_id)
    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    # Authorization: User must be a member
    membership = await group_service.check_user_membership(session, group_id, str(current_user.id))
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You are not a member of this group.",
        )

    return GroupResponse.model_validate(group)


@router.patch("/groups/{group_id}", response_model=GroupResponse)
async def update_group_route(
    group_id: str,
    group_data: GroupUpdate,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> GroupResponse:
    """
    Update a group.

    Only the group owner can update the group.
    """
    group = await group_service.get_group(session, group_id)
    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    # Authorization: Only owner can update
    is_owner = await group_service.check_user_is_owner(session, group_id, str(current_user.id))
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only group owner can update the group",
        )

    group = await group_service.update_group(session, group, group_data)
    return GroupResponse.model_validate(group)


@router.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group_route(
    group_id: str,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """
    Delete a group.

    Only the group owner can delete the group.
    """
    group = await group_service.get_group(session, group_id)
    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    # Authorization: Only owner can delete
    is_owner = await group_service.check_user_is_owner(session, group_id, str(current_user.id))
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only group owner can delete the group",
        )

    await group_service.delete_group(session, group)


@router.get("/groups/{group_id}/members", response_model=MemberListResponse)
async def list_members_route(
    group_id: str,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> MemberListResponse:
    """
    List all members of a group.

    User must be a member of the group to see other members.
    """
    # Check group exists and user is a member
    group = await group_service.get_group(session, group_id)
    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    membership = await group_service.check_user_membership(session, group_id, str(current_user.id))
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You are not a member of this group.",
        )

    members_data = await group_service.list_group_members(session, group_id)
    members = [
        MembershipWithUserResponse(
            id=membership.id,
            group_id=membership.group_id,
            user_id=membership.user_id,
            role=membership.role,
            status=membership.status,
            created_at=membership.created_at,
            updated_at=membership.updated_at,
            user_first_name=user.first_name,
            user_last_name=user.last_name,
            user_username=user.username,
        )
        for membership, user in members_data
    ]

    return MemberListResponse(
        members=members,
        total=len(members),
    )


@router.post("/groups/{group_id}/members", status_code=status.HTTP_201_CREATED)
async def add_member_route(
    group_id: str,
    member_data: AddMemberRequest,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, str]:
    """
    Add a member to a group.

    Only the group owner can add members.
    """
    group = await group_service.get_group(session, group_id)
    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    # Authorization: Only owner can add members
    is_owner = await group_service.check_user_is_owner(session, group_id, str(current_user.id))
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only group owner can add members",
        )

    try:
        await group_service.add_member(
            session,
            group_id,
            str(member_data.user_id),
            member_data.role,
        )
        return {"message": "Member added successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.delete("/groups/{group_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member_route(
    group_id: str,
    user_id: str,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """
    Remove a member from a group.

    Only the group owner can remove members.
    Cannot remove the owner.
    """
    group = await group_service.get_group(session, group_id)
    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    # Authorization: Only owner can remove members
    is_owner = await group_service.check_user_is_owner(session, group_id, str(current_user.id))
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only group owner can remove members",
        )

    try:
        await group_service.remove_member(session, group_id, user_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
