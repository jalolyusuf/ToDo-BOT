"""Telegram webhook endpoint."""

from fastapi import APIRouter, Header, HTTPException, Request, status

from app.core.config import get_settings
from app.telegram.bot import create_bot, create_dispatcher

router = APIRouter()
settings = get_settings()


@router.post("/telegram/webhook")
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: str | None = Header(None),
) -> dict[str, str]:
    """Handle incoming Telegram webhook updates."""

    # Verify webhook secret if configured
    if settings.telegram_webhook_secret:
        if x_telegram_bot_api_secret_token != settings.telegram_webhook_secret:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook secret",
            )

    # Process update
    body = await request.json()
    bot = create_bot()
    dispatcher = create_dispatcher()

    try:
        await dispatcher.feed_raw_update(bot, body)
    except Exception as e:
        # Log error but return 200 to prevent Telegram from retrying
        print(f"Error processing update: {e}")

    return {"status": "ok"}
