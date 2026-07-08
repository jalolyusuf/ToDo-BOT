import hmac
import json
from datetime import UTC, datetime
from hashlib import sha256
from urllib.parse import quote_plus

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.config import Settings
from app.main import create_app
from app.telegram.auth import parse_authorization_header, validate_telegram_init_data


def build_tma_init_data(
    bot_token: str,
    user_data: dict[str, object],
    auth_date: str | None = None,
) -> str:
    auth_date = auth_date or str(int(datetime.now(UTC).timestamp()))
    payload = {
        "auth_date": auth_date,
        "user": json.dumps(user_data, separators=(",", ":")),
    }
    data_check_string = "\n".join(f"{key}={value}" for key, value in sorted(payload.items()))
    secret_key = hmac.new(
        key=b"WebAppData",
        msg=bot_token.encode("utf-8"),
        digestmod=sha256,
    ).digest()
    payload["hash"] = hmac.new(secret_key, data_check_string.encode("utf-8"), sha256).hexdigest()
    return "&".join(f"{key}={quote_plus(value)}" for key, value in payload.items())


def test_parse_authorization_header_accepts_valid_header() -> None:
    scheme, token = parse_authorization_header("TMA some-init-data")

    assert scheme == "TMA"
    assert token == "some-init-data"


def test_parse_authorization_header_rejects_malformed_header() -> None:
    with pytest.raises(ValueError, match="Malformed Authorization header"):
        parse_authorization_header("missing-separator")


def test_validate_telegram_init_data_accepts_valid_data() -> None:
    settings = Settings()
    settings.telegram_bot_token = "test-bot-token"
    user_data = {
        "id": 111,
        "username": "user",
        "first_name": "First",
        "last_name": "Last",
        "language_code": "en",
    }

    init_data = build_tma_init_data(settings.telegram_bot_token, user_data)
    telegram_user = validate_telegram_init_data(init_data, settings)

    assert telegram_user.id == user_data["id"]
    assert telegram_user.username == user_data["username"]
    assert telegram_user.first_name == user_data["first_name"]


def test_validate_telegram_init_data_rejects_tampered_hash() -> None:
    settings = Settings()
    settings.telegram_bot_token = "test-bot-token"
    user_data = {
        "id": 111,
        "username": "user",
        "first_name": "First",
        "last_name": "Last",
        "language_code": "en",
    }
    init_data = build_tma_init_data(settings.telegram_bot_token, user_data)
    tampered_init_data = "&".join(
        part if not part.startswith("hash=") else "hash=invalidsignature"
        for part in init_data.split("&")
    )

    with pytest.raises(ValueError, match="Invalid initData signature"):
        validate_telegram_init_data(tampered_init_data, settings)


def test_validate_telegram_init_data_rejects_missing_hash() -> None:
    settings = Settings()
    settings.telegram_bot_token = "test-bot-token"

    with pytest.raises(ValueError, match="Missing initData hash"):
        validate_telegram_init_data("auth_date=1&user=%7B%7D", settings)


def test_validate_telegram_init_data_rejects_missing_auth_date() -> None:
    settings = Settings()
    settings.telegram_bot_token = "test-bot-token"

    with pytest.raises(ValueError, match="Missing auth_date"):
        validate_telegram_init_data("hash=abc&user=%7B%7D", settings)


def test_validate_telegram_init_data_rejects_expired_init_data() -> None:
    settings = Settings()
    settings.telegram_bot_token = "test-bot-token"
    user_data = {
        "id": 111,
        "username": "user",
        "first_name": "First",
        "last_name": "Last",
        "language_code": "en",
    }
    auth_date = str(int(datetime.now(UTC).timestamp()) - 1000)
    init_data = build_tma_init_data(settings.telegram_bot_token, user_data, auth_date=auth_date)

    with pytest.raises(ValueError, match="Expired initData"):
        validate_telegram_init_data(init_data, settings)


def test_validate_telegram_init_data_rejects_future_auth_date() -> None:
    settings = Settings()
    settings.telegram_bot_token = "test-bot-token"
    user_data = {
        "id": 111,
        "username": "user",
        "first_name": "First",
        "last_name": "Last",
        "language_code": "en",
    }
    auth_date = str(int(datetime.now(UTC).timestamp()) + 1000)
    init_data = build_tma_init_data(settings.telegram_bot_token, user_data, auth_date=auth_date)

    with pytest.raises(ValueError, match="Expired initData"):
        validate_telegram_init_data(init_data, settings)


