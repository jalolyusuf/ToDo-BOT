"""Telegram Mini App menu button service."""

from aiogram import Bot

from app.core.config import get_settings

settings = get_settings()


async def setup_mini_app_button(bot: Bot):
    """Setup Telegram Mini App menu button."""
    try:
        # Set menu button to open Mini App
        await bot.set_chat_menu_button(
            menu_button={
                "type": "web_app",
                "text": "📋 Vazifalar",
                "web_app": {"url": f"{settings.telegram_webhook_url}"},
            }
        )
        print("✅ Telegram Mini App button set successfully")
    except Exception as e:
        print(f"❌ Error setting Mini App button: {e}")


async def set_bot_commands(bot: Bot):
    """Set bot commands."""
    try:
        commands = [
            {"command": "start", "description": "Botni ishga tushirish"},
            {"command": "list", "description": "Vazifalar ro'yxati"},
            {"command": "done", "description": "Vazifani bajarildi deb belgilash"},
            {"command": "delete", "description": "Vazifani o'chirish"},
        ]
        await bot.set_my_commands(commands)
        print("✅ Bot commands set successfully")
    except Exception as e:
        print(f"❌ Error setting commands: {e}")
