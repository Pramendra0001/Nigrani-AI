"""MPLADS Real Government Dataset Ingestion and Transformation Engine for Nigrani AI."""

import os
import json
import uuid
import logging
import zipfile
import xml.etree.ElementTree as ET
from datetime import date, datetime
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func

from app.models.models import (
    Project,
    ProjectRawData,
    ProjectAnalysis,
    CostAnalysis,
    DelayAnalysis,
    DataQualityAnalysis,
    DuplicateCandidate,
    DuplicateAnalysis,
    ReviewCase,
    ReviewNote,
)
from app.services.analysis_service import AnalysisService

logger = logging.getLogger("nigrani.mplads")

# Geographic Centers for all 36 Indian States and Union Territories
STATE_COORDINATES: Dict[str, Tuple[float, float]] = {
    "Andaman And Nicobar Islands": (11.74, 92.65),
    "Andhra Pradesh": (15.91, 79.74),
    "Arunachal Pradesh": (28.21, 94.72),
    "Assam": (26.20, 92.93),
    "Bihar": (25.09, 85.31),
    "Chandigarh": (30.73, 76.77),
    "Chhattisgarh": (21.27, 81.86),
    "Delhi": (28.70, 77.10),
    "Goa": (15.29, 74.12),
    "Gujarat": (22.25, 71.19),
    "Haryana": (29.05, 76.08),
    "Himachal Pradesh": (31.10, 77.17),
    "Jammu And Kashmir": (33.77, 76.57),
    "Jharkhand": (23.61, 85.27),
    "Karnataka": (15.31, 75.71),
    "Kerala": (10.85, 76.27),
    "Ladakh": (34.15, 77.57),
    "Lakshadweep": (10.56, 72.64),
    "Madhya Pradesh": (22.97, 78.65),
    "Maharashtra": (19.75, 75.71),
    "Manipur": (24.66, 93.90),
    "Meghalaya": (25.46, 91.36),
    "Mizoram": (23.16, 92.93),
    "Nagaland": (26.15, 94.56),
    "Odisha": (20.95, 85.09),
    "Puducherry": (11.94, 79.80),
    "Punjab": (31.14, 75.34),
    "Rajasthan": (27.02, 74.21),
    "Sikkim": (27.53, 88.51),
    "Tamil Nadu": (11.12, 78.65),
    "Telangana": (18.11, 79.01),
    "The Dadra And Nagar Haveli And Daman And Diu": (20.42, 72.83),
    "Tripura": (23.94, 91.98),
    "Uttar Pradesh": (26.84, 80.94),
    "Uttarakhand": (30.06, 79.01),
    "West Bengal": (22.98, 87.85),
}


def find_mplads_excel_path() -> Optional[str]:
    """Locates the MPLADS Excel file across repository root, parent directories, or cwd."""
    candidates = [
        # Directly from repo root / data folder
        os.path.join(os.getcwd(), "data", "MPLADS_Nigrani_AI_Data_Package.xlsx"),
        # Relative from backend directory
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "MPLADS_Nigrani_AI_Data_Package.xlsx")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "MPLADS_Nigrani_AI_Data_Package.xlsx")),
        # Absolute path on user system
        r"C:\Users\PRAMENDRA KUSHWAHA\Desktop\SIH\RR\data\MPLADS_Nigrani_AI_Data_Package.xlsx",
        # Local data directory
        os.path.abspath(os.path.join(os.path.dirname(__file__), "mplads_data.xlsx")),
    ]
    for p in candidates:
        if os.path.exists(p) and os.path.getsize(p) > 1000:
            return p
    return None


