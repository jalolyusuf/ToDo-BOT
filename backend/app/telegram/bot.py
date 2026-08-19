"""Telegram bot setup and handlers."""

from aiogram import Bot, Dispatcher, F, types
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import Command

from app.core.config import get_settings
from app.db import async_session_factory
from app.models import AttachmentType
from app.services.ai_service import ai_service
from app.services.user_service import get_or_create_user

settings = get_settings()


def create_bot() -> Bot:
    """Create Telegram bot instance."""
    return Bot(
        token=settings.telegram_bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.MARKDOWN),
    )


def create_dispatcher() -> Dispatcher:
    """Create and configure dispatcher with all handlers."""
    dp = Dispatcher()

    # Register handlers
    dp.message.register(handle_start, Command("start"))
    dp.message.register(handle_new_conversation, Command("new"))
    dp.message.register(handle_help, Command("help"))

    # Message type handlers
    dp.message.register(handle_photo, F.photo)
    dp.message.register(handle_document, F.document)
    dp.message.register(handle_video, F.video)
    dp.message.register(handle_audio, F.audio)
    dp.message.register(handle_voice, F.voice)
    dp.message.register(handle_video_note, F.video_note)

    # Text messages (catch-all)
    dp.message.register(handle_text_message)

    return dp


async def handle_start(message: types.Message) -> None:
    """Handle /start command."""
    user = message.from_user
    if not user:
        return

    async with async_session_factory() as session:
        await get_or_create_user(
            session,
            telegram_id=user.id,
            username=user.username,
            first_name=user.first_name or "",
            last_name=user.last_name,
            language_code=user.language_code,
        )

    welcome_text = """
🤖 *Welcome to Claude AI Assistant!*

I'm powered by Claude AI (Haiku model) and I'm here to help you with:
• Answering questions on any topic
• Writing and explaining code
• Analyzing images and documents
• General assistance and conversation

*Commands:*
/new - Start a new conversation
/help - Show this help message

Just send me a message to get started! 💬
"""
    await message.answer(welcome_text)


async def handle_help(message: types.Message) -> None:
    """Handle /help command."""
    help_text = """
*Claude AI Assistant - Help*

*What I can do:*
📝 Answer any questions
💻 Help with programming
🖼 Analyze images
📄 Read documents
🗣 Chat and assist

*Commands:*
/start - Welcome message
/new - Start fresh conversation
/help - Show this help

*Supported file types:*
• Photos & Images
• Documents (PDF, Word, etc.)
• Videos
• Audio & Voice messages

Just send me a message or file! 🚀
"""
    await message.answer(help_text)


async def handle_new_conversation(message: types.Message) -> None:
    """Handle /new command to start a new conversation."""
    user = message.from_user
    if not user:
        return

    async with async_session_factory() as session:
        db_user = await get_or_create_user(
            session,
            telegram_id=user.id,
            username=user.username,
            first_name=user.first_name or "",
            last_name=user.last_name,
            language_code=user.language_code,
        )

        # Archive current conversation and create new one
        conversation = await ai_service.get_or_create_conversation(session, db_user)
        conversation.status = "archived"
        await session.commit()

    await message.answer("✨ *New conversation started!* How can I help you?")


async def handle_text_message(message: types.Message) -> None:
    """Handle regular text messages."""
    user = message.from_user
    if not user or not message.text:
        return

    async with async_session_factory() as session:
        # Get or create user
        db_user = await get_or_create_user(
            session,
            telegram_id=user.id,
            username=user.username,
            first_name=user.first_name or "",
            last_name=user.last_name,
            language_code=user.language_code,
        )

        # Get or create conversation
        conversation = await ai_service.get_or_create_conversation(session, db_user)

        # Send typing indicator
        await message.bot.send_chat_action(message.chat.id, "typing")

        try:
            # Generate response
            response_msg = await ai_service.generate_response(
                session,
                conversation,
                message.text,
                telegram_message_id=message.message_id,
            )

            # Send response
            await message.answer(response_msg.content)

        except Exception as e:
            await message.answer(
                f"❌ Sorry, I encountered an error: {str(e)}\n\n"
                "Please try again or use /new to start a fresh conversation."
            )


async def handle_photo(message: types.Message) -> None:
    """Handle photo messages."""
    await message.answer(
        "📷 *Photo received!*\n\n"
        "Image analysis will be implemented soon. "
        "For now, I can help with text-based questions!"
    )


async def handle_document(message: types.Message) -> None:
    """Handle document messages."""
    doc = message.document
    if not doc:
        return

    doc_name = doc.file_name or "document"
    doc_size = doc.file_size or 0
    doc_size_mb = doc_size / (1024 * 1024)

    await message.answer(
        f"📄 *Document received:* `{doc_name}`\n"
        f"Size: {doc_size_mb:.2f} MB\n\n"
        "Document analysis will be implemented soon!"
    )


async def handle_video(message: types.Message) -> None:
    """Handle video messages."""
    await message.answer(
        "🎥 *Video received!*\n\n"
        "Video processing will be added in a future update."
    )


async def handle_audio(message: types.Message) -> None:
    """Handle audio messages."""
    await message.answer(
        "🎵 *Audio received!*\n\n"
        "Audio transcription coming soon!"
    )


async def handle_voice(message: types.Message) -> None:
    """Handle voice messages."""
    await message.answer(
        "🎤 *Voice message received!*\n\n"
        "Voice transcription will be available soon!"
    )


async def handle_video_note(message: types.Message) -> None:
    """Handle video note (circle video) messages."""
    await message.answer(
        "📹 *Video note received!*\n\n"
        "Video note processing coming soon!"
    )
