"""Data quality analysis engine for public infrastructure projects."""

from typing import Dict, Any, List


class DataQualityEngine:
    """Evaluates data completeness, validity, spatial bounds, and logical integrity."""

    # India geographic bounds
    INDIA_LAT_MIN, INDIA_LAT_MAX = 6.5, 37.5
    INDIA_LNG_MIN, INDIA_LNG_MAX = 68.0, 97.5

    def analyze(self, project: Dict[str, Any]) -> Dict[str, Any]:
        """Detects data quality anomalies and computes completeness & risk scores."""
        issues: List[Dict[str, str]] = []

        # 1. Critical Requirements
        if not project.get("project_name") or not str(project.get("project_name")).strip():
            issues.append({"field": "project_name", "issue": "Missing project name/title", "severity": "CRITICAL"})

        budget = project.get("budget")
        if budget is None or float(budget) <= 0:
            issues.append({"field": "budget", "issue": "Missing or zero/negative sanctioned budget", "severity": "CRITICAL"})

        # 2. Key Metadata Requirements
        if not project.get("state"):
            issues.append({"field": "state", "issue": "Missing administrative State", "severity": "HIGH"})
        if not project.get("category"):
            issues.append({"field": "category", "issue": "Missing project sector/category", "severity": "HIGH"})

        desc = str(project.get("description") or "").strip()
        if not desc or len(desc) < 15:
            issues.append({"field": "description", "issue": "Description is missing or critically brief (< 15 chars)", "severity": "HIGH"})

        completion = project.get("completion_percentage")
        if completion is not None:
            comp_f = float(completion)
            if comp_f < 0.0 or comp_f > 100.0:
                issues.append({"field": "completion_percentage", "issue": f"Impossible completion value ({comp_f}%)", "severity": "CRITICAL"})

        actual_cost = project.get("actual_cost")
        if actual_cost is not None and float(actual_cost) < 0:
            issues.append({"field": "actual_cost", "issue": "Negative actual expenditure recorded", "severity": "CRITICAL"})

        # 3. Schedule & Geo Integrity
        if not project.get("district"):
            issues.append({"field": "district", "issue": "Missing district allocation", "severity": "MEDIUM"})

        if not project.get("start_date") or not project.get("expected_end_date"):
            issues.append({"field": "dates", "issue": "Missing project timeline dates", "severity": "MEDIUM"})
        elif str(project.get("start_date")) > str(project.get("expected_end_date")):
            issues.append({"field": "dates", "issue": "Start date occurs after expected completion date", "severity": "HIGH"})

        lat = project.get("latitude")
        lng = project.get("longitude")
        if lat is not None and (float(lat) < self.INDIA_LAT_MIN or float(lat) > self.INDIA_LAT_MAX):
            issues.append({"field": "latitude", "issue": f"Latitude {lat} outside India territorial bounds", "severity": "HIGH"})
        if lng is not None and (float(lng) < self.INDIA_LNG_MIN or float(lng) > self.INDIA_LNG_MAX):
            issues.append({"field": "longitude", "issue": f"Longitude {lng} outside India territorial bounds", "severity": "HIGH"})

        if lat is None or lng is None:
            issues.append({"field": "coordinates", "issue": "Missing GPS coordinates", "severity": "LOW"})

        # Severity weights
        severity_penalty = {"CRITICAL": 25, "HIGH": 12, "MEDIUM": 6, "LOW": 2}
        total_penalty = sum(severity_penalty.get(i["severity"], 2) for i in issues)

        completeness_score = max(0.0, 100.0 - total_penalty)
        risk_score = min(100.0, total_penalty * 1.5)

        crit_count = sum(1 for i in issues if i["severity"] == "CRITICAL")
        high_count = sum(1 for i in issues if i["severity"] == "HIGH")

        overall_severity = "LOW"
        if crit_count > 0 or risk_score > 60:
            overall_severity = "CRITICAL"
        elif high_count > 0 or risk_score > 35:
            overall_severity = "HIGH"
        elif len(issues) > 0:
            overall_severity = "MEDIUM"

        return {
            "issues": issues,
            "total_issues": len(issues),
            "critical_issues": crit_count,
            "completeness_score": round(completeness_score, 1),
            "risk_score": round(risk_score, 1),
            "evidence": {
                "summary": f"{len(issues)} data quality issue(s) identified. Completeness: {completeness_score:.1f}%.",
                "issue_count": len(issues),
                "critical_count": crit_count,
                "high_count": high_count,
                "severity": overall_severity,
            },
        }
