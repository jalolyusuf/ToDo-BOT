from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.telegram.schemas import TelegramUser


async def get_or_create_or_update_from_telegram_user(
    session: AsyncSession,
    telegram_user: TelegramUser,
) -> User:
    result = await session.execute(
        select(User).where(User.telegram_user_id == telegram_user.id)
    )
    user = result.scalar_one_or_none()
    if user is None:
        user = User(
            telegram_user_id=telegram_user.id,
            username=telegram_user.username,
            first_name=telegram_user.first_name,
            last_name=telegram_user.last_name,
            language_code=telegram_user.language_code,
        )
        session.add(user)
        await session.flush()
        return user

    updated = False
    for field_name in ("username", "first_name", "last_name", "language_code"):
        new_value = getattr(telegram_user, field_name)
        if getattr(user, field_name) != new_value:
            setattr(user, field_name, new_value)
            updated = True

    if updated:
        await session.flush()

    return user
