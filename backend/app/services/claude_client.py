"""Claude AI client for task parsing."""

import json
from datetime import datetime, timedelta
from typing import Any

from anthropic import Anthropic

from app.core.config import get_settings

settings = get_settings()


class ClaudeClient:
    """Claude AI client for parsing tasks and extracting dates."""

    def __init__(self):
        """Initialize Claude client."""
        self.client = None
        self.model = settings.claude_model
        if settings.claude_api_key:
            self.client = Anthropic(api_key=settings.claude_api_key)

    @property
    def is_available(self) -> bool:
        """Check if Claude client is configured."""
        return self.client is not None

    async def parse_task(self, user_message: str, current_date: str | None = None) -> dict[str, Any]:
        """
        Parse user message to extract task, date, and time.

        Args:
            user_message: User's input (Uzbek or Russian language)
            current_date: Current date in YYYY-MM-DD format

        Returns:
            dict with keys: task, date (YYYY-MM-DD or null), time (HH:MM or null)
        """
        if not self.is_available:
            return {
                "task": user_message,
                "date": None,
                "time": None,
                "error": "Claude API not configured",
            }

        if not current_date:
            now = datetime.now()
            current_date = now.strftime("%Y-%m-%d")
        else:
            now = datetime.strptime(current_date, "%Y-%m-%d")

        tomorrow = (now + timedelta(days=1)).strftime("%Y-%m-%d")
        current_year = now.year

        prompt = f"""Sen vazifa va sanani ajratuvchi yordamchisan. Foydalanuvchi xabaridan quyidagilarni JSON formatida qaytar:

- **task**: vazifaning qisqa tavsifi (faqat vazifa matni, sana/vaqt so'zlarisiz)
- **date**: agar sana ko'rsatilgan bo'lsa, YYYY-MM-DD formatida
- **time**: agar vaqt ko'rsatilgan bo'lsa, HH:MM formatida

**MUHIM SANA QOIDALARI (Bugungi sana: {current_date}, Yil: {current_year}):**
- "bugun" → {current_date}
- "ertaga" → {tomorrow}
- "3-sentabrda" yoki "3 sentabr" → {current_year}-09-03
- "15-avgustda" → {current_year}-08-15
- "20-iyunda" → {current_year}-06-20
- "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba", "yakshanba" → haftaning keyingi kunini hisoblang
- Agar sana yo'q bo'lsa → null

**VAQT QOIDALARI:**
- "soat 15:00 da" yoki "15:00 da" → "15:00"
- "ertalab 9 da" yoki "ertalab soat 9" → "09:00"
- "kechqurun 6 da" → "18:00"
- "tushlik vaqti" → "13:00"
- Agar vaqt yo'q bo'lsa → null

**Foydalanuvchi xabari:** "{user_message}"

FAQAT JSON qaytar, boshqa matn yoki tushuntirish YOZMA. Format:
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


    async def parse_date_time(self, user_message: str, current_date: str | None = None) -> dict[str, Any]:
        """
        Parse user message to extract only date and time.

        Args:
            user_message: User's date/time input (Uzbek language)
            current_date: Current date in YYYY-MM-DD format

        Returns:
            dict with keys: date (YYYY-MM-DD or null), time (HH:MM or null)
        """
        if not self.is_available:
            return {
                "date": None,
                "time": None,
                "error": "Claude API not configured",
            }

        if not current_date:
            now = datetime.now()
            current_date = now.strftime("%Y-%m-%d")
            current_time = now.strftime("%H:%M")
        else:
            now = datetime.strptime(current_date, "%Y-%m-%d")
            current_time = datetime.now().strftime("%H:%M")

        tomorrow = (now + timedelta(days=1)).strftime("%Y-%m-%d")
        current_year = now.year

        prompt = f"""Sen sana va vaqtni ajratuvchi yordamchisan. Foydalanuvchi xabaridan quyidagilarni JSON formatida qaytar:

- **date**: sana YYYY-MM-DD formatida
- **time**: vaqt HH:MM formatida

**Hozirgi vaqt: {current_date} {current_time} (Yil: {current_year})**

**SANA QOIDALARI:**
- "bugun", "hozir" → {current_date}
- "ertaga" → {tomorrow}
- "3-sentabr", "3 sentabrda" → {current_year}-09-03
- "15-avgust" → {current_year}-08-15
- Hafta kunlari: keyingi shu kunni hisoblang
- Agar sana yo'q bo'lsa → {current_date} (bugun)

