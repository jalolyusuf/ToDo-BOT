"""API dependencies for user authentication."""

from uuid import UUID

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models import User


async def get_current_user_id(
    x_telegram_user_id: str | None = Header(None, alias="X-Telegram-User-ID"),
    session: AsyncSession = Depends(get_session),
) -> UUID:
    """
    Get current user UUID from Telegram user ID header.

    Frontend sends Telegram user ID (integer) in X-Telegram-User-ID header.
    Backend looks up User by telegram_id and returns User.id (UUID).
    """
    if not x_telegram_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-Telegram-User-ID header required. Access only from Telegram Mini App.",
        )

    try:
        telegram_id = int(x_telegram_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Telegram User ID format",
        )

    # Find user by telegram_id
    stmt = select(User).where(User.telegram_id == telegram_id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please start bot with /start command.",
        )

    return user.id
