from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.db.types import GUID


class GroupBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=128)
    description: str | None = Field(None, max_length=1000)


class GroupCreate(GroupBase):
    pass


class GroupUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=128)
    description: str | None = Field(None, max_length=1000)


class GroupResponse(GroupBase):
    model_config = ConfigDict(from_attributes=True)

    id: GUID
    owner_id: GUID
    created_at: datetime
    updated_at: datetime


class GroupListResponse(BaseModel):
    groups: list[GroupResponse]
    total: int
