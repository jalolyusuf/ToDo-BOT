from collections.abc import AsyncGenerator

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.db.session import async_session_factory
from app.models.user import User
from app.services.user_service import get_or_create_or_update_from_telegram_user
from app.telegram.auth import (
    build_dev_telegram_user,
    parse_authorization_header,
    validate_telegram_init_data,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    assert async_session_factory is not None
    async with async_session_factory() as session:
        yield session


async def get_authorization_header(request: Request) -> str:
    authorization = request.headers.get("authorization")
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication",
        )
    return authorization


authorization_header_dependency = Depends(get_authorization_header)
db_session_dependency = Depends(get_db_session)


async def get_current_user(
    request: Request,
    authorization: str = authorization_header_dependency,
    session: AsyncSession = db_session_dependency,
) -> User:
    try:
        scheme, token = parse_authorization_header(authorization)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication header",
        ) from exc

    settings: Settings = request.app.state.settings
    if scheme.lower() == "tma":
        try:
            telegram_user = validate_telegram_init_data(token, settings)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired Telegram authentication",
            ) from exc
    elif scheme.lower() == "dev":
        try:
            telegram_user = build_dev_telegram_user(settings, token=token)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(exc),
            ) from exc
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unsupported authentication scheme",
        )

    user = await get_or_create_or_update_from_telegram_user(session, telegram_user)
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive account")
    return user
