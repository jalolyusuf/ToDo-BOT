from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.group_membership import MembershipRole, MembershipStatus


class MembershipBase(BaseModel):
    role: MembershipRole
    status: MembershipStatus


class MembershipResponse(MembershipBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    group_id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class MembershipWithUserResponse(MembershipResponse):
    user_first_name: str
    user_last_name: str | None
    user_username: str | None


class AddMemberRequest(BaseModel):
    user_id: UUID
    role: MembershipRole = MembershipRole.MEMBER


class MemberListResponse(BaseModel):
    members: list[MembershipWithUserResponse]
    total: int