def parse_mplads_excel(file_path: str) -> List[Dict[str, Any]]:
    """
    Parses 'MP_Data' sheet from MPLADS_Nigrani_AI_Data_Package.xlsx using python's built-in
    zipfile and XML parser (zero third-party dependencies required).
    """
    NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
    with zipfile.ZipFile(file_path, "r") as z:
        # 1. Read shared strings
        shared_strings = []
        if "xl/sharedStrings.xml" in z.namelist():
            ss_tree = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in ss_tree.findall(f"{NS}si"):
                t_elems = si.findall(f".//{NS}t")
                shared_strings.append("".join([t.text or "" for t in t_elems]))

        # 2. Map sheet relationships
        rels_tree = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        rel_map = {r.attrib["Id"]: r.attrib["Target"] for r in rels_tree}

        # 3. Locate 'MP_Data' sheet
        wb_tree = ET.fromstring(z.read("xl/workbook.xml"))
        target_path = None
        for s in wb_tree.findall(f".//{NS}sheet"):
            if s.attrib["name"] == "MP_Data":
                rId = s.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
                target_path = "xl/" + rel_map[rId]
                break

        if not target_path:
            raise ValueError(f"Sheet 'MP_Data' not found in {file_path}")

        # 4. Extract sheet rows
        sheet_tree = ET.fromstring(z.read(target_path))
        raw_rows = []
        for row in sheet_tree.findall(f".//{NS}row"):
            row_vals = []
            for c in row.findall(f"{NS}c"):
                t = c.attrib.get("t")
                v = c.find(f"{NS}v")
                val = v.text if v is not None else ""
                if t == "s" and val.isdigit():
                    idx = int(val)
                    val = shared_strings[idx] if idx < len(shared_strings) else val
                row_vals.append(val.strip())
            raw_rows.append(row_vals)

    if not raw_rows:
        return []

    headers = raw_rows[0]
    records = []
    for r in raw_rows[1:]:
        if not r or not any(r):
            continue
        record = dict(zip(headers, r))
        records.append(record)

    return records


