"""Abstract AI provider interface."""

from abc import ABC, abstractmethod
from typing import Dict, Any, List


class BaseAIProvider(ABC):
    """Abstract interface for AI interpretation and summary generation."""

    @abstractmethod
    async def explain_cost_anomaly(self, project: Dict[str, Any], cost_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def explain_duplicates(self, project: Dict[str, Any], candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def explain_delay(self, project: Dict[str, Any], delay_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def generate_investigation_summary(
        self,
        project: Dict[str, Any],
        cost_data: Dict[str, Any],
        duplicate_data: Dict[str, Any],
        delay_data: Dict[str, Any],
        dq_data: Dict[str, Any],
        risk_score: float,
        risk_level: str,
    ) -> Dict[str, Any]:
        pass
