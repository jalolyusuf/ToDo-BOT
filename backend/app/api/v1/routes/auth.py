from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import CurrentUserResponse

router = APIRouter()


@router.get("/auth/me", response_model=CurrentUserResponse)
async def get_current_user_route(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    return current_user