def transform_mplads_record(record: Dict[str, Any], index: int) -> Dict[str, Any]:
    """
    Transforms an official MPLADS row into the standardized Nigrani AI Project entity schema.
    Converts amounts to ₹ Lakhs, generates clean dates, determines status, and assigns GIS coordinates.
    """
    mp_name = (record.get("MP Name") or f"Member of Parliament {index}").strip()
    constituency = (record.get("Constituency") or "General").strip()
    state = (record.get("State") or "India").strip()
    house = (record.get("House") or "Lok Sabha").strip()

    # Financial conversions (Raw ₹ to ₹ Lakhs)
    try:
        alloc_raw = float(record.get("Allocated Amount (₹)") or 0.0)
    except Exception:
        alloc_raw = 0.0
    budget_lakhs = round(alloc_raw / 100000.0, 2)

    try:
        rec_raw = float(record.get("Amount Recommended (₹)") or 0.0)
    except Exception:
        rec_raw = 0.0
    rec_lakhs = round(rec_raw / 100000.0, 2)

    try:
        exp_raw = float(record.get("Total Expenditure (₹)") or 0.0)
    except Exception:
        exp_raw = 0.0
    actual_cost_lakhs = round(exp_raw / 100000.0, 2)

    try:
        balance_raw = float(record.get("Balance Not Yet Paid to Vendors (₹)") or 0.0)
    except Exception:
        balance_raw = 0.0
    balance_lakhs = round(balance_raw / 100000.0, 2)

    # Physical progress
    try:
        comp_works = int(float(record.get("Completed Works") or 0))
    except Exception:
        comp_works = 0

    try:
        rec_works = int(float(record.get("Recommended Works") or 0))
    except Exception:
        rec_works = 0

    try:
        comp_rate = float(record.get("Completion Rate %") or 0.0)
    except Exception:
        comp_rate = (comp_works / rec_works * 100.0) if rec_works > 0 else 0.0
    comp_rate = round(min(100.0, max(0.0, comp_rate)), 1)

    try:
        util_pct = float(record.get("Utilization %") or 0.0)
    except Exception:
        util_pct = (exp_raw / rec_raw * 100.0) if rec_raw > 0 else 0.0
    util_pct = round(min(100.0, max(0.0, util_pct)), 1)

    trans_count = record.get("Transaction Count") or "0"
    succ_pay = record.get("Successful Payments") or "0"
    pending_pay = record.get("Pending Payments") or "0"

    # Standardized Project ID (e.g. MPLADS-LS-001, MPLADS-RS-001)
    prefix = "LS" if "Lok" in house else "RS"
    project_id = f"MPLADS-{prefix}-{index:03d}"

    # Category division & parliament type
    category = f"MPLADS — {house}"
    parliament_type = "Rajya Sabha" if "Rajya" in house else "Lok Sabha"

    # Project Name
    project_name = f"{mp_name} — {constituency}"

    # Status derivation
    if comp_rate >= 80.0:
        status = "COMPLETED"
    elif comp_rate > 0.0:
        status = "ONGOING"
    elif exp_raw > 0 and comp_works == 0:
        status = "DELAYED"  # Zero works completed despite significant fund disbursement
    else:
        status = "NOT_STARTED"

    # Tenure dates
    if prefix == "LS":
        start_d = date(2024, 6, 4)
        end_d = date(2029, 6, 3)
    else:
        # Parse Rajya Sabha tenure if formatted like (2022-28)
        start_year = 2022
        end_year = 2028
        import re
        m = re.search(r"\((\d{4})-(\d{2,4})\)", mp_name)
        if m:
            start_year = int(m.group(1))
            end_s = m.group(2)
            end_year = int(end_s) if len(end_s) == 4 else int(str(start_year)[:2] + end_s)
        start_d = date(start_year, 4, 1)
        end_d = date(end_year, 3, 31)

    # GIS Map Coordinates (State Center + deterministic constituency scatter)
    base_lat, base_lon = STATE_COORDINATES.get(state, (20.5937, 78.9629))
    h = abs(hash(constituency + mp_name))
    offset_lat = ((h % 50) - 25) * 0.02
    offset_lon = (((h // 50) % 50) - 25) * 0.02
    latitude = round(base_lat + offset_lat, 4)
    longitude = round(base_lon + offset_lon, 4)

    # Narrative Description
    description = (
        f"Official MPLADS Parliamentary Fund Portfolio for {mp_name}, representing "
        f"{constituency} ({house}, {state}). Allocated Budget: ₹{budget_lakhs:,.2f} Lakh | Sanctioned/Recommended: "
        f"₹{rec_lakhs:,.2f} Lakh across {rec_works} works. Completed: {comp_works} works ({comp_rate}% completion rate). "
        f"Cumulative Expenditure: ₹{actual_cost_lakhs:,.2f} Lakh ({util_pct}% utilization). "
        f"Outstanding Vendor Liability: ₹{balance_lakhs:,.2f} Lakh across {trans_count} transactions "
        f"({succ_pay} settled, {pending_pay} pending payments)."
    )

    return {
        "project_id": project_id,
        "project_name": project_name,
        "description": description,
        "state": state,
        "district": constituency,
        "category": category,
        "parliament_type": parliament_type,
        "budget": budget_lakhs,
        "actual_cost": actual_cost_lakhs,
        "start_date": start_d,
        "expected_end_date": end_d,
        "completion_percentage": comp_rate,
        "status": status,
        "latitude": latitude,
        "longitude": longitude,
        "raw_record": record,
    }


def find_mplads_json_path() -> Optional[str]:
    """Locates the official 18th Lok Sabha MPLADS JSON file across repository paths."""
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "mplads_data.json")),
        os.path.abspath(os.path.join(os.getcwd(), "backend", "app", "utils", "mplads_data.json")),
        os.path.abspath(os.path.join(os.getcwd(), "frontend", "src", "demo_projects.json")),
    ]
    for p in candidates:
        if os.path.exists(p) and os.path.getsize(p) > 1000:
            return p
    return None


