import hmac
import json
from datetime import UTC, datetime
from hashlib import sha256
from urllib.parse import parse_qsl

from app.core.config import Settings
from app.telegram.schemas import TelegramUser


def validate_telegram_init_data(raw_init_data: str, settings: Settings) -> TelegramUser:
    if not settings.telegram_bot_token:
        raise ValueError("Telegram bot token is not configured")

    parsed = dict(parse_qsl(raw_init_data, keep_blank_values=True))
    if not parsed:
        raise ValueError("Malformed initData")

    raw_hash = parsed.pop("hash", None)
    if not raw_hash:
        raise ValueError("Missing initData hash")

    auth_date_value = parsed.get("auth_date")
    if auth_date_value is None:
        raise ValueError("Missing auth_date")

    try:
        auth_date = datetime.fromtimestamp(int(auth_date_value), UTC)
    except (TypeError, ValueError) as exc:
        raise ValueError("Invalid auth_date") from exc

    now = datetime.now(UTC)
    age_seconds = (now - auth_date).total_seconds()
    if age_seconds < 0 or age_seconds > settings.telegram_init_data_max_age_seconds:
        raise ValueError("Expired initData")

    user_json = parsed.get("user")
    if user_json is None:
        raise ValueError("Missing user payload")

    try:
        user_data = json.loads(user_json)
    except json.JSONDecodeError as exc:
        raise ValueError("Malformed user JSON") from exc

    if not isinstance(user_data, dict):
        raise ValueError("Telegram user payload must be an object")

    data_check_string = _build_data_check_string(parsed)
    secret_key = hmac.new(
        key=b"WebAppData",
        msg=settings.telegram_bot_token.encode("utf-8"),
        digestmod=sha256,
    ).digest()
    computed_hash = hmac.new(secret_key, data_check_string.encode("utf-8"), sha256).hexdigest()
    if not hmac.compare_digest(computed_hash, raw_hash):
        raise ValueError("Invalid initData signature")

    return TelegramUser.model_validate(user_data)


def build_dev_telegram_user(settings: Settings, token: str) -> TelegramUser:
    if not settings.dev_auth_enabled or settings.app_env != "development":
        raise ValueError("Development auth is disabled")

    if settings.dev_auth_token is None:
        raise ValueError("Development auth token is not configured")

    if not hmac.compare_digest(settings.dev_auth_token, token):
        raise ValueError("Invalid development authentication token")

    if settings.dev_auth_telegram_user_id is None or settings.dev_auth_first_name is None:
        raise ValueError("Development auth is not fully configured")

    return TelegramUser(
        id=settings.dev_auth_telegram_user_id,
        username=settings.dev_auth_username,
        first_name=settings.dev_auth_first_name,
        last_name=settings.dev_auth_last_name,
        language_code=settings.dev_auth_language_code,
    )


def _build_data_check_string(parsed_data: dict[str, str]) -> str:
    sorted_items = sorted(parsed_data.items())
    return "\n".join(f"{key}={value}" for key, value in sorted_items)


def parse_authorization_header(authorization_header: str) -> tuple[str, str]:
    try:
        scheme, token = authorization_header.split(" ", 1)
    except ValueError as exc:
        raise ValueError("Malformed Authorization header") from exc
    return scheme, token
