from pydantic import BaseSettings

class Settings(BaseSettings):
    GOOGLE_API_KEY: str | None = None
    CLASS_THRESHOLD: float = 0.65
    MAX_REPLY_CHARS: int = 1200
    MAX_TEXT_CHARS: int = 20000

settings = Settings()