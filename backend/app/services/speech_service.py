"""Speech-to-text service using OpenAI Whisper."""

from openai import AsyncOpenAI

from app.core.config import get_settings

settings = get_settings()


class SpeechService:
    """Service for converting speech to text."""

    def __init__(self):
        """Initialize OpenAI client."""
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)

    async def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Transcribe audio file to text.

        Args:
            audio_file_path: Path to audio file

        Returns:
            Transcribed text
        """
        try:
            with open(audio_file_path, "rb") as audio_file:
                transcript = await self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language="uz",  # Uzbek language
                )
            return transcript.text
        except Exception as e:
            raise RuntimeError(f"Failed to transcribe audio: {str(e)}")


# Singleton
speech_service = SpeechService()
