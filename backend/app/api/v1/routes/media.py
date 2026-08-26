"""Media playback API - Send video/audio via Telegram bot."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id
from app.core.config import get_settings
from app.db import get_session
from app.models import Attachment, User
from app.telegram.bot import create_bot

router = APIRouter()
settings = get_settings()


@router.post("/media/{attachment_id}/play")
async def play_media(
    attachment_id: int,
    session: AsyncSession = Depends(get_session),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Send video/audio to user via Telegram bot.

    Uses storage channel if configured (forwards from channel).
    Otherwise sends using telegram_file_id.
    """
    # Get attachment
    stmt = select(Attachment).where(Attachment.id == attachment_id)
    result = await session.execute(stmt)
    attachment = result.scalar_one_or_none()

    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    if not attachment.telegram_file_id:
        raise HTTPException(status_code=400, detail="File not available on Telegram")

    # Get user's telegram_id
    stmt = select(User).where(User.id == user_id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.telegram_id:
        raise HTTPException(status_code=404, detail="User not found")

    # Send via bot
    bot = create_bot()
    try:
        file_type = attachment.file_type.value if hasattr(attachment.file_type, 'value') else attachment.file_type
        storage_channel_id = settings.telegram_storage_channel_id

        # Try to forward from storage channel first (most reliable)
        if storage_channel_id and attachment.channel_message_id:
            try:
                await bot.forward_message(
                    chat_id=user.telegram_id,
                    from_chat_id=storage_channel_id,
                    message_id=attachment.channel_message_id,
                )
                return {"status": "sent", "message": "Media yuborildi! Telegram'da ko'ring."}
            except Exception:
                pass  # Fall back to direct send

        # Fall back to sending using file_id
        if file_type == "video":
            await bot.send_video(
                chat_id=user.telegram_id,
                video=attachment.telegram_file_id,
                caption=f"🎬 {attachment.file_name}",
            )
        elif file_type == "voice":
            await bot.send_voice(
                chat_id=user.telegram_id,
                voice=attachment.telegram_file_id,
            )
        elif file_type == "audio":
            await bot.send_audio(
                chat_id=user.telegram_id,
                audio=attachment.telegram_file_id,
                caption=f"🎵 {attachment.file_name}",
            )
        elif file_type == "document":
            await bot.send_document(
                chat_id=user.telegram_id,
                document=attachment.telegram_file_id,
                caption=f"📄 {attachment.file_name}",
            )
        elif file_type == "photo":
            await bot.send_photo(
                chat_id=user.telegram_id,
                photo=attachment.telegram_file_id,
            )
        else:
            raise HTTPException(status_code=400, detail="File type not supported")

        return {"status": "sent", "message": "Media yuborildi! Telegram'da ko'ring."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send media: {str(e)}")
    finally:
        await bot.session.close()
