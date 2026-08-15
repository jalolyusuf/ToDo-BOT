"""Group service for managing groups and memberships."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.group import Group
from app.models.group_membership import GroupMembership, MembershipRole, MembershipStatus
from app.models.user import User
from app.schemas.group import GroupCreate, GroupUpdate


async def create_group(
    session: AsyncSession,
    group_data: GroupCreate,
    owner: User,
) -> Group:
    """
    Create a new group.

    Business rules:
    - User must have can_create_groups permission
    - Owner automatically becomes a member with owner role
    """
    if not owner.can_create_groups:
        raise PermissionError("User does not have permission to create groups")

    group = Group(
        name=group_data.name,
        description=group_data.description,
        owner_id=owner.id,
    )
    session.add(group)
    await session.flush()

    # Create owner membership
    membership = GroupMembership(
        group_id=group.id,
        user_id=owner.id,
        role=MembershipRole.OWNER.value,
        status=MembershipStatus.ACTIVE.value,
    )
    session.add(membership)

    await session.commit()
    await session.refresh(group)

    return group


async def get_group(
    session: AsyncSession,
    group_id: str,
) -> Group | None:
    """Get a group by ID."""
    stmt = select(Group).where(Group.id == group_id).options(selectinload(Group.memberships))
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def list_user_groups(
    session: AsyncSession,
    user: User,
) -> list[Group]:
    """
    List all groups where user is a member.

    Returns groups where user has active membership.
    """
    stmt = (
        select(Group)
        .join(GroupMembership, GroupMembership.group_id == Group.id)
        .where(
            GroupMembership.user_id == user.id,
            GroupMembership.status == MembershipStatus.ACTIVE.value,
        )
        .order_by(Group.created_at.desc())
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def update_group(
    session: AsyncSession,
    group: Group,
    group_data: GroupUpdate,
) -> Group:
    """
    Update a group.

    Note: Authorization check (owner only) must be done in the route handler.
    """
    if group_data.name is not None:
        group.name = group_data.name
    if group_data.description is not None:
        group.description = group_data.description

    await session.commit()
    await session.refresh(group)
    return group


async def delete_group(
    session: AsyncSession,
    group: Group,
) -> None:
    """
    Delete a group.

    Note: Authorization check (owner only) must be done in the route handler.
    Memberships are deleted automatically via CASCADE.
    """
    await session.delete(group)
    await session.commit()


async def check_user_membership(
    session: AsyncSession,
    group_id: str,
    user_id: str,
) -> GroupMembership | None:
    """Check if user is a member of the group."""
    stmt = select(GroupMembership).where(
        GroupMembership.group_id == group_id,
        GroupMembership.user_id == user_id,
        GroupMembership.status == MembershipStatus.ACTIVE.value,
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def check_user_is_owner(
    session: AsyncSession,
    group_id: str,
    user_id: str,
) -> bool:
    """Check if user is the owner of the group."""
    membership = await check_user_membership(session, group_id, user_id)
    return membership is not None and membership.role == MembershipRole.OWNER.value


async def add_member(
    session: AsyncSession,
    group_id: str,
    user_id: str,
    role: MembershipRole = MembershipRole.MEMBER,
) -> GroupMembership:
    """
    Add a member to a group.

    Note: Authorization check must be done in the route handler.
    Raises exception if membership already exists.
    """
    existing = await check_user_membership(session, group_id, user_id)
    if existing is not None:
        raise ValueError("User is already a member of this group")

    membership = GroupMembership(
        group_id=group_id,
        user_id=user_id,
        role=role,
        status=MembershipStatus.ACTIVE.value,
    )
    session.add(membership)
    await session.commit()
    await session.refresh(membership)
    return membership


async def remove_member(
    session: AsyncSession,
    group_id: str,
    user_id: str,
) -> None:
    """
    Remove a member from a group.

    Note: Authorization check must be done in the route handler.
    Cannot remove owner.
    """
    membership = await check_user_membership(session, group_id, user_id)
    if membership is None:
        raise ValueError("User is not a member of this group")

    if membership.role == MembershipRole.OWNER.value:
        raise ValueError("Cannot remove group owner")

    await session.delete(membership)
    await session.commit()


async def list_group_members(
    session: AsyncSession,
    group_id: str,
) -> list[tuple[GroupMembership, User]]:
    """
    List all members of a group with their user info.

    Returns list of (membership, user) tuples.
    """
    stmt = (
        select(GroupMembership, User)
        .join(User, GroupMembership.user_id == User.id)
        .where(
            GroupMembership.group_id == group_id,
            GroupMembership.status == MembershipStatus.ACTIVE.value,
        )
        .order_by(
            GroupMembership.role.desc(),  # Owner first
            User.first_name,
        )
    )
    result = await session.execute(stmt)
    return list(result.all())
