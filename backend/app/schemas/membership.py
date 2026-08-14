from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.db.types import GUID
from app.models.group_membership import MembershipRole, MembershipStatus


class MembershipBase(BaseModel):
    role: MembershipRole
    status: MembershipStatus


class MembershipResponse(MembershipBase):
    model_config = ConfigDict(from_attributes=True)

    id: GUID
    group_id: GUID
    user_id: GUID
    created_at: datetime
    updated_at: datetime


class MembershipWithUserResponse(MembershipResponse):
    user_first_name: str
    user_last_name: str | None
    user_username: str | None


class AddMemberRequest(BaseModel):
    user_id: GUID
    role: MembershipRole = MembershipRole.MEMBER


class MemberListResponse(BaseModel):
    members: list[MembershipWithUserResponse]
    total: int