async def seed_mplads_database(db: AsyncSession, force_reload: bool = False) -> int:
    """
    Ingests the official 18th Lok Sabha MPLADS dataset (543 MPs) into the SQLite/Postgres database.
    Replaces any existing mock or legacy project data with the real 543 MP records.
    Runs baseline computational intelligence analysis across all records.
    """
    json_path = find_mplads_json_path()
    excel_path = find_mplads_excel_path()
    if not json_path and not excel_path:
        logger.warning("Neither MPLADS JSON nor Excel dataset found on filesystem. Skipping real data ingestion.")
        return 0

    # Check if database already has official 774 MPLADS data AND has been analyzed
    existing_count = (await db.execute(select(func.count()).select_from(Project))).scalar() or 0
    analyzed_count = (await db.execute(select(func.count()).select_from(ProjectAnalysis))).scalar() or 0
    rs_count = (await db.execute(select(func.count()).select_from(Project).where(Project.parliament_type == "Rajya Sabha"))).scalar() or 0
    first_proj = (await db.execute(select(Project).limit(1))).scalar_one_or_none()
    is_mplads_already = first_proj and first_proj.project_id.startswith("MPLADS-")
    has_risk_levels = first_proj and first_proj.risk_level is not None

    if rs_count == 0 and existing_count > 0:
        logger.info("Database records missing Rajya Sabha parliament_type tags. Forcing data reload...")
        force_reload = True

    if existing_count == 774 and is_mplads_already and (analyzed_count < 774 or not has_risk_levels) and not force_reload:
        logger.info(f"Database has {existing_count} records but incomplete analysis ({analyzed_count}/774). Running self-healing batch analysis...")
        analysis_service = AnalysisService()
        analysis_summary = await analysis_service.analyze_batch(db)
        logger.info(f"Self-healing complete: {analysis_summary['completed']} analyzed, {analysis_summary['errors']} errors.")
        return existing_count

    if existing_count == 774 and analyzed_count == 774 and is_mplads_already and has_risk_levels and not force_reload:
        logger.info(f"Database already contains {existing_count} fully analyzed official parliamentary project records (Lok Sabha + Rajya Sabha). Skipping re-seed.")
        return existing_count

    # Prepare items to insert
    items_to_insert = []
    if json_path:
        logger.info(f"Ingesting official MPLADS dataset from: {json_path}")
        with open(json_path, "r", encoding="utf-8") as f:
            json_items = json.load(f)
        for item in json_items:
            s_d = datetime.strptime(item["start_date"], "%Y-%m-%d").date() if isinstance(item["start_date"], str) else item["start_date"]
            e_d = datetime.strptime(item["expected_end_date"], "%Y-%m-%d").date() if isinstance(item["expected_end_date"], str) else item["expected_end_date"]
            cat = item.get("category", "MPLADS — Lok Sabha")
            p_house = item.get("parliament_type") or ("Rajya Sabha" if "Rajya" in cat else "Lok Sabha")
            items_to_insert.append({
                "project_id": item["project_id"],
                "project_name": item["project_name"],
                "description": item["description"],
                "state": item["state"],
                "district": item["district"],
                "category": cat,
                "parliament_type": p_house,
                "budget": float(item["budget"]),
                "actual_cost": float(item["actual_cost"]),
                "start_date": s_d,
                "expected_end_date": e_d,
                "completion_percentage": float(item["completion_percentage"]),
                "status": item["status"],
                "latitude": float(item["latitude"]),
                "longitude": float(item["longitude"]),
                "risk_score": float(item.get("risk_score") or 0.0),
                "risk_level": item.get("risk_level") or "LOW",
                "raw_record": item,
            })
    elif excel_path:
        logger.info(f"Ingesting MPLADS dataset from Excel fallback: {excel_path}")
        raw_records = parse_mplads_excel(excel_path)
        ls_idx = 1
        rs_idx = 1
        for raw in raw_records:
            house = (raw.get("House") or "Lok Sabha").strip()
            idx = ls_idx if "Lok" in house else rs_idx
            if "Lok" in house:
                ls_idx += 1
            else:
                rs_idx += 1
            items_to_insert.append(transform_mplads_record(raw, idx))

    if not items_to_insert:
        logger.error("No records loaded from MPLADS dataset sources.")
        return 0

    # Wipe previous mock data safely
    logger.info("Purging legacy project data to ensure pristine government dataset state...")
    await db.execute(delete(ReviewNote))
    await db.execute(delete(ReviewCase))
    await db.execute(delete(DuplicateCandidate))
    await db.execute(delete(DuplicateAnalysis))
    await db.execute(delete(DataQualityAnalysis))
    await db.execute(delete(DelayAnalysis))
    await db.execute(delete(CostAnalysis))
    await db.execute(delete(ProjectAnalysis))
    await db.execute(delete(ProjectRawData))
    await db.execute(delete(Project))
    await db.flush()

    # Insert real MPLADS projects
    created_projects = []
    for item in items_to_insert:
        proj = Project(
            id=str(uuid.uuid4()),
            project_id=item["project_id"],
            project_name=item["project_name"],
            description=item["description"],
            state=item["state"],
            district=item["district"],
            category=item["category"],
            parliament_type=item.get("parliament_type", "Lok Sabha"),
            budget=item["budget"],
            actual_cost=item["actual_cost"],
            start_date=item["start_date"],
            expected_end_date=item["expected_end_date"],
            completion_percentage=item["completion_percentage"],
            status=item["status"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            risk_score=item.get("risk_score"),
            risk_level=item.get("risk_level", "LOW"),
        )
        db.add(proj)

        # Store complete original raw data row in ProjectRawData
        raw_row = ProjectRawData(
            id=str(uuid.uuid4()),
            project_id=proj.id,
            raw_data=json.dumps(item["raw_record"]),
        )
        db.add(raw_row)
        created_projects.append(proj)

    await db.flush()
    await db.commit()
    logger.info(f"Successfully committed {len(created_projects)} real MPLADS project records to database.")

    # Run AI & statistical anomaly engines over the new real dataset
    logger.info(f"Executing unified anomaly detection and risk scoring across all {len(created_projects)} records...")
    analysis_service = AnalysisService()
    analysis_summary = await analysis_service.analyze_batch(db)
    logger.info(f"MPLADS Analysis Complete: {analysis_summary['completed']} analyzed, {analysis_summary['errors']} errors.")

    return len(created_projects)


def export_mplads_json_for_frontend(dest_path: str) -> int:
    """
    Exports the transformed MPLADS dataset to JSON for the frontend client offline/GitHub Pages fallback.
    Ensures frontend and backend operate on the identical authentic government dataset.
    """
    excel_path = find_mplads_excel_path()
    if not excel_path:
        return 0

    raw_records = parse_mplads_excel(excel_path)
    transformed_items = []
    ls_idx = 1
    rs_idx = 1
    for raw in raw_records:
        house = (raw.get("House") or "Lok Sabha").strip()
        idx = ls_idx if "Lok" in house else rs_idx
        if "Lok" in house:
            ls_idx += 1
        else:
            rs_idx += 1
        item = transform_mplads_record(raw, idx)
        transformed_items.append(item)

    all_dicts = [
        {
            "id": it["project_id"],
            "project_id": it["project_id"],
            "project_name": it["project_name"],
            "description": it["description"],
            "state": it["state"],
            "district": it["district"],
            "category": it["category"],
            "parliament_type": it.get("parliament_type", "Lok Sabha"),
            "budget": it["budget"],
            "actual_cost": it["actual_cost"],
            "start_date": it["start_date"].isoformat(),
            "expected_end_date": it["expected_end_date"].isoformat(),
            "completion_percentage": it["completion_percentage"],
            "status": it["status"],
            "latitude": it["latitude"],
            "longitude": it["longitude"],
        }
        for it in transformed_items
    ]

    svc = AnalysisService()
    output = []
    for p_dict in all_dicts:
        comps = svc.cost_engine.find_comparable_projects(p_dict, all_dicts)
        cost_res = svc.cost_engine.analyze(p_dict, comps)
        delay_res = svc.delay_engine.analyze(p_dict)
        dq_res = svc.dq_engine.analyze(p_dict)
        dup_candidates = svc.duplicate_engine.find_candidates(p_dict, all_dicts, top_k=3)
        dup_risk = svc.duplicate_engine.calculate_risk_score(dup_candidates)

        risk_res = svc.risk_engine.calculate(
            cost_risk=cost_res["risk_score"],
            duplicate_risk=dup_risk,
            delay_risk=delay_res["risk_score"],
            dq_risk=dq_res["risk_score"],
        )

        rec = dict(p_dict)
        rec["risk_score"] = risk_res["overall_risk_score"]
        rec["risk_level"] = risk_res["risk_level"]
        rec["cost_risk_score"] = cost_res["risk_score"]
        rec["delay_risk_score"] = delay_res["risk_score"]
        rec["duplicate_risk_score"] = dup_risk
        rec["data_quality_risk_score"] = dq_res["risk_score"]
        output.append(rec)

    os.makedirs(os.path.dirname(os.path.abspath(dest_path)), exist_ok=True)
    with open(dest_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    logger.info(f"Exported {len(output)} MPLADS projects to {dest_path}")
    return len(output)
