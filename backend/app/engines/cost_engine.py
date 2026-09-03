"""Cost anomaly detection engine for public infrastructure projects."""

import math
from typing import List, Dict, Any


class CostEngine:
    """Detects unusual cost patterns compared to similar infrastructure projects."""

    def find_comparable_projects(
        self, project: Dict[str, Any], all_projects: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Finds comparable projects matching category, preferring same district or state."""
        proj_id = project.get("project_id") or project.get("id")
        category = project.get("category")
        state = project.get("state")
        district = project.get("district")

        if not category:
            return []

        # Filter same category and positive cost, excluding self
        category_matches = [
            p for p in all_projects
            if p.get("category") == category
            and (p.get("project_id") or p.get("id")) != proj_id
            and (p.get("actual_cost") or p.get("budget") or 0) > 0
        ]

        # Try same district first (>= 3 needed)
        if district:
            district_matches = [p for p in category_matches if p.get("district") == district]
            if len(district_matches) >= 3:
                return district_matches

        # Try same state next (>= 3 needed)
        if state:
            state_matches = [p for p in category_matches if p.get("state") == state]
            if len(state_matches) >= 3:
                return state_matches

        return category_matches

    def analyze(self, project: Dict[str, Any], comparable_projects: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculates cost deviation, percentile rank, budget deviation, and risk score."""
        project_cost = project.get("actual_cost") or project.get("budget") or 0
        budget = project.get("budget") or 0
        actual_cost = project.get("actual_cost")

        res: Dict[str, Any] = {
            "project_cost": round(project_cost, 2),
            "comparable_median": None,
            "comparable_mean": None,
            "comparable_std": None,
            "cost_deviation_percentage": None,
            "percentile_rank": None,
            "budget_deviation_percentage": None,
            "comparable_count": len(comparable_projects),
            "risk_score": 0.0,
            "evidence": {},
            "insufficient_data": False,
        }

        if project_cost <= 0 or len(comparable_projects) < 2:
            res["insufficient_data"] = True
            res["evidence"] = {
                "summary": "Insufficient comparable project data for statistical baseline.",
                "finding": "Project cost is zero or fewer than 2 comparable projects exist.",
                "severity": "LOW",
            }
            return res

        costs = sorted([
            float(p.get("actual_cost") or p.get("budget") or 0)
            for p in comparable_projects
            if (p.get("actual_cost") or p.get("budget") or 0) > 0
        ])

        n = len(costs)
        if n < 2:
            res["insufficient_data"] = True
            return res

        # Median
        if n % 2 == 1:
            median = costs[n // 2]
        else:
            median = (costs[(n // 2) - 1] + costs[n // 2]) / 2.0

        # Mean
        mean = sum(costs) / n

        # Standard deviation
        variance = sum((x - mean) ** 2 for x in costs) / (n - 1 if n > 1 else 1)
        std = math.sqrt(variance)

        res["comparable_median"] = round(median, 2)
        res["comparable_mean"] = round(mean, 2)
        res["comparable_std"] = round(std, 2)

        # Cost deviation from median
        cost_deviation = ((project_cost - median) / median) * 100.0 if median > 0 else 0.0
        res["cost_deviation_percentage"] = round(cost_deviation, 1)

        # Percentile rank
        rank = sum(1 for c in costs if c <= project_cost)
        percentile = (rank / n) * 100.0
        res["percentile_rank"] = round(percentile, 1)

        # Budget vs Actual deviation
        budget_deviation = None
        if actual_cost and budget and budget > 0:
            budget_deviation = ((actual_cost - budget) / budget) * 100.0
            res["budget_deviation_percentage"] = round(budget_deviation, 1)

        # Risk score calculation
        # Baseline from cost deviation
        abs_dev = abs(cost_deviation)
        if abs_dev < 30:
            risk = abs_dev * 0.5  # 0 to 15
        elif abs_dev < 75:
            risk = 15 + (abs_dev - 30) * 0.8  # 15 to 51
        elif abs_dev < 150:
            risk = 51 + (abs_dev - 75) * 0.4  # 51 to 81
        else:
            risk = 81 + min((abs_dev - 150) * 0.1, 19)  # 81 to 100

        # Overrun addition
        if budget_deviation and budget_deviation > 25:
            risk = min(100.0, risk + min((budget_deviation - 25) * 0.3, 20.0))

        res["risk_score"] = round(min(100.0, max(0.0, risk)), 1)

        # Evidence payload
        severity = "LOW"
        if cost_deviation > 150 or (budget_deviation and budget_deviation > 80):
            severity = "CRITICAL"
        elif cost_deviation > 75 or (budget_deviation and budget_deviation > 40):
            severity = "HIGH"
        elif cost_deviation > 30:
            severity = "MEDIUM"

        res["evidence"] = {
            "summary": f"Cost is {abs(cost_deviation):.1f}% {'above' if cost_deviation >= 0 else 'below'} category median of ₹{median:.1f} Lakh.",
            "project_cost_lakh": round(project_cost, 2),
            "median_lakh": round(median, 2),
            "mean_lakh": round(mean, 2),
            "std_lakh": round(std, 2),
            "percentile": round(percentile, 1),
            "comparable_count": n,
            "budget_deviation_pct": round(budget_deviation, 1) if budget_deviation is not None else None,
            "severity": severity,
        }

        return res
