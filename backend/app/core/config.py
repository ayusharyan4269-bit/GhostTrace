from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "GhostTrace"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Ollama model is configurable; for example, set OLLAMA_MODEL=gemma3:4b.
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "qwen2.5:3b"
    OLLAMA_TIMEOUT_SECONDS: float = 75.0

    # Guardrails
    MAX_INPUT_CHAR_LIMIT: int = 150_000
    MAX_FILE_SIZE_BYTES: int = 2 * 1024 * 1024  # 2MB

    # Storage
    DB_PATH: str = str(Path(__file__).resolve().parent.parent.parent / "ghosttrace.db")

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


settings = Settings()
