"""Media playback API - Send video/audio via Telegram bot."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id
from app.db import get_session
from app.models import Attachment, User
from app.telegram.bot import create_bot

router = APIRouter()


@router.post("/media/{attachment_id}/play")
async def play_media(
    attachment_id: int,
    session: AsyncSession = Depends(get_session),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Send video/audio to user via Telegram bot.

    This endpoint is called when user clicks "Play" in Web UI.
    Bot sends the media file to user's Telegram.
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
        if attachment.file_type.value == "video":
            await bot.send_video(
                chat_id=user.telegram_id,
                video=attachment.telegram_file_id,
                caption=f"🎬 {attachment.file_name}",
            )
        elif attachment.file_type.value == "voice":
            await bot.send_voice(
                chat_id=user.telegram_id,
                voice=attachment.telegram_file_id,
            )
        elif attachment.file_type.value == "audio":
            await bot.send_audio(
                chat_id=user.telegram_id,
                audio=attachment.telegram_file_id,
                caption=f"🎵 {attachment.file_name}",
            )
        elif attachment.file_type.value == "document":
            await bot.send_document(
                chat_id=user.telegram_id,
                document=attachment.telegram_file_id,
                caption=f"📄 {attachment.file_name}",
            )
        else:
            raise HTTPException(status_code=400, detail="File type not supported")

        return {"status": "sent", "message": "Media yuborildi! Telegram'da ko'ring."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send media: {str(e)}")
    finally:
        await bot.session.close()
