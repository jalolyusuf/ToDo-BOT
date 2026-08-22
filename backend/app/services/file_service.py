"""File service for handling uploads and downloads."""

import os
from pathlib import Path
from uuid import uuid4

from aiogram import Bot
from aiogram.types import Message

from app.core.config import get_settings
from app.models import Attachment, AttachmentType

settings = get_settings()

# File storage directory
STORAGE_DIR = Path("/app/storage")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)


class FileService:
    """Service for file operations."""

    @staticmethod
    async def download_telegram_file(bot: Bot, message: Message, file_type: AttachmentType) -> dict:
        """
        Download file from Telegram and save to storage.

        Returns:
            dict with file_path, file_name, file_size, etc.
        """
        file_id = None
        file_unique_id = None
        file_name = None
        file_size = None
        mime_type = None
        duration = None
        width = None
        height = None

        # Extract file info based on type
        if file_type == AttachmentType.PHOTO:
            # Get largest photo
            photo = message.photo[-1]
            file_id = photo.file_id
            file_unique_id = photo.file_unique_id
            file_size = photo.file_size
            width = photo.width
            height = photo.height
            file_name = f"{uuid4().hex}.jpg"

        elif file_type == AttachmentType.VOICE:
            voice = message.voice
            file_id = voice.file_id
            file_unique_id = voice.file_unique_id
            file_size = voice.file_size
            duration = voice.duration
            mime_type = voice.mime_type
            file_name = f"{uuid4().hex}.ogg"

        elif file_type == AttachmentType.VIDEO:
            video = message.video
            file_id = video.file_id
            file_unique_id = video.file_unique_id
            file_size = video.file_size
            duration = video.duration
            width = video.width
            height = video.height
            mime_type = video.mime_type
            file_name = video.file_name or f"{uuid4().hex}.mp4"

        elif file_type == AttachmentType.DOCUMENT:
            document = message.document
            file_id = document.file_id
            file_unique_id = document.file_unique_id
            file_size = document.file_size
            mime_type = document.mime_type
            file_name = document.file_name or f"{uuid4().hex}.bin"

        elif file_type == AttachmentType.AUDIO:
            audio = message.audio
            file_id = audio.file_id
            file_unique_id = audio.file_unique_id
            file_size = audio.file_size
            duration = audio.duration
            mime_type = audio.mime_type
            file_name = audio.file_name or f"{uuid4().hex}.mp3"

        if not file_id:
            raise ValueError(f"Could not extract file_id for type {file_type}")

        # Download file
        file = await bot.get_file(file_id)
        file_path = STORAGE_DIR / file_name
        await bot.download_file(file.file_path, file_path)

        return {
            "file_type": file_type,
            "file_name": file_name,
            "file_path": str(file_path),
            "file_size": file_size,
            "mime_type": mime_type,
            "telegram_file_id": file_id,
            "telegram_file_unique_id": file_unique_id,
            "duration": duration,
            "width": width,
            "height": height,
        }

    @staticmethod
    def get_file_url(attachment: Attachment) -> str:
        """Get public URL for attachment."""
        return f"/api/v1/files/{attachment.id}"


file_service = FileService()
