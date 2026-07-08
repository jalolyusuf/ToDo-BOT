from pydantic import BaseModel


class TelegramUser(BaseModel):
    id: int
    username: str | None = None
    first_name: str
    last_name: str | None = None
    language_code: str | None = None
