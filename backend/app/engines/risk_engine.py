"""Unified deterministic risk scoring engine."""

from typing import Dict, Any, Optional
from app.config import settings


class RiskEngine:
    """Calculates explainable unified risk scores from component risk signals."""

    def calculate(
        self,
        cost_risk: float = 0.0,
        duplicate_risk: float = 0.0,
        delay_risk: float = 0.0,
        dq_risk: float = 0.0,
        weights: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        w = weights or {
            "cost": settings.COST_RISK_WEIGHT,
            "duplicate": settings.DUPLICATE_RISK_WEIGHT,
            "delay": settings.DELAY_RISK_WEIGHT,
            "data_quality": settings.DATA_QUALITY_RISK_WEIGHT,
        }

        # Weighted sum formula from PDR Section 12
        overall = (
            cost_risk * w.get("cost", 0.35) +
            duplicate_risk * w.get("duplicate", 0.30) +
            delay_risk * w.get("delay", 0.25) +
            dq_risk * w.get("data_quality", 0.10)
        )

        overall = round(min(100.0, max(0.0, overall)), 1)

        # Classification
        if overall <= 30.0:
            risk_level = "LOW"
        elif overall <= 60.0:
            risk_level = "MEDIUM"
        elif overall <= 80.0:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        return {
            "overall_risk_score": overall,
            "risk_level": risk_level,
            "component_scores": {
                "cost_risk": round(cost_risk, 1),
                "duplicate_risk": round(duplicate_risk, 1),
                "delay_risk": round(delay_risk, 1),
                "data_quality_risk": round(dq_risk, 1),
            },
            "weights_used": w,
        }
