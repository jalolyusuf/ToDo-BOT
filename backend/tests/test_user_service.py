import pytest
from sqlalchemy import select

from app.db.session import async_session_factory
from app.models.user import User
from app.services.user_service import get_or_create_or_update_from_telegram_user
from app.telegram.schemas import TelegramUser


@pytest.mark.asyncio
async def test_get_or_create_or_update_from_telegram_user_creates_and_updates_user(
    prepare_database: object,
) -> None:
    assert async_session_factory is not None
    async with async_session_factory() as session:
        telegram_user = TelegramUser(
            id=1234567890,
            username="first_user",
            first_name="First",
            last_name="User",
            language_code="en",
        )
        user = await get_or_create_or_update_from_telegram_user(session, telegram_user)
        await session.commit()

        assert user.telegram_user_id == 1234567890
        assert user.username == "first_user"

        user.can_create_groups = True
        user.is_active = False
        await session.commit()

        updated_telegram_user = TelegramUser(
            id=1234567890,
            username="second_user",
            first_name="Updated",
            last_name="Profile",
            language_code="ru",
        )
        updated_user = await get_or_create_or_update_from_telegram_user(
            session, updated_telegram_user
        )
        await session.commit()

        assert updated_user.id == user.id
        assert updated_user.telegram_user_id == user.telegram_user_id
        assert updated_user.username == "second_user"
        assert updated_user.first_name == "Updated"
        assert updated_user.last_name == "Profile"
        assert updated_user.language_code == "ru"
        assert updated_user.can_create_groups is True
        assert updated_user.is_active is False

        result = await session.execute(select(User).where(User.telegram_user_id == 1234567890))
        persisted_user = result.scalar_one()
        assert persisted_user.id == user.id
        assert persisted_user.username == "second_user"
        assert persisted_user.can_create_groups is True
        assert persisted_user.is_active is False
