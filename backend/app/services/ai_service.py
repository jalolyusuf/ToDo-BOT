"""AI service for handling conversations with GPT."""

from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Conversation, Message, MessageRole, User
from app.services.openai_client import openai_client


class AIService:
    """Service for AI conversation management."""

    SYSTEM_PROMPT = """You are a helpful AI assistant integrated into a Telegram bot.
You can help users with various tasks including:
- Answering questions on any topic
- Writing and explaining code
- Analyzing documents and images
- Providing recommendations and advice
- General conversation and assistance

Be concise, helpful, and friendly. When appropriate, use formatting to make your responses clearer.
If you receive images or documents, analyze them and provide relevant insights."""

    MAX_CONTEXT_MESSAGES = 20  # Keep last 20 messages for context

    async def get_or_create_conversation(
        self,
        session: AsyncSession,
        user: User,
    ) -> Conversation:
        """
        Get or create active conversation for user.

        Returns the user's most recent active conversation, or creates a new one.
        """
        # Try to get active conversation
        stmt = (
            select(Conversation)
            .where(
                Conversation.user_id == user.id,
                Conversation.status == "active",
            )
            .order_by(Conversation.updated_at.desc())
            .limit(1)
        )
        result = await session.execute(stmt)
        conversation = result.scalar_one_or_none()

        if not conversation:
            # Create new conversation
            conversation = Conversation(
                user_id=user.id,
                title="New Conversation",
            )
            session.add(conversation)
            await session.commit()
            await session.refresh(conversation)

        return conversation

    async def get_conversation_context(
        self,
        session: AsyncSession,
        conversation: Conversation,
    ) -> list[dict[str, Any]]:
        """
        Get conversation context (recent messages) formatted for Claude.

        Returns list of messages in Claude API format.
        """
        # Load recent messages
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation.id)
            .order_by(Message.created_at.desc())
            .limit(self.MAX_CONTEXT_MESSAGES)
            .options(selectinload(Message.attachments))
        )
        result = await session.execute(stmt)
        messages = list(reversed(result.scalars().all()))

        # Format messages for Claude
        formatted_messages = []
        for msg in messages:
            if msg.role == MessageRole.SYSTEM:
                continue  # System messages handled separately

            formatted_msg = {
                "role": msg.role.value,
                "content": msg.content,
            }
            formatted_messages.append(formatted_msg)

        return formatted_messages

    async def generate_response(
        self,
        session: AsyncSession,
        conversation: Conversation,
        user_message: str,
        telegram_message_id: int | None = None,
    ) -> Message:
        """
        Generate AI response for user message.

        Creates user message, generates AI response, and saves both.
        """
        # Save user message
        user_msg = Message(
            conversation_id=conversation.id,
            role=MessageRole.USER,
            content=user_message,
            telegram_message_id=telegram_message_id,
        )
        session.add(user_msg)
        await session.commit()

        # Get conversation context
        context = await self.get_conversation_context(session, conversation)

        # Add current message to context
        context.append({"role": "user", "content": user_message})

        # Call OpenAI API
        try:
            response = await openai_client.invoke_gpt(
                messages=context,
                system=self.SYSTEM_PROMPT,
            )

            # Extract response content
            assistant_content = ""
            if "content" in response:
                for content_block in response["content"]:
                    assistant_content += content_block.get("text", "")

            # Get token usage
            usage = response.get("usage", {})
            input_tokens = usage.get("input_tokens", 0)
            output_tokens = usage.get("output_tokens", 0)

            # Save assistant response
            assistant_msg = Message(
                conversation_id=conversation.id,
                role=MessageRole.ASSISTANT,
                content=assistant_content,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
            )
            session.add(assistant_msg)

            # Update user message tokens
            user_msg.input_tokens = input_tokens
            user_msg.output_tokens = 0

            await session.commit()
            await session.refresh(assistant_msg)

            return assistant_msg

        except Exception as e:
            # On error, still commit user message but raise exception
            await session.commit()
            raise RuntimeError(f"Failed to generate AI response: {str(e)}")

    async def generate_response_stream(
        self,
        session: AsyncSession,
        conversation: Conversation,
        user_message: str,
        telegram_message_id: int | None = None,
    ):
        """
        Generate streaming AI response for user message.

        Yields response chunks as they arrive from Claude.
        """
        # Save user message
        user_msg = Message(
            conversation_id=conversation.id,
            role=MessageRole.USER,
            content=user_message,
            telegram_message_id=telegram_message_id,
        )
        session.add(user_msg)
        await session.commit()

        # Get conversation context
        context = await self.get_conversation_context(session, conversation)
        context.append({"role": "user", "content": user_message})

        # Stream from Claude
        full_response = ""
        input_tokens = 0
        output_tokens = 0

        try:
            async for chunk in bedrock_client.invoke_claude_stream(
                messages=context,
                system=self.SYSTEM_PROMPT,
            ):
                chunk_type = chunk.get("type")

                if chunk_type == "content_block_delta":
                    delta = chunk.get("delta", {})
                    if delta.get("type") == "text_delta":
                        text = delta.get("text", "")
                        full_response += text
                        yield text

                elif chunk_type == "message_start":
                    usage = chunk.get("message", {}).get("usage", {})
                    input_tokens = usage.get("input_tokens", 0)

                elif chunk_type == "message_delta":
                    usage = chunk.get("usage", {})
                    output_tokens = usage.get("output_tokens", 0)

            # Save complete response
            assistant_msg = Message(
                conversation_id=conversation.id,
                role=MessageRole.ASSISTANT,
                content=full_response,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
            )
            session.add(assistant_msg)
            await session.commit()

        except Exception as e:
            await session.commit()
            raise RuntimeError(f"Failed to stream AI response: {str(e)}")


# Singleton instance
ai_service = AIService()
