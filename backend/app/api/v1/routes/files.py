"""File serving API endpoints."""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models import Attachment

router = APIRouter()


@router.get("/files/{attachment_id}")
async def get_file(
    attachment_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Serve file by attachment ID."""
    stmt = select(Attachment).where(Attachment.id == attachment_id)
    result = await session.execute(stmt)
    attachment = result.scalar_one_or_none()

    if not attachment:
        raise HTTPException(status_code=404, detail="File not found")

    file_path = Path(attachment.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        path=file_path,
        media_type=attachment.mime_type or "application/octet-stream",
        filename=attachment.file_name,
    )
