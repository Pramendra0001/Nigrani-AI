"""Application configuration loaded from environment or default constants."""

import os
from pydantic import BaseModel
from typing import List


class Settings(BaseModel):
    """Nigrani AI application settings."""

    # Database: SQLite async for zero-configuration, robust local runtime
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./nigrani.db")

    # AI Provider: 'mock' (offline deterministic SIH demo) or 'gemini'
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-1.5-flash")

    # Mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    # Deterministic Risk Weights (Must sum to 1.0)
    COST_RISK_WEIGHT: float = 0.35
    DUPLICATE_RISK_WEIGHT: float = 0.30
    DELAY_RISK_WEIGHT: float = 0.25
    DATA_QUALITY_RISK_WEIGHT: float = 0.10

    # Uploads
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 50


settings = Settings()
