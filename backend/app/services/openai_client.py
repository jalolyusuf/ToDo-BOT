"""OpenAI client service."""

import json
from typing import Any

from openai import AsyncOpenAI

from app.core.config import get_settings

settings = get_settings()


class OpenAIClient:
    """OpenAI client for GPT models."""

    def __init__(self):
        """Initialize OpenAI client."""
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)

    async def invoke_gpt(
        self,
        messages: list[dict[str, Any]],
        system: str | None = None,
        max_tokens: int | None = None,
        temperature: float | None = None,
    ) -> dict[str, Any]:
        """
        Invoke GPT model.

        Args:
            messages: List of message dictionaries with 'role' and 'content'
            system: Optional system prompt
            max_tokens: Maximum tokens to generate
            temperature: Temperature for sampling (0-1)

        Returns:
            Response from GPT including generated text and token usage
        """
        # Prepare messages
        api_messages = []
        if system:
            api_messages.append({"role": "system", "content": system})
        api_messages.extend(messages)

        try:
            response = await self.client.chat.completions.create(
                model=settings.openai_model,
                messages=api_messages,
                max_tokens=max_tokens or settings.max_tokens,
                temperature=temperature or settings.temperature,
            )

            # Format response to match Bedrock format
            return {
                "content": [{"text": response.choices[0].message.content}],
                "usage": {
                    "input_tokens": response.usage.prompt_tokens,
                    "output_tokens": response.usage.completion_tokens,
                },
            }

        except Exception as e:
            raise RuntimeError(f"Error invoking GPT: {str(e)}")


# Singleton instance
openai_client = OpenAIClient()
