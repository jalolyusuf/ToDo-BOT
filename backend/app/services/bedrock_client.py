"""AWS Bedrock client service."""

import json
from typing import Any

import boto3
from botocore.config import Config

from app.core.config import get_settings

settings = get_settings()


class BedrockClient:
    """AWS Bedrock client for Claude AI."""

    def __init__(self):
        """Initialize Bedrock client."""
        self.bedrock_runtime = boto3.client(
            service_name="bedrock-runtime",
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            config=Config(
                read_timeout=300,
                retries={"max_attempts": 3, "mode": "adaptive"},
            ),
        )

    async def invoke_claude(
        self,
        messages: list[dict[str, Any]],
        system: str | None = None,
        max_tokens: int | None = None,
        temperature: float | None = None,
    ) -> dict[str, Any]:
        """
        Invoke Claude model on AWS Bedrock.

        Args:
            messages: List of message dictionaries with 'role' and 'content'
            system: Optional system prompt
            max_tokens: Maximum tokens to generate
            temperature: Temperature for sampling (0-1)

        Returns:
            Response from Claude including generated text and token usage
        """
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "messages": messages,
            "max_tokens": max_tokens or settings.max_tokens,
            "temperature": temperature or settings.temperature,
        }

        if system:
            body["system"] = system

        try:
            response = self.bedrock_runtime.invoke_model(
                modelId=settings.bedrock_model_id,
                body=json.dumps(body),
            )

            response_body = json.loads(response["body"].read())
            return response_body

        except Exception as e:
            raise RuntimeError(f"Error invoking Claude: {str(e)}")

    async def invoke_claude_stream(
        self,
        messages: list[dict[str, Any]],
        system: str | None = None,
        max_tokens: int | None = None,
        temperature: float | None = None,
    ):
        """
        Invoke Claude model with streaming response.

        Args:
            messages: List of message dictionaries
            system: Optional system prompt
            max_tokens: Maximum tokens to generate
            temperature: Temperature for sampling

        Yields:
            Streaming response chunks from Claude
        """
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "messages": messages,
            "max_tokens": max_tokens or settings.max_tokens,
            "temperature": temperature or settings.temperature,
        }

        if system:
            body["system"] = system

        try:
            response = self.bedrock_runtime.invoke_model_with_response_stream(
                modelId=settings.bedrock_model_id,
                body=json.dumps(body),
            )

            for event in response["body"]:
                chunk = json.loads(event["chunk"]["bytes"].decode())
                yield chunk

        except Exception as e:
            raise RuntimeError(f"Error streaming from Claude: {str(e)}")


# Singleton instance
bedrock_client = BedrockClient()
