"""Application configuration."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "Todo Bot - Vazifa Eslatuvchi"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str

    # Claude AI (for task parsing) - optional, date parsing now uses simple_date_parser
    claude_api_key: str | None = None
    claude_model: str = "claude-haiku-4-5-20251001"

    # OpenAI (for speech-to-text) - optional
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"

    # Telegram
    telegram_bot_token: str
    telegram_webhook_url: str | None = None
    telegram_webhook_secret: str | None = None

    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 30  # 30 days

    # CORS
    backend_cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
