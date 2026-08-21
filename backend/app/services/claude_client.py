"""Claude AI client for task parsing."""

import json
from datetime import datetime
from typing import Any

from anthropic import Anthropic

from app.core.config import get_settings

settings = get_settings()


class ClaudeClient:
    """Claude AI client for parsing tasks and extracting dates."""

    def __init__(self):
        """Initialize Claude client."""
        self.client = Anthropic(api_key=settings.claude_api_key)
        self.model = settings.claude_model

    async def parse_task(self, user_message: str, current_date: str | None = None) -> dict[str, Any]:
        """
        Parse user message to extract task, date, and time.

        Args:
            user_message: User's input (Uzbek or Russian language)
            current_date: Current date in YYYY-MM-DD format

        Returns:
            dict with keys: task, date (YYYY-MM-DD or null), time (HH:MM or null)
        """
        if not current_date:
            current_date = datetime.now().strftime("%Y-%m-%d")

        prompt = f"""Sen vazifa va sanani ajratuvchi yordamchisan. Foydalanuvchi xabaridan quyidagilarni JSON formatida qaytar:

- **task**: vazifaning qisqa tavsifi (o'zbek yoki rus tilida)
- **date**: agar sana ko'rsatilgan bo'lsa, YYYY-MM-DD formatida (bugungi sana: {current_date})
- **time**: agar vaqt ko'rsatilgan bo'lsa, HH:MM formatida, aks holda null

**Sana qoidalari:**
- "bugun" → {current_date}
- "ertaga" → keyingi kun
- "3-sentabrda" yoki "3 sentabr" → 2026-09-03
- "dushanba", "seshanba" → haftaning kunidan hisoblash
- Agar sana yo'q bo'lsa → null

**Vaqt qoidalari:**
- "soat 15:00 da" → 15:00
- "ertalab 9 da" → 09:00
- "kechqurun" → 18:00
- Agar vaqt yo'q bo'lsa → null

**Foydalanuvchi xabari:** "{user_message}"

Faqat JSON qaytar, boshqa hech narsa yozma. Format:
{{"task": "...", "date": "YYYY-MM-DD yoki null", "time": "HH:MM yoki null"}}"""

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=500,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}],
            )

            # Extract response
            response_text = message.content[0].text.strip()

            # Clean markdown code blocks if present
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            # Parse JSON
            result = json.loads(response_text)

            # Validate and normalize
            return {
                "task": result.get("task", user_message),
                "date": result.get("date") if result.get("date") not in ["null", None, ""] else None,
                "time": result.get("time") if result.get("time") not in ["null", None, ""] else None,
            }

        except Exception as e:
            # On error, return original message as task without date/time
            return {
                "task": user_message,
                "date": None,
                "time": None,
                "error": str(e),
            }


# Singleton instance
claude_client = ClaudeClient()
