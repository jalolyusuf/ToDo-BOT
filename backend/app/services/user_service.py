"""User service for managing users."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User


async def get_or_create_user(
    session: AsyncSession,
    telegram_id: int,
    username: str | None,
    first_name: str,
    last_name: str | None,
    language_code: str | None,
) -> User:
    """
    Get or create user from Telegram data.

    If user exists, updates their info. Otherwise creates new user.
    """
    # Try to find existing user
    stmt = select(User).where(User.telegram_id == telegram_id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if user:
        # Update user info
        user.username = username
        user.first_name = first_name
        user.last_name = last_name
        if language_code:
            user.language_code = language_code
    else:
        # Create new user
        user = User(
            telegram_id=telegram_id,
            username=username,
            first_name=first_name,
            last_name=last_name,
            language_code=language_code or "en",
            preferred_language=language_code or "en",
        )
        session.add(user)

    await session.commit()
    await session.refresh(user)
    return user
