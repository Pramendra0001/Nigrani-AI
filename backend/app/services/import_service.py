"""Data import and schema mapping service."""

import csv
import io
import uuid
from datetime import datetime
from typing import Dict, Any, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Project, ProjectRawData, DataImport


class ImportService:
    """Handles CSV parsing, fuzzy column mapping, validation and database import."""

    STANDARD_FIELDS = [
        "project_id", "project_name", "description", "state", "district",
        "category", "parliament_type", "budget", "actual_cost", "start_date", "expected_end_date",
        "completion_percentage", "status", "latitude", "longitude"
    ]

    FIELD_ALIASES = {
        "project_id": ["id", "proj_id", "project_code", "code", "work_id", "sr_no"],
        "project_name": ["name", "title", "project_title", "work_name", "scheme_work"],
        "description": ["desc", "details", "work_description", "scope", "remarks", "about"],
        "state": ["state_name", "province", "region"],
        "district": ["district_name", "dist", "zila"],
        "category": ["sector", "type", "project_type", "work_category", "scheme"],
        "parliament_type": ["house", "parliament", "parliament_type", "sabha", "house_type"],
        "budget": ["cost", "estimated_cost", "sanctioned_amount", "approved_budget", "amount_lakh"],
        "actual_cost": ["expenditure", "spent", "actual_spend", "booked_expenditure"],
        "start_date": ["commencement_date", "begin_date", "start", "sanction_date"],
        "expected_end_date": ["target_date", "completion_date", "end_date", "deadline"],
        "completion_percentage": ["progress", "completion_pct", "physical_progress", "percent_done"],
        "status": ["current_status", "work_status", "project_status"],
        "latitude": ["lat", "gps_lat"],
        "longitude": ["lng", "lon", "long", "gps_lng"],
    }

    def parse_csv(self, content_str: str) -> Tuple[List[str], List[Dict[str, str]]]:
        """Parses raw CSV content into headers and row dictionaries."""
        reader = csv.reader(io.StringIO(content_str))
        rows = list(reader)
        if not rows:
            return [], []
        headers = [h.strip() for h in rows[0]]
        records = []
        for r in rows[1:]:
            if not any(cell.strip() for cell in r):
                continue
            row_dict = {}
            for idx, h in enumerate(headers):
                row_dict[h] = r[idx].strip() if idx < len(r) else ""
            records.append(row_dict)
        return headers, records

    def suggest_mapping(self, headers: List[str]) -> Dict[str, str]:
        """Fuzzy matches incoming headers to standard field schema."""
        mapping: Dict[str, str] = {}
        used_std = set()

        for h in headers:
            clean = h.lower().replace(" ", "_").replace("-", "_")
            # Exact match
            if clean in self.STANDARD_FIELDS:
                mapping[h] = clean
                used_std.add(clean)
                continue

            # Alias match
            found = False
            for std, aliases in self.FIELD_ALIASES.items():
                if std in used_std:
                    continue
                if clean in aliases or any(clean.startswith(a) for a in aliases):
                    mapping[h] = std
                    used_std.add(std)
                    found = True
                    break
            if not found:
                mapping[h] = ""  # Unmapped

        return mapping

    def validate_and_preview(
        self, records: List[Dict[str, str]], mapping: Dict[str, str]
    ) -> Dict[str, Any]:
        """Generates preview and validation metrics for proposed column mapping."""
        sample_rows = []
        for r in records[:8]:
            mapped_row = {}
            for orig_k, val in r.items():
                target_field = mapping.get(orig_k)
                if target_field:
                    mapped_row[target_field] = val
            sample_rows.append(mapped_row)

        issues = []
        valid_rows = 0

        for idx, r in enumerate(records):
            row_valid = True
            p_name = ""
            for orig_k, val in r.items():
                if mapping.get(orig_k) == "project_name":
                    p_name = val
            if not p_name:
                issues.append({"row": idx + 1, "column": "project_name", "issue": "Missing project name", "severity": "CRITICAL"})
                row_valid = False
            if row_valid:
                valid_rows += 1

        return {
            "total_records": len(records),
            "valid_records": valid_rows,
            "sample_preview": sample_rows,
            "issues": issues[:20],
            "is_ready": valid_rows > 0,
        }

    async def execute_import(
        self,
        db: AsyncSession,
        filename: str,
        records: List[Dict[str, str]],
        mapping: Dict[str, str],
    ) -> Dict[str, Any]:
        """Imports rows into Project and ProjectRawData entities."""
        import_id = str(uuid.uuid4())
        imported = 0
        failed = 0

        for idx, r in enumerate(records):
            try:
                mapped = {}
                for orig_k, val in r.items():
                    target = mapping.get(orig_k)
                    if target:
                        mapped[target] = val

                p_id = mapped.get("project_id") or f"IMP-{uuid.uuid4().hex[:8].upper()}"
                p_name = mapped.get("project_name") or f"Imported Work #{idx+1}"

                budget = float(mapped.get("budget") or 0.0) if mapped.get("budget") else None
                actual = float(mapped.get("actual_cost") or 0.0) if mapped.get("actual_cost") else None
                comp = float(mapped.get("completion_percentage") or 0.0) if mapped.get("completion_percentage") else 0.0

                start_d = None
                end_d = None
                for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y"):
                    if mapped.get("start_date") and not start_d:
                        try:
                            start_d = datetime.strptime(mapped["start_date"], fmt).date()
                        except Exception:
                            pass
                    if mapped.get("expected_end_date") and not end_d:
                        try:
                            end_d = datetime.strptime(mapped["expected_end_date"], fmt).date()
                        except Exception:
                            pass

                lat = float(mapped.get("latitude")) if mapped.get("latitude") else None
                lng = float(mapped.get("longitude")) if mapped.get("longitude") else None

                p_cat = mapped.get("category")
                p_house = mapped.get("parliament_type")
                if not p_house:
                    p_house = "Rajya Sabha" if "Rajya" in (p_cat or "") else "Lok Sabha"

                proj = Project(
                    project_id=p_id,
                    project_name=p_name,
                    description=mapped.get("description"),
                    state=mapped.get("state"),
                    district=mapped.get("district"),
                    category=p_cat,
                    parliament_type=p_house,
                    budget=budget,
                    actual_cost=actual,
                    start_date=start_d,
                    expected_end_date=end_d,
                    completion_percentage=comp,
                    status=mapped.get("status") or "ONGOING",
                    latitude=lat,
                    longitude=lng,
                    data_import_id=import_id,
                )
                db.add(proj)

                # Raw Data
                raw = ProjectRawData(
                    project_id=proj.id,
                    raw_data=str(r),
                )
                db.add(raw)
                imported += 1
            except Exception:
                failed += 1

        # DataImport entity
        di = DataImport(
            id=import_id,
            filename=filename,
            file_type="csv",
            total_records=len(records),
            imported_records=imported,
            failed_records=failed,
            status="COMPLETED",
        )
        db.add(di)
        await db.flush()
        await db.commit()

        return {
            "import_id": import_id,
            "imported_count": imported,
            "failed_count": failed,
            "status": "COMPLETED",
        }
