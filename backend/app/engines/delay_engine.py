"""Schedule delay analysis engine for public infrastructure projects."""

from datetime import date, datetime
from typing import Dict, Any, Optional


class DelayEngine:
    """Evaluates project schedule progress vs timeline elapsed to identify delays."""

    def analyze(self, project: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates planned duration, elapsed time, expected vs reported progress, and classification."""
        res: Dict[str, Any] = {
            "planned_duration_days": None,
            "elapsed_days": None,
            "time_elapsed_percentage": None,
            "completion_percentage": None,
            "expected_completion": None,
            "schedule_deviation": None,
            "delay_classification": "INSUFFICIENT_INFORMATION",
            "risk_score": 0.0,
            "evidence": {},
        }

        start = self._parse_date(project.get("start_date"))
        end = self._parse_date(project.get("expected_end_date"))
        completion = float(project.get("completion_percentage") or 0.0)

        res["completion_percentage"] = round(completion, 1)

        if not start or not end:
            res["evidence"] = {
                "summary": "Start date or expected completion date is missing.",
                "severity": "LOW",
            }
            return res

        duration = (end - start).days
        if duration <= 0:
            res["delay_classification"] = "INVALID_TIMELINE"
            res["risk_score"] = 60.0
            res["evidence"] = {
                "summary": f"End date ({end}) precedes or equals start date ({start}).",
                "severity": "HIGH",
            }
            return res

        res["planned_duration_days"] = duration
        today = date.today()

        elapsed = (today - start).days
        elapsed = max(0, min(elapsed, duration * 2))
        res["elapsed_days"] = elapsed

        time_elapsed_pct = (elapsed / duration) * 100.0
        res["time_elapsed_percentage"] = round(time_elapsed_pct, 1)

        expected_completion = min(time_elapsed_pct, 100.0)
        res["expected_completion"] = round(expected_completion, 1)

        # Deviation: positive means behind schedule
        deviation = time_elapsed_pct - completion
        res["schedule_deviation"] = round(deviation, 1)

        # Classifications & Risk
        if completion >= 100.0:
            classification = "COMPLETED"
            risk = 0.0
            severity = "LOW"
            summary = "Project reported as 100% completed."
        elif time_elapsed_pct < 10.0:
            classification = "EARLY_STAGE"
            risk = 0.0
            severity = "LOW"
            summary = "Project is in early stages of execution."
        elif deviation <= 15.0:
            classification = "NORMAL"
            risk = max(0.0, deviation * 1.5)
            severity = "LOW"
            summary = f"Project is progressing normally ({completion:.1f}% done, {time_elapsed_pct:.1f}% time elapsed)."
        elif deviation <= 35.0:
            classification = "AT_RISK"
            risk = 25.0 + (deviation - 15.0) * 1.8  # ~25 to 61
            severity = "MEDIUM"
            summary = f"Project is moderately delayed: {time_elapsed_pct:.1f}% time elapsed vs {completion:.1f}% completed."
        else:
            classification = "SIGNIFICANT_DELAY"
            risk = 61.0 + min((deviation - 35.0) * 0.8, 39.0)  # ~61 to 100
            severity = "CRITICAL" if deviation > 55 else "HIGH"
            summary = f"Significant delay detected: {deviation:.1f}% schedule gap ({time_elapsed_pct:.1f}% time elapsed vs {completion:.1f}% completed)."

        res["delay_classification"] = classification
        res["risk_score"] = round(min(100.0, max(0.0, risk)), 1)
        res["evidence"] = {
            "summary": summary,
            "classification": classification,
            "time_elapsed_pct": round(time_elapsed_pct, 1),
            "completion_pct": round(completion, 1),
            "schedule_gap_pct": round(deviation, 1),
            "planned_days": duration,
            "elapsed_days": elapsed,
            "severity": severity,
        }

        return res

    def _parse_date(self, val: Any) -> Optional[date]:
        if val is None:
            return None
        if isinstance(val, date):
            return val
        if isinstance(val, datetime):
            return val.date()
        if isinstance(val, str):
            for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"):
                try:
                    return datetime.strptime(val.strip(), fmt).date()
                except ValueError:
                    pass
        return None
