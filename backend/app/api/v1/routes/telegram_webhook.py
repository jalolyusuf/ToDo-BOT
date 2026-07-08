from fastapi import APIRouter, Header, HTTPException, Request, status

from app.telegram.bot import create_bot, create_dispatcher

router = APIRouter()


@router.post("/telegram/webhook")
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: str | None = Header(None),
) -> dict[str, str]:
    settings = request.app.state.settings
    if not settings.telegram_webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Telegram webhook is not configured",
        )
    if x_telegram_bot_api_secret_token != settings.telegram_webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook secret",
        )

    body = await request.json()
    bot = create_bot()
    dispatcher = create_dispatcher()
    await dispatcher.feed_raw_update(bot, body)
    return {"status": "ok"}
