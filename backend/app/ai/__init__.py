"""AI package initialization."""
from app.ai.base import BaseAIProvider
from app.ai.mock_provider import MockAIProvider

__all__ = ["BaseAIProvider", "MockAIProvider"]