def test_validate_telegram_init_data_rejects_missing_user_payload() -> None:
    settings = Settings()
    settings.telegram_bot_token = "test-bot-token"
    auth_date = str(int(datetime.now(UTC).timestamp()))
    payload = {"auth_date": auth_date}
    data_check_string = "\n".join(f"{key}={value}" for key, value in sorted(payload.items()))
    secret_key = hmac.new(
        b"WebAppData",
        settings.telegram_bot_token.encode("utf-8"),
        sha256,
    ).digest()
    init_hash = hmac.new(secret_key, data_check_string.encode("utf-8"), sha256).hexdigest()

    with pytest.raises(ValueError, match="Missing user payload"):
        validate_telegram_init_data(f"auth_date={auth_date}&hash={init_hash}", settings)


def test_validate_telegram_init_data_rejects_malformed_user_json() -> None:
    settings = Settings()
    settings.telegram_bot_token = "test-bot-token"
    auth_date = str(int(datetime.now(UTC).timestamp()))
    payload = {"auth_date": auth_date, "user": "not-json"}
    data_check_string = "\n".join(f"{key}={value}" for key, value in sorted(payload.items()))
    secret_key = hmac.new(
        b"WebAppData",
        settings.telegram_bot_token.encode("utf-8"),
        sha256,
    ).digest()
    init_hash = hmac.new(secret_key, data_check_string.encode("utf-8"), sha256).hexdigest()
    init_data = f"auth_date={auth_date}&user=not-json&hash={init_hash}"

    with pytest.raises(ValueError, match="Malformed user JSON"):
        validate_telegram_init_data(init_data, settings)


class FakeRedis:
    async def ping(self) -> bool:
        return True

    async def aclose(self) -> None:
        return None


