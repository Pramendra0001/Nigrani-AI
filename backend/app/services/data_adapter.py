"""Production Data Pipeline Adapter Architecture.

This module provides the modular architecture for ingesting, validating,
and normalizing real-world external infrastructure records into Nigrani AI.

Pipeline Stages:
  Data Source -> Validation -> Normalization -> Persistence (DB) -> Analysis Engines -> REST API -> UI
"""

import abc
import logging
from datetime import datetime, date
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.models import Project
from app.services.analysis_service import AnalysisService

logger = logging.getLogger("nigrani.data_adapter")


# -------------------------------------------------------------
# Standard Data Contract for Real-World Integration
# -------------------------------------------------------------
REQUIRED_FIELDS = {
    "project_id": "Unique alphanumeric scheme or tender identifier (e.g., PRJ-MH-001 or NIT-2026-8971)",
    "project_name": "Full legal or administrative project title",
    "state": "Indian State or Union Territory name",
    "district": "Administrative district name",
    "category": "Infrastructure sector (e.g., Road Construction, Healthcare, Water Supply, Housing)",
    "budget": "Total sanctioned financial allocation in Lakhs (INR)",
    "start_date": "Contractual commencement date (YYYY-MM-DD)",
    "expected_end_date": "Scheduled target completion date (YYYY-MM-DD)",
}

OPTIONAL_FIELDS = {
    "description": "Administrative scope, executive summary, or sanction details",
    "actual_cost": "Total cumulative expenditure disbursed to date in Lakhs (INR)",
    "completion_percentage": "Physical work completion verified on site (0.0 to 100.0)",
    "status": "Operational state: ONGOING, COMPLETED, DELAYED, NOT_STARTED, or CANCELLED",
    "latitude": "WGS-84 Decimal latitude coordinate (between 6.0 and 38.0 for India)",
    "longitude": "WGS-84 Decimal longitude coordinate (between 68.0 and 98.0 for India)",
}


class DataSourceAdapter(abc.ABC):
    """Abstract Base Class for all external data sources (APIs, webhooks, databases, CSV)."""

    @abc.abstractmethod
    async def fetch_raw_records(self, **kwargs) -> List[Dict[str, Any]]:
        """Retrieve raw records from upstream source."""
        pass

    def validate_record(self, raw: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validates that incoming record conforms to the required data contract."""
        errors: List[str] = []
        for f in REQUIRED_FIELDS:
            val = raw.get(f)
            if val is None or (isinstance(val, str) and not val.strip()):
                errors.append(f"Missing mandatory field '{f}'")

        # Budget sanity
        budget = raw.get("budget")
        if budget is not None:
            try:
                b_float = float(budget)
                if b_float < 0:
                    errors.append(f"Invalid negative budget: {b_float}")
            except (ValueError, TypeError):
                errors.append(f"Non-numeric budget: {budget}")

        return (len(errors) == 0, errors)

    def normalize_record(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes field formats, parses dates, and formats standard types."""
        # Parse start date
        start_d: Optional[date] = None
        if raw.get("start_date"):
            if isinstance(raw["start_date"], date):
                start_d = raw["start_date"]
            else:
                for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
                    try:
                        start_d = datetime.strptime(str(raw["start_date"]).strip(), fmt).date()
                        break
                    except ValueError:
                        continue

        # Parse end date
        end_d: Optional[date] = None
        if raw.get("expected_end_date"):
            if isinstance(raw["expected_end_date"], date):
                end_d = raw["expected_end_date"]
            else:
                for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
                    try:
                        end_d = datetime.strptime(str(raw["expected_end_date"]).strip(), fmt).date()
                        break
                    except ValueError:
                        continue

        return {
            "project_id": str(raw.get("project_id", "")).strip(),
            "project_name": str(raw.get("project_name", "")).strip(),
            "description": str(raw.get("description", "")).strip() if raw.get("description") else None,
            "state": str(raw.get("state", "")).strip().title() if raw.get("state") else None,
            "district": str(raw.get("district", "")).strip().title() if raw.get("district") else None,
            "category": str(raw.get("category", "General Infrastructure")).strip(),
            "budget": float(raw["budget"]) if raw.get("budget") is not None else None,
            "actual_cost": float(raw["actual_cost"]) if raw.get("actual_cost") is not None else None,
            "start_date": start_d,
            "expected_end_date": end_d,
            "completion_percentage": float(raw.get("completion_percentage", 0.0)),
            "status": str(raw.get("status", "ONGOING")).upper().strip(),
            "latitude": float(raw["latitude"]) if raw.get("latitude") is not None else None,
            "longitude": float(raw["longitude"]) if raw.get("longitude") is not None else None,
        }

    async def ingest(self, db: AsyncSession, raw_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Runs the validation, normalization, upsert, and analytical scoring pipeline."""
        valid_records: List[Dict[str, Any]] = []
        rejected_records: List[Dict[str, Any]] = []

        for item in raw_records:
            is_valid, issues = self.validate_record(item)
            if is_valid:
                valid_records.append(self.normalize_record(item))
            else:
                rejected_records.append({"record": item, "issues": issues})

        # Upsert into database
        saved_count = 0
        for norm in valid_records:
            existing = (await db.execute(
                select(Project).where(Project.project_id == norm["project_id"])
            )).scalar_one_or_none()

            if existing:
                for k, v in norm.items():
                    setattr(existing, k, v)
            else:
                p = Project(**norm)
                db.add(p)
            saved_count += 1

        await db.commit()

        # Run multi-engine anomaly scoring
        analysis_service = AnalysisService()
        await analysis_service.analyze_batch(db)

        return {
            "total_processed": len(raw_records),
            "ingested_count": saved_count,
            "rejected_count": len(rejected_records),
            "rejected_samples": rejected_records[:5],
            "data_contract_version": "1.0-2026",
        }


class ExternalRestApiAdapter(DataSourceAdapter):
    """
    Template adapter for future authorized government API integrations
    (e.g., State Public Works Portals, GeM, or National Infrastructure Pipelines).
    """

    def __init__(self, endpoint_url: str, auth_token: Optional[str] = None):
        self.endpoint_url = endpoint_url
        self.auth_token = auth_token

    async def fetch_raw_records(self, **kwargs) -> List[Dict[str, Any]]:
        # Ready for live HTTP requests when production API keys are provided
        logger.info(f"Connecting to external data provider: {self.endpoint_url}")
        return []
