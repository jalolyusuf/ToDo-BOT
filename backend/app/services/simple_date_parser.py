"""Simple date parser for Uzbek language - NO AI needed!"""

import re
from datetime import datetime, timedelta


class SimpleDateParser:
    """Simple rule-based date parser for Uzbek."""

    MONTHS_UZ = {
        "yanvar": 1, "fevral": 2, "mart": 3, "aprel": 4,
        "may": 5, "iyun": 6, "iyul": 7, "avgust": 8,
        "sentabr": 9, "oktyabr": 10, "noyabr": 11, "dekabr": 12,
    }

    WEEKDAYS_UZ = {
        "dushanba": 0, "seshanba": 1, "chorshanba": 2, "payshanba": 3,
        "juma": 4, "shanba": 5, "yakshanba": 6,
    }

    @staticmethod
    def parse(text: str, current_date: datetime) -> dict:
        """
        Parse Uzbek date/time text.

        Returns:
            dict with 'date' (YYYY-MM-DD), 'time' (HH:MM)
        """
        text = text.lower().strip()
        result = {"date": None, "time": None}

        # TIME PATTERNS
        # "soat 15:00" or "15:00" or "soat 15"
        time_match = re.search(r'(?:soat\s+)?(\d{1,2})[:\.](\d{2})', text)
        if time_match:
            hour, minute = time_match.groups()
            result["time"] = f"{int(hour):02d}:{int(minute):02d}"
        else:
            # "soat 15 da" or "15 da"
            time_match = re.search(r'(?:soat\s+)?(\d{1,2})\s+da', text)
            if time_match:
                hour = time_match.group(1)
                result["time"] = f"{int(hour):02d}:00"

        # Special times
        if "ertalab" in text:
            result["time"] = "09:00"
        elif "tushlik" in text or "peshin" in text:
            result["time"] = "13:00"
        elif "kechqurun" in text:
            result["time"] = "18:00"
        elif "kecha" in text or "tun" in text:
            result["time"] = "21:00"

        # DATE PATTERNS

        # "bugun"
        if "bugun" in text:
            result["date"] = current_date.strftime("%Y-%m-%d")
            return result

        # "ertaga"
        if "ertaga" in text:
            tomorrow = current_date + timedelta(days=1)
            result["date"] = tomorrow.strftime("%Y-%m-%d")
            return result

        # "N kun(dan) keyin"
        days_match = re.search(r'(\d+)\s+kun(?:dan)?\s+keyin', text)
        if days_match:
            days = int(days_match.group(1))
            future = current_date + timedelta(days=days)
            result["date"] = future.strftime("%Y-%m-%d")
            return result

        # "DD-MM-YYYY" or "DD.MM.YYYY" or "DD/MM/YYYY"
        date_match = re.search(r'(\d{1,2})[-./](\d{1,2})[-./](\d{4})', text)
        if date_match:
            day, month, year = date_match.groups()
            result["date"] = f"{year}-{int(month):02d}-{int(day):02d}"
            return result

        # "DD-MM" (current year assumed)
        date_match = re.search(r'(\d{1,2})[-./](\d{1,2})(?!\d)', text)
        if date_match:
            day, month = date_match.groups()
            result["date"] = f"{current_date.year}-{int(month):02d}-{int(day):02d}"
            return result

        # "DD-month" (e.g., "25-avgust", "3-sentabr")
        for month_name, month_num in SimpleDateParser.MONTHS_UZ.items():
            pattern = rf'(\d{{1,2}})[-\s]+{month_name}'
            match = re.search(pattern, text)
            if match:
                day = int(match.group(1))
                result["date"] = f"{current_date.year}-{month_num:02d}-{day:02d}"
                return result

        # Weekday names (next occurrence)
        for weekday_name, weekday_num in SimpleDateParser.WEEKDAYS_UZ.items():
            if weekday_name in text:
                days_ahead = (weekday_num - current_date.weekday()) % 7
                if days_ahead == 0:
                    days_ahead = 7  # Next week
                future = current_date + timedelta(days=days_ahead)
                result["date"] = future.strftime("%Y-%m-%d")
                return result

        return result


simple_date_parser = SimpleDateParser()
