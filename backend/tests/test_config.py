from app.core.config import Settings


def test_settings_load_required_values(test_settings: Settings) -> None:
    assert test_settings.app_env == "test"
    assert str(test_settings.database_url).startswith("sqlite+aiosqlite://")
    assert str(test_settings.redis_url).startswith("redis://")
