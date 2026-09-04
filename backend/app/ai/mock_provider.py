"""Deterministic Mock AI Provider for offline national vigilance platform."""

from typing import Dict, Any, List
from app.ai.base import BaseAIProvider


class MockAIProvider(BaseAIProvider):
    """Generates professional, evidence-backed contextual narratives without external API calls."""

    async def explain_cost_anomaly(self, project: Dict[str, Any], cost_data: Dict[str, Any]) -> Dict[str, Any]:
        dev = cost_data.get("cost_deviation_percentage") or 0.0
        median = cost_data.get("comparable_median") or 0.0
        cost = cost_data.get("project_cost") or 0.0
        percentile = cost_data.get("percentile_rank") or 50.0
        comp_count = cost_data.get("comparable_count") or 0
        cat = project.get("category", "infrastructure")
        district = project.get("district", "the administrative zone")
        budget_dev = cost_data.get("budget_deviation_percentage")

        if dev > 150:
            narrative = (
                f"The reported expenditure of ₹{cost:,.2f} Lakh is substantially higher (+{dev:.1f}%) than the "
                f"regional median of ₹{median:,.2f} Lakh across {comp_count} comparable {cat} works in {district}. "
                f"This places the project in the {percentile:.0f}th cost percentile. While terrain or specialized structural "
                f"specifications may justify the divergence, a priority audit of detailed line-item bill of quantities (BOQ) is advised."
            )
            recommendations = [
                "Verify BOQ rates against prevailing State Schedule of Rates (SoR).",
                "Inspect site measurement books (MB) for soil excavation and material variances.",
                "Review tender sanction notes for single-bidder inflation.",
            ]
        elif dev > 50:
            narrative = (
                f"The project cost of ₹{cost:,.2f} Lakh is noticeably above the comparable baseline of ₹{median:,.2f} Lakh "
                f"(+{dev:.1f}% deviation) in {district}. A targeted review of sanctioned technical estimates is recommended."
            )
            recommendations = [
                "Cross-check technical sanctions against typical per-kilometer / per-sqft benchmarks.",
                "Confirm if scope extensions were formally approved.",
            ]
        elif dev < -40:
            narrative = (
                f"The reported project cost of ₹{cost:,.2f} Lakh is {abs(dev):.1f}% below the category median of ₹{median:,.2f} Lakh. "
                f"Unusually depressed costs may suggest under-reporting, incomplete billing, or compromised material grades."
            )
            recommendations = [
                "Conduct field quality inspection to verify material specifications.",
                "Check for unsubmitted pending contractor invoices.",
            ]
        else:
            narrative = (
                f"Project expenditure of ₹{cost:,.2f} Lakh closely aligns with the regional median of ₹{median:,.2f} Lakh "
                f"for comparable {cat} projects ({dev:+.1f}% variance). Expenditure appears standard."
            )
            recommendations = ["Continue regular milestone tracking."]

        if budget_dev and budget_dev > 30:
            narrative += f" In addition, actual spend exceeds the sanctioned budget by {budget_dev:.1f}%, indicating budget escalation."

        return {
            "narrative": narrative,
            "recommendations": recommendations,
            "confidence": "HIGH" if comp_count >= 5 else "MEDIUM",
        }

    async def explain_duplicates(self, project: Dict[str, Any], candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not candidates:
            return {
                "narrative": "No overlapping or duplicate infrastructure projects detected in the immediate district registry.",
                "key_findings": ["Registry uniqueness verified."],
                "recommendations": ["No deduplication action required."],
            }

        top = candidates[0]
        score = top.get("combined_score", 0.0)
        c_name = top.get("target_project_name", "Unknown Project")
        c_id = top.get("target_project_id_str", "N/A")
        classification = top.get("classification", "DIFFERENT_PROJECT")
        geo_dist = top.get("geographic_distance_km")

        if classification == "POSSIBLE_DUPLICATE":
            narrative = (
                f"High-confidence overlap detected with Project '{c_name}' ({c_id}). "
                f"Semantic work description similarity is {top.get('description_similarity', 0)*100:.1f}% with "
                f"a spatial proximity of {geo_dist if geo_dist is not None else 'adjacent'} km. "
                f"Both projects exhibit concurrent timelines and comparable financial sanctions, strongly suggesting "
                f"duplicate accounting or dual-sanctioning under separate scheme codes."
            )
            actions = [
                f"Compare physical GPS coordinates and site photographs with {c_id}.",
                "Check whether separate central and state schemes have sanctioned the exact same physical asset.",
                "Hold release of secondary tranches pending site verification.",
            ]
        elif classification == "POSSIBLE_OVERLAP":
            narrative = (
                f"Moderate overlap observed with '{c_name}' ({c_id}) in the same administrative area. "
                f"Combined similarity score is {score*100:.1f}%. While physical components may differ, scopes appear intertwined."
            )
            actions = [
                "Review scope of work boundaries between the two neighboring allocations.",
                "Confirm demarcation points with the local executive engineer.",
            ]
        else:
            narrative = f"Project exhibits minor thematic relationship with '{c_name}' ({c_id}), but remains distinct."
            actions = ["Maintain standard registry links."]

        return {
            "narrative": narrative,
            "top_candidate": c_name,
            "top_candidate_id": c_id,
            "classification": classification,
            "recommendations": actions,
        }

    async def explain_delay(self, project: Dict[str, Any], delay_data: Dict[str, Any]) -> Dict[str, Any]:
        cls = delay_data.get("delay_classification", "INSUFFICIENT_INFORMATION")
        elapsed = delay_data.get("time_elapsed_percentage") or 0.0
        comp = delay_data.get("completion_percentage") or 0.0
        gap = delay_data.get("schedule_deviation") or 0.0

        if cls == "SIGNIFICANT_DELAY":
            narrative = (
                f"Severe timeline slippage detected: {elapsed:.1f}% of the planned contractual duration has elapsed, "
                f"yet physical progress stands at only {comp:.1f}% (a {gap:.1f}% progress deficit). "
                f"At the current velocity, this project risks prolonged stall and significant cost overruns."
            )
            actions = [
                "Issue formal inquiry to project implementing agency regarding delay bottlenecks (land clearance, utility shifting, or contractor default).",
                "Invoke contractual penalty clauses or review milestone payment eligibility.",
                "Establish revised critical-path milestone recovery timeline.",
            ]
        elif cls == "AT_RISK":
            narrative = (
                f"Project is showing initial delay tendencies. While {elapsed:.1f}% of timeline has elapsed, "
                f"reported completion is {comp:.1f}% ({gap:.1f}% behind scheduled pace)."
            )
            actions = [
                "Request monthly progress update from field executive engineer.",
                "Evaluate upcoming seasonal impediments (e.g. monsoon interruptions).",
            ]
        elif cls == "COMPLETED":
            narrative = f"Project reports 100% completion. Ensure physical asset handover and completion certificate audit."
            actions = ["Verify physical asset verification report."]
        else:
            narrative = f"Execution timeline is progressing within acceptable variance ({comp:.1f}% progress at {elapsed:.1f}% elapsed)."
            actions = ["Proceed with regular monitoring."]

        return {
            "narrative": narrative,
            "classification": cls,
            "recommendations": actions,
        }

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
        name = project.get("project_name", "Infrastructure Project")
        p_id = project.get("project_id", "N/A")
        cat = project.get("category", "Public Works")
        dist = project.get("district", "District")
        state = project.get("state", "State")

        findings = []
        if (cost_data.get("risk_score") or 0) > 40:
            dev = cost_data.get("cost_deviation_percentage", 0)
            findings.append(f"Cost Outlier: Project budget deviates by {dev:+.1f}% from comparable {cat} works.")

        dup_score = duplicate_data.get("risk_score", 0)
        if dup_score > 40:
            findings.append(f"Potential Project Duplication: Candidate overlap identified with similarity of {dup_score:.1f}%.")

        if (delay_data.get("risk_score") or 0) > 40:
            gap = delay_data.get("schedule_deviation", 0)
            findings.append(f"Schedule Risk: Timeline progress lags planned completion by {gap:.1f}%.")

        if (dq_data.get("risk_score") or 0) > 25:
            cnt = dq_data.get("total_issues", 0)
            findings.append(f"Data Integrity Deficit: {cnt} schema or validation issues flagged.")

        if not findings:
            findings.append("No critical anomaly flags triggered; indicators within normal operational parameters.")

        if risk_level == "CRITICAL":
            exec_summary = (
                f"PRIORITY REVIEW RECOMMENDED: Project '{name}' ({p_id}) has been assigned a CRITICAL risk score of "
                f"{risk_score:.1f}/100. Multi-factor anomaly indicators demonstrate simultaneous cost, duplicate, or delay "
                f"irregularities in {dist}, {state}. Human reviewer inspection is urgently required before further fund disbursement."
            )
            priority_action = "Initiate comprehensive field audit and place milestone payments on administrative hold."
        elif risk_level == "HIGH":
            exec_summary = (
                f"ATTENTION REQUIRED: Project '{name}' ({p_id}) is designated HIGH risk ({risk_score:.1f}/100). "
                f"Elevated risk signals detected in primary execution parameters. Targeted reviewer validation is indicated."
            )
            priority_action = "Assign case to district vigilance officer for documentary verification."
        elif risk_level == "MEDIUM":
            exec_summary = (
                f"MONITORING ADVISORY: Project '{name}' ({p_id}) carries a MEDIUM risk classification ({risk_score:.1f}/100). "
                f"Minor anomalies detected in statistical or schedule baselines."
            )
            priority_action = "Queue for routine secondary desk review during next audit cycle."
        else:
            exec_summary = (
                f"STANDARD STATUS: Project '{name}' ({p_id}) is classified as LOW risk ({risk_score:.1f}/100). "
                f"All metrics conform to standard public project parameters."
            )
            priority_action = "Continue standard administrative progress reporting."

        return {
            "executive_summary": exec_summary,
            "project_context": f"{cat} in {dist}, {state}",
            "key_findings": findings,
            "priority_action": priority_action,
            "overall_score": risk_score,
            "risk_classification": risk_level,
            "disclaimer": "Nigrani AI provides automated risk screening and explainable evidence. All findings are investigative leads for human experts, not allegations of wrongdoing.",
        }