**VAQT QOIDALARI:**
- "hozir", "darhol" → "{current_time}"
- "5 minutdan keyin", "10 daqiqadan keyin" → hozirgi vaqtga qo'sh va HH:MM formatda qaytar
- "1 soatdan keyin" → hozirgi vaqtga 1 soat qo'sh
- "12 ga", "12 da", "soat 12" → "12:00"
- "15:30 da" → "15:30"
- "ertalab" → "09:00"
- "tushlik", "obed", "peshin" → "12:00"
- "kechqurun" → "18:00"
- "kechasi" → "21:00"
- Agar vaqt yo'q bo'lsa → "{current_time}" (hozir)

**Foydalanuvchi xabari:** "{user_message}"

FAQAT JSON qaytar, hech qanday tushuntirish yozma:
{{"date": "YYYY-MM-DD", "time": "HH:MM"}}"""

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=200,
                temperature=0.1,
                messages=[{"role": "user", "content": prompt}],
            )

            response_text = message.content[0].text.strip()

            # Clean markdown code blocks if present
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            result = json.loads(response_text)

            return {
                "date": result.get("date") if result.get("date") not in ["null", None, ""] else None,
                "time": result.get("time") if result.get("time") not in ["null", None, ""] else None,
            }

        except Exception as e:
            return {
                "date": None,
                "time": None,
                "error": str(e),
            }


    async def analyze_message(self, user_message: str, current_datetime: str | None = None) -> dict[str, Any]:
        """
        Analyze user message to detect intent and extract task info.

        Returns:
            dict with keys:
            - intent: "create_task" | "wait_for_attachments" | "question" | "greeting" | "other"
            - task_text: task description (if intent is create_task)
            - date: YYYY-MM-DD (if specified)
            - time: HH:MM (if specified)
        """
        if not self.is_available:
            return {"intent": "other", "error": "Claude API not configured"}

        if not current_datetime:
            now = datetime.now()
            current_date = now.strftime("%Y-%m-%d")
            current_time = now.strftime("%H:%M")
        else:
            parts = current_datetime.split(" ")
            current_date = parts[0]
            current_time = parts[1] if len(parts) > 1 else "12:00"
            now = datetime.strptime(current_date, "%Y-%m-%d")

        tomorrow = (now + timedelta(days=1)).strftime("%Y-%m-%d")
        current_year = now.year

        prompt = f"""Sen Telegram vazifa boti yordamchisisan. Foydalanuvchi xabarini tahlil qil.

**Hozirgi vaqt: {current_date} {current_time}**

**NIYAT TURLARI (intent) - MUHIM:**

1. "create_task" - ASOSIY NIYAT! Quyidagilarning BARCHASI vazifa hisoblanadi:
   - Har qanday ish/vazifa/eslatma: "rasm uchun test", "loyiha tayyorlash", "kitob o'qish"
   - Sana bilan: "ertaga shifokorga", "5 minutdan keyin qo'ng'iroq"
   - Sanasiz ham: "ovqat pishirish", "uyni tozalash", "test vazifa"
   - QOIDA: Agar xabar savol yoki salom emas - bu VAZIFA!

2. "wait_for_attachments" - FAQAT bu so'zlar bo'lsa:
   - "kut", "kutib tur", "hozir yuboraman", "rasm ham bor"

3. "greeting" - FAQAT salomlashish:
   - "salom", "hi", "assalomu alaykum"

4. "question" - FAQAT savol belgisi bilan:
   - "bu nima?", "qanday?", "yordam?"

5. "other" - DEYARLI HECH QACHON ishlatma!

**MUHIM: Agar shubha bo'lsa - "create_task" tanlang!**

**Agar intent = "create_task":**
- task_text: vazifa matni
- date: YYYY-MM-DD (bugun={current_date}, ertaga={tomorrow}) yoki null
- time: HH:MM yoki null

**Foydalanuvchi xabari:** "{user_message}"

JSON:
{{"intent": "...", "task_text": "...", "date": "..." yoki null, "time": "..." yoki null}}"""

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=300,
                temperature=0.1,
                messages=[{"role": "user", "content": prompt}],
            )

            response_text = message.content[0].text.strip()

            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            result = json.loads(response_text)

            return {
                "intent": result.get("intent", "other"),
                "task_text": result.get("task_text") if result.get("task_text") not in ["null", None, ""] else None,
                "date": result.get("date") if result.get("date") not in ["null", None, ""] else None,
                "time": result.get("time") if result.get("time") not in ["null", None, ""] else None,
            }

        except Exception as e:
            return {
                "intent": "other",
                "error": str(e),
            }


# Singleton instance
claude_client = ClaudeClient()
