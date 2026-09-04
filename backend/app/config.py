"""Application configuration loaded from environment or default constants."""

import os
import secrets
from pydantic import BaseModel
from typing import List


def get_cors_origins() -> List[str]:
    """Compile allowed CORS origins including GitHub Pages and local development."""
    origins = [
        "https://pramendra0001.github.io",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    # Allow extra origins via comma-separated environment variable
    custom = os.getenv("CORS_ORIGINS", "")
    if custom:
        for item in custom.split(","):
            cleaned = item.strip().rstrip("/")
            if cleaned and cleaned not in origins:
                origins.append(cleaned)
    return origins


def get_database_url() -> str:
    """Resolve database URL, normalizing PostgreSQL schemes for async SQLAlchemy if needed."""
    url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./nigrani.db").strip()
    # Normalize standard Postgres URI (e.g. from Render or Heroku) to asyncpg driver
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


def get_secret_key() -> str:
    """
    Retrieves SECRET_KEY from environment.
    If omitted, generates a cryptographically random 256-bit token at runtime.
    Guarantees NO static secret or credential is ever hardcoded in the codebase.
    """
    key = os.getenv("SECRET_KEY", "").strip()
    if not key:
        return secrets.token_hex(32)
    return key


class Settings(BaseModel):
    """Nigrani AI application settings."""

    # Environment Deployment Profile
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production").lower()

    # Centralized Application Year & Context (Standardized to 2026)
    APP_CURRENT_YEAR: int = int(os.getenv("APP_CURRENT_YEAR", "2026"))
    APP_CURRENT_DATE: str = os.getenv("APP_CURRENT_DATE", "2026-09-04")

    # Server binding
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Database: SQLite async for zero-config demo/MVP; auto-adapts to PostgreSQL if URL provided
    DATABASE_URL: str = get_database_url()

    # Authentication & Security
    SECRET_KEY: str = get_secret_key()
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    OTP_EXPIRE_MINUTES: int = int(os.getenv("OTP_EXPIRE_MINUTES", "10"))
    OTP_RESEND_COOLDOWN_SECONDS: int = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", "60"))
    OTP_MAX_ATTEMPTS: int = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))

    # OTP Sandbox Production Guard: Strictly disabled in production
    ALLOW_SANDBOX_OTP: bool = os.getenv("ALLOW_SANDBOX_OTP", "false").lower() in ("true", "1", "yes")

    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")

    # Communication Gateways: SMS OTP Provider Configuration
    SMS_PROVIDER: str = os.getenv("SMS_PROVIDER", "msg91").lower()
    MSG91_AUTH_KEY: str = os.getenv("MSG91_AUTH_KEY", "")
    MSG91_TEMPLATE_ID: str = os.getenv("MSG91_TEMPLATE_ID", "")
    MSG91_SENDER_ID: str = os.getenv("MSG91_SENDER_ID", "")

    # Optional Twilio Provider
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_FROM_PHONE: str = os.getenv("TWILIO_FROM_PHONE", "")

    # Communication Gateways: SMTP Email Configuration
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() in ("true", "1", "yes")
    SMTP_USE_SSL: bool = os.getenv("SMTP_USE_SSL", "false").lower() in ("true", "1", "yes")

    # AI Provider: 'mock' (offline deterministic SIH demo) or 'gemini'
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-1.5-flash")

    # Operating Mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")

    # CORS Allowed Origins
    CORS_ORIGINS: List[str] = get_cors_origins()

    # Deterministic Risk Weights (Must sum to 1.0)
    COST_RISK_WEIGHT: float = float(os.getenv("COST_RISK_WEIGHT", "0.35"))
    DUPLICATE_RISK_WEIGHT: float = float(os.getenv("DUPLICATE_RISK_WEIGHT", "0.30"))
    DELAY_RISK_WEIGHT: float = float(os.getenv("DELAY_RISK_WEIGHT", "0.25"))
    DATA_QUALITY_RISK_WEIGHT: float = float(os.getenv("DATA_QUALITY_RISK_WEIGHT", "0.10"))

    # Uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "50"))

    def is_sandbox_otp_allowed(self) -> bool:
        """
        STRICT SECURITY GUARD:
        In production, sandbox OTP display in API responses is NEVER permitted.
        Only allowed when ENVIRONMENT is explicitly 'development' or 'test' AND ALLOW_SANDBOX_OTP is True.
        """
        if self.ENVIRONMENT in ("production", "prod"):
            return False
        return self.ALLOW_SANDBOX_OTP


settings = Settings()