@pytest.mark.asyncio
async def test_auth_me_requires_authorization_header(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/me")

    assert response.status_code == 401
    assert response.json()["detail"] == "Missing authentication"


@pytest.mark.asyncio
async def test_auth_me_rejects_invalid_tma_header(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/me", headers={"Authorization": "tma invalid-data"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or expired Telegram authentication"


@pytest.mark.asyncio
async def test_auth_me_rejects_unsupported_auth_scheme(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/me", headers={"Authorization": "Bearer token"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Unsupported authentication scheme"


@pytest.mark.asyncio
async def test_auth_me_rejects_malformed_auth_header(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/me", headers={"Authorization": "malformed"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid authentication header"


@pytest.mark.asyncio
async def test_auth_me_creates_user_from_valid_tma_init_data(
    client: AsyncClient,
    test_settings: Settings,
) -> None:
    assert test_settings.telegram_bot_token is not None
    bot_token = test_settings.telegram_bot_token
    init_data = build_tma_init_data(
        bot_token,
        {
            "id": 1234567890,
            "username": "testuser",
            "first_name": "Test",
            "last_name": "User",
            "language_code": "en",
        },
    )

    response = await client.get("/api/v1/auth/me", headers={"Authorization": f"tma {init_data}"})

    assert response.status_code == 200
    body = response.json()
    assert body["telegram_user_id"] == 1234567890
    assert body["username"] == "testuser"
    assert body["first_name"] == "Test"
    assert body["last_name"] == "User"


@pytest.mark.asyncio
async def test_auth_me_allows_dev_auth_when_enabled() -> None:
    settings = Settings()
    settings.app_env = "development"
    settings.dev_auth_enabled = True
    settings.dev_auth_token = "dev-token"
    settings.dev_auth_telegram_user_id = 5555
    settings.dev_auth_first_name = "Dev"
    settings.dev_auth_username = "dev_user"
    settings.dev_auth_last_name = "Tester"
    settings.dev_auth_language_code = "en"

    app = create_app(settings)
    app.state.redis = FakeRedis()
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as async_client:
        response = await async_client.get(
            "/api/v1/auth/me", headers={"Authorization": "dev dev-token"}
        )

    assert response.status_code == 200
    body = response.json()
    assert body["telegram_user_id"] == 5555
    assert body["username"] == "dev_user"
    assert body["first_name"] == "Dev"


@pytest.mark.asyncio
async def test_dev_auth_is_disabled_by_default(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/me", headers={"Authorization": "dev dev-token"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Development auth is disabled"


@pytest.mark.asyncio
async def test_dev_auth_rejects_wrong_token_in_development() -> None:
    settings = Settings()
    settings.app_env = "development"
    settings.dev_auth_enabled = True
    settings.dev_auth_token = "expected-token"
    settings.dev_auth_telegram_user_id = 5555
    settings.dev_auth_first_name = "Dev"
    settings.dev_auth_username = "dev_user"
    settings.dev_auth_last_name = "Tester"
    settings.dev_auth_language_code = "en"

    app = create_app(settings)
    app.state.redis = FakeRedis()
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as async_client:
        response = await async_client.get(
            "/api/v1/auth/me", headers={"Authorization": "dev wrong-token"}
        )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid development authentication token"


@pytest.mark.asyncio
async def test_dev_auth_rejected_outside_development_even_with_valid_token() -> None:
    settings = Settings()
    settings.app_env = "production"
    settings.dev_auth_enabled = True
    settings.dev_auth_token = "dev-token"
    settings.dev_auth_telegram_user_id = 5555
    settings.dev_auth_first_name = "Dev"
    settings.dev_auth_username = "dev_user"
    settings.dev_auth_last_name = "Tester"
    settings.dev_auth_language_code = "en"

    app = create_app(settings)
    app.state.redis = FakeRedis()
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as async_client:
        response = await async_client.get(
            "/api/v1/auth/me", headers={"Authorization": "dev dev-token"}
        )

    assert response.status_code == 401
    assert response.json()["detail"] == "Development auth is disabled"


def test_build_tma_init_data_uses_official_webappdata_hmac() -> None:
    bot_token = "test-bot-token"
    user_data = {
        "id": 111,
        "username": "user",
        "first_name": "First",
        "last_name": "Last",
        "language_code": "en",
    }
    init_data = build_tma_init_data(bot_token, user_data)

    assert "hash=" in init_data
    assert "auth_date=" in init_data


def test_build_tma_init_data_rejects_legacy_sha256_derivation() -> None:
    bot_token = "test-bot-token"
    user_data = {
        "id": 111,
        "username": "user",
        "first_name": "First",
        "last_name": "Last",
        "language_code": "en",
    }
    auth_date = str(int(datetime.now(UTC).timestamp()))
    payload = {
        "auth_date": auth_date,
        "user": json.dumps(user_data, separators=(",", ":")),
    }
    data_check_string = "\n".join(f"{key}={value}" for key, value in sorted(payload.items()))
    legacy_secret = sha256(bot_token.encode("utf-8")).digest()
    legacy_hash = hmac.new(legacy_secret, data_check_string.encode("utf-8"), sha256).hexdigest()
    legacy_init_data = "&".join(
        f"{key}={quote_plus(value)}" for key, value in {**payload, "hash": legacy_hash}.items()
    )

    assert legacy_init_data != build_tma_init_data(bot_token, user_data, auth_date=auth_date)


@pytest.mark.asyncio
async def test_auth_me_rejects_sha256_bot_token_derived_init_data(
    client: AsyncClient,
    test_settings: Settings,
) -> None:
    assert test_settings.telegram_bot_token is not None
    bot_token = test_settings.telegram_bot_token
    user_data = {
        "id": 1234567890,
        "username": "testuser",
        "first_name": "Test",
        "last_name": "User",
        "language_code": "en",
    }
    auth_date = str(int(datetime.now(UTC).timestamp()))
    payload = {
        "auth_date": auth_date,
        "user": json.dumps(user_data, separators=(",", ":")),
    }
    data_check_string = "\n".join(f"{key}={value}" for key, value in sorted(payload.items()))
    legacy_secret = sha256(bot_token.encode("utf-8")).digest()
    legacy_hash = hmac.new(legacy_secret, data_check_string.encode("utf-8"), sha256).hexdigest()
    legacy_init_data = "&".join(
        f"{key}={quote_plus(value)}" for key, value in {**payload, "hash": legacy_hash}.items()
    )

    response = await client.get(
        "/api/v1/auth/me", headers={"Authorization": f"tma {legacy_init_data}"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or expired Telegram authentication"
