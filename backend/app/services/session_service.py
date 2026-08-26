"""Session service for conversational bot state management."""

import json
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import SessionState, UserSession


class SessionService:
    """Service for managing user sessions."""

    @staticmethod
    async def get_or_create_session(session: AsyncSession, user_id: UUID) -> UserSession:
        """Get or create user session."""
        stmt = select(UserSession).where(UserSession.user_id == user_id)
        result = await session.execute(stmt)
        user_session = result.scalar_one_or_none()

        if not user_session:
            user_session = UserSession(user_id=user_id, state=SessionState.IDLE)
            session.add(user_session)
            await session.commit()
            await session.refresh(user_session)

        return user_session

    @staticmethod
    async def set_state(session: AsyncSession, user_id: UUID, state: SessionState) -> UserSession:
        """Set user session state."""
        user_session = await SessionService.get_or_create_session(session, user_id)
        user_session.state = state
        await session.commit()
        await session.refresh(user_session)
        return user_session

    @staticmethod
    async def reset_session(session: AsyncSession, user_id: UUID, keep_last_task: bool = False) -> UserSession:
        """Reset user session to IDLE."""
        user_session = await SessionService.get_or_create_session(session, user_id)
        user_session.state = SessionState.IDLE
        user_session.task_messages = None
        user_session.task_attachments = None
        if not keep_last_task:
            user_session.last_task_id = None
        await session.commit()
        await session.refresh(user_session)
        return user_session

    @staticmethod
    async def set_last_task(session: AsyncSession, user_id: UUID, task_id: int) -> UserSession:
        """Set last created task ID for attachment linking."""
        user_session = await SessionService.get_or_create_session(session, user_id)
        user_session.last_task_id = task_id
        await session.commit()
        await session.refresh(user_session)
        return user_session

    @staticmethod
    async def get_last_task_id(session: AsyncSession, user_id: UUID) -> int | None:
        """Get last created task ID."""
        user_session = await SessionService.get_or_create_session(session, user_id)
        return user_session.last_task_id

    @staticmethod
    async def add_task_message(session: AsyncSession, user_id: UUID, message: str) -> UserSession:
        """Add message to task creation session."""
        user_session = await SessionService.get_or_create_session(session, user_id)

        messages = json.loads(user_session.task_messages) if user_session.task_messages else []
        messages.append(message)
        user_session.task_messages = json.dumps(messages, ensure_ascii=False)

        await session.commit()
        await session.refresh(user_session)
        return user_session

    @staticmethod
    async def add_task_attachment(session: AsyncSession, user_id: UUID, attachment_id: int) -> UserSession:
        """Add attachment ID to task creation session."""
        user_session = await SessionService.get_or_create_session(session, user_id)

        attachments = json.loads(user_session.task_attachments) if user_session.task_attachments else []
        attachments.append(attachment_id)
        user_session.task_attachments = json.dumps(attachments)

        await session.commit()
        await session.refresh(user_session)
        return user_session

    @staticmethod
    async def get_task_data(session: AsyncSession, user_id: UUID) -> dict:
        """Get collected task data."""
        user_session = await SessionService.get_or_create_session(session, user_id)

        messages = json.loads(user_session.task_messages) if user_session.task_messages else []
        attachments = json.loads(user_session.task_attachments) if user_session.task_attachments else []

        return {"messages": messages, "attachments": attachments}


session_service = SessionService()
