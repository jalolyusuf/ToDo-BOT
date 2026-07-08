import uuid

from pydantic import BaseModel


class CurrentUserResponse(BaseModel):
    id: uuid.UUID
    telegram_user_id: int
    username: str | None
    first_name: str
    last_name: str | None
    language_code: str | None
    can_create_groups: bool

    model_config = {
        "from_attributes": True,
    }
