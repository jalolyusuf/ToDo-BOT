from functools import lru_cache

from pydantic import AnyUrl, Field, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


def _parse_cors_origins(value: str | list[str] | None) -> list[str]:
    if isinstance(value, list):
        return value
    if value is None:
        return []
    if not value:
        return []
    return [origin.strip() for origin in value.split(",") if origin.strip()]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_env: str = Field(default="development", validation_alias="APP_ENV")
    app_name: str = Field(default="Telegram Task Management Platform", validation_alias="APP_NAME")
    debug: bool = Field(default=False, validation_alias="DEBUG")
    api_v1_prefix: str = Field(default="/api/v1", validation_alias="API_V1_PREFIX")

    database_url: AnyUrl = Field(validation_alias="DATABASE_URL")
    redis_url: RedisDsn = Field(validation_alias="REDIS_URL")

    postgres_db: str = Field(validation_alias="POSTGRES_DB")
    postgres_user: str = Field(validation_alias="POSTGRES_USER")
    postgres_password: str = Field(validation_alias="POSTGRES_PASSWORD")

    backend_cors_origins_raw: str = Field(default="", validation_alias="BACKEND_CORS_ORIGINS")

    @property
    def backend_cors_origins(self) -> list[str]:
        return _parse_cors_origins(self.backend_cors_origins_raw)

    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")
    log_format: str = Field(default="console", validation_alias="LOG_FORMAT")

    telegram_bot_token: str | None = Field(
        default=None,
        validation_alias="TELEGRAM_BOT_TOKEN",
    )
    telegram_bot_username: str | None = Field(
        default=None,
        validation_alias="TELEGRAM_BOT_USERNAME",
    )
    telegram_mini_app_url: str | None = Field(
        default=None,
        validation_alias="TELEGRAM_MINI_APP_URL",
    )
    telegram_webhook_secret: str | None = Field(
        default=None,
        validation_alias="TELEGRAM_WEBHOOK_SECRET",
    )
    telegram_init_data_max_age_seconds: int = Field(
        default=300,
        validation_alias="TELEGRAM_INIT_DATA_MAX_AGE_SECONDS",
    )

    dev_auth_enabled: bool = Field(default=False, validation_alias="DEV_AUTH_ENABLED")
    dev_auth_telegram_user_id: int | None = Field(
        default=None,
        validation_alias="DEV_AUTH_TELEGRAM_USER_ID",
    )
    dev_auth_first_name: str | None = Field(
        default=None,
        validation_alias="DEV_AUTH_FIRST_NAME",
    )
    dev_auth_username: str | None = Field(
        default=None,
        validation_alias="DEV_AUTH_USERNAME",
    )
    dev_auth_last_name: str | None = Field(
        default=None,
        validation_alias="DEV_AUTH_LAST_NAME",
    )
    dev_auth_language_code: str | None = Field(
        default="en",
        validation_alias="DEV_AUTH_LANGUAGE_CODE",
    )
    dev_auth_token: str | None = Field(default=None, validation_alias="DEV_AUTH_TOKEN")


@lru_cache
def get_settings() -> Settings:
    return Settings()
