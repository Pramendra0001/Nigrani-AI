"""Main API Router for Nigrani AI."""

import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_
from pydantic import BaseModel

from app.database import get_db
from app.models.models import (
    Project,
    ProjectAnalysis,
    CostAnalysis,
    DelayAnalysis,
    DataQualityAnalysis,
    DuplicateAnalysis,
    DuplicateCandidate,
    ReviewCase,
    ReviewNote,
)
from app.services.analysis_service import AnalysisService
from app.services.import_service import ImportService
from app.services.review_service import ReviewService
from app.schemas.schemas import ReviewNoteCreate, ReviewCaseUpdate, RiskWeightsUpdate
from app.config import settings

api_router = APIRouter(prefix="/api")

analysis_service = AnalysisService()
import_service = ImportService()
review_service = ReviewService()


# -------------------------------------------------------------
# 1. Executive Dashboard
# -------------------------------------------------------------
@api_router.get("/dashboard")
async def get_dashboard(
    parliament_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    project_filter = []
    if parliament_type and parliament_type.upper() != "ALL":
        project_filter.append(
            or_(
                Project.parliament_type.ilike(f"%{parliament_type}%"),
                Project.category.ilike(f"%{parliament_type}%"),
            )
        )

    # Total projects
    tot_q = select(func.count()).select_from(Project)
    for f in project_filter:
        tot_q = tot_q.where(f)
    total_projects = (await db.execute(tot_q)).scalar() or 0

    # Risk level counts
    risk_counts: Dict[str, int] = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
    for lvl in ("LOW", "MEDIUM", "HIGH", "CRITICAL"):
        lvl_q = select(func.count()).select_from(Project).where(Project.risk_level == lvl)
        for f in project_filter:
            lvl_q = lvl_q.where(f)
        c = (await db.execute(lvl_q)).scalar() or 0
        risk_counts[lvl] = c

    # Review queue cases
    rev_q = select(func.count()).select_from(ReviewCase).join(Project).where(ReviewCase.status != "RESOLVED")
    for f in project_filter:
        rev_q = rev_q.where(f)
    rev_count = (await db.execute(rev_q)).scalar() or 0

    # Anomaly counters
    cost_q = select(func.count()).select_from(ProjectAnalysis).join(Project).where(ProjectAnalysis.cost_risk_score >= 50.0)
    for f in project_filter:
        cost_q = cost_q.where(f)
    cost_anomalies = (await db.execute(cost_q)).scalar() or 0

    delay_q = select(func.count()).select_from(ProjectAnalysis).join(Project).where(ProjectAnalysis.delay_risk_score >= 50.0)
    for f in project_filter:
        delay_q = delay_q.where(f)
    delay_cases = (await db.execute(delay_q)).scalar() or 0

    dup_q = select(func.count()).select_from(ProjectAnalysis).join(Project).where(ProjectAnalysis.duplicate_risk_score >= 50.0)
    for f in project_filter:
        dup_q = dup_q.where(f)
    dup_cases = (await db.execute(dup_q)).scalar() or 0

    dq_q = select(func.count()).select_from(ProjectAnalysis).join(Project).where(ProjectAnalysis.data_quality_risk_score >= 35.0)
    for f in project_filter:
        dq_q = dq_q.where(f)
    dq_cases = (await db.execute(dq_q)).scalar() or 0

    # Category breakdown
    cat_q = (
        select(Project.category, func.count(), func.avg(Project.risk_score))
        .where(Project.category.isnot(None))
    )
    for f in project_filter:
        cat_q = cat_q.where(f)
    cat_q = cat_q.group_by(Project.category)
    cat_res = await db.execute(cat_q)
    categories = [
        {"category": r[0], "count": r[1], "avg_risk": round(r[2] or 0.0, 1)}
        for r in cat_res.all()
    ]

    # State breakdown
    state_q = (
        select(Project.state, func.count(), func.avg(Project.risk_score))
        .where(Project.state.isnot(None))
    )
    for f in project_filter:
        state_q = state_q.where(f)
    state_q = state_q.group_by(Project.state)
    state_res = await db.execute(state_q)
    states = [
        {"state": r[0], "count": r[1], "avg_risk": round(r[2] or 0.0, 1)}
        for r in state_res.all()
    ]

    # Top 10 High-Priority Projects
    hp_q = select(Project).where(Project.risk_score.isnot(None))
    for f in project_filter:
        hp_q = hp_q.where(f)
    hp_q = hp_q.order_by(desc(Project.risk_score)).limit(10)
    hp_res = await db.execute(hp_q)
    high_priority = [
        {
            "id": p.id,
            "project_id": p.project_id,
            "project_name": p.project_name,
            "category": p.category,
            "parliament_type": p.parliament_type or ("Rajya Sabha" if "Rajya" in (p.category or "") else "Lok Sabha"),
            "state": p.state,
            "district": p.district,
            "budget": p.budget,
            "actual_cost": p.actual_cost,
            "completion_percentage": p.completion_percentage,
            "risk_score": p.risk_score,
            "risk_level": p.risk_level,
        }
        for p in hp_res.scalars().all()
    ]

    return {
        "metrics": {
            "total_projects": total_projects,
            "projects_requiring_review": rev_count,
            "high_risk_count": risk_counts["HIGH"],
            "critical_risk_count": risk_counts["CRITICAL"],
            "duplicate_cases": dup_cases,
            "cost_anomalies": cost_anomalies,
            "schedule_risks": delay_cases,
            "data_quality_issues": dq_cases,
        },
        "risk_distribution": risk_counts,
        "category_distribution": categories,
        "state_distribution": states,
        "high_priority_projects": high_priority,
    }


# -------------------------------------------------------------
# 2. Projects Database & Search
# -------------------------------------------------------------
@api_router.get("/projects")
async def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    parliament_type: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = "risk_score",
    sort_order: str = "desc",
    db: AsyncSession = Depends(get_db),
):
    q = select(Project)
    count_q = select(func.count()).select_from(Project)

    filters = []
    if search:
        search_filter = or_(
            Project.project_name.ilike(f"%{search}%"),
            Project.project_id.ilike(f"%{search}%"),
            Project.description.ilike(f"%{search}%"),
        )
        filters.append(search_filter)

    if parliament_type and parliament_type.upper() != "ALL":
        filters.append(
            or_(
                Project.parliament_type.ilike(f"%{parliament_type}%"),
                Project.category.ilike(f"%{parliament_type}%"),
            )
        )
    if state and state != "ALL":
        filters.append(Project.state == state)
    if district and district != "ALL":
        filters.append(Project.district == district)
    if category and category != "ALL":
        filters.append(Project.category == category)
    if risk_level and risk_level != "ALL":
        filters.append(Project.risk_level == risk_level)
    if status and status != "ALL":
        filters.append(Project.status == status)

    for f in filters:
        q = q.where(f)
        count_q = count_q.where(f)

    total = (await db.execute(count_q)).scalar() or 0

    # Sorting
    col = getattr(Project, sort_by, Project.risk_score)
    if sort_order == "desc":
        q = q.order_by(desc(col).nullslast())
    else:
        q = q.order_by(col.asc().nullsfirst())

    q = q.offset((page - 1) * page_size).limit(page_size)
    res = await db.execute(q)
    projects = res.scalars().all()

    return {
        "projects": [
            {
                "id": p.id,
                "project_id": p.project_id,
                "project_name": p.project_name,
                "description": (p.description or "")[:140],
                "state": p.state,
                "district": p.district,
                "category": p.category,
                "parliament_type": p.parliament_type or ("Rajya Sabha" if "Rajya" in (p.category or "") else "Lok Sabha"),
                "budget": p.budget,
                "actual_cost": p.actual_cost,
                "start_date": p.start_date.isoformat() if p.start_date else None,
                "expected_end_date": p.expected_end_date.isoformat() if p.expected_end_date else None,
                "completion_percentage": p.completion_percentage,
                "status": p.status,
                "latitude": p.latitude,
                "longitude": p.longitude,
                "risk_score": p.risk_score,
                "risk_level": p.risk_level or "PENDING",
            }
            for p in projects
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@api_router.get("/projects/filters")
async def get_project_filters(db: AsyncSession = Depends(get_db)):
    states = [r[0] for r in (await db.execute(select(Project.state).where(Project.state.isnot(None)).distinct())).all()]
    districts = [r[0] for r in (await db.execute(select(Project.district).where(Project.district.isnot(None)).distinct())).all()]
    categories = [r[0] for r in (await db.execute(select(Project.category).where(Project.category.isnot(None)).distinct())).all()]

    return {
        "parliament_types": ["Lok Sabha", "Rajya Sabha"],
        "states": sorted(states),
        "districts": sorted(districts),
        "categories": sorted(categories),
        "risk_levels": ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        "statuses": ["ONGOING", "COMPLETED", "NOT_STARTED", "DELAYED"],
    }


# -------------------------------------------------------------
# 3. Project Investigation Profile (Deep Dive)
# -------------------------------------------------------------
@api_router.get("/projects/{project_id}")
async def get_project_investigation(project_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Project).where((Project.project_id == project_id) | (Project.id == project_id))
    )
    p = res.scalar_one_or_none()
    if not p:
        raise HTTPException(404, detail=f"Project not found: {project_id}")

    # Aggregated Analysis (auto-generate on demand if not yet computed)
    pa_res = await db.execute(select(ProjectAnalysis).where(ProjectAnalysis.project_id == p.id))
    pa = pa_res.scalar_one_or_none()
    if not pa:
        try:
            await analysis_service.analyze_project(db, p.project_id)
            pa = (await db.execute(select(ProjectAnalysis).where(ProjectAnalysis.project_id == p.id))).scalar_one_or_none()
        except Exception:
            pass

    # Cost Analysis
    ca_res = await db.execute(select(CostAnalysis).where(CostAnalysis.project_id == p.id))
    ca = ca_res.scalar_one_or_none()

    # Delay Analysis
    da_res = await db.execute(select(DelayAnalysis).where(DelayAnalysis.project_id == p.id))
    da = da_res.scalar_one_or_none()

    # Data Quality Analysis
    dqa_res = await db.execute(select(DataQualityAnalysis).where(DataQualityAnalysis.project_id == p.id))
    dqa = dqa_res.scalar_one_or_none()

    # Duplicate Analysis & Top Candidates
    dua_res = await db.execute(select(DuplicateAnalysis).where(DuplicateAnalysis.project_id == p.id))
    dua = dua_res.scalar_one_or_none()

    dc_res = await db.execute(
        select(DuplicateCandidate).where(DuplicateCandidate.source_project_id == p.id)
        .order_by(desc(DuplicateCandidate.combined_score))
    )
    dc_list = dc_res.scalars().all()

    candidates_formatted = []
    for c in dc_list:
        target = await db.get(Project, c.target_project_id)
        candidates_formatted.append({
            "id": c.id,
            "target_project_id": c.target_project_id,
            "target_code": target.project_id if target else "N/A",
            "target_name": target.project_name if target else "Unknown",
            "target_district": target.district if target else "N/A",
            "target_budget": target.budget if target else 0,
            "description_similarity": c.description_similarity,
            "category_similarity": c.category_similarity,
            "geographic_distance_km": c.geographic_distance_km,
            "timeline_overlap": c.timeline_overlap,
            "budget_similarity": c.budget_similarity,
            "combined_score": c.combined_score,
            "classification": c.classification,
            "evidence": json.loads(c.evidence) if c.evidence else {},
        })

    # Review case status & notes
    rc_res = await db.execute(select(ReviewCase).where(ReviewCase.project_id == p.id))
    rc = rc_res.scalar_one_or_none()
    rc_data = None
    if rc:
        notes_res = await db.execute(
            select(ReviewNote).where(ReviewNote.review_case_id == rc.id).order_by(desc(ReviewNote.created_at))
        )
        notes = [
            {
                "id": n.id,
                "author": n.author,
                "content": n.content,
                "action_taken": n.action_taken,
                "created_at": n.created_at.isoformat(),
            }
            for n in notes_res.scalars().all()
        ]
        rc_data = {
            "id": rc.id,
            "status": rc.status,
            "priority": rc.priority,
            "assigned_to": rc.assigned_to,
            "notes": notes,
        }

    return {
        "project": p.to_dict(),
        "analysis": {
            "overall_risk_score": pa.overall_risk_score if pa else p.risk_score or 0.0,
            "risk_level": pa.risk_level if pa else p.risk_level or "PENDING",
            "cost_risk_score": pa.cost_risk_score if pa else 0.0,
            "duplicate_risk_score": pa.duplicate_risk_score if pa else 0.0,
            "delay_risk_score": pa.delay_risk_score if pa else 0.0,
            "data_quality_risk_score": pa.data_quality_risk_score if pa else 0.0,
            "ai_summary": json.loads(pa.ai_summary) if pa and pa.ai_summary else None,
            "status": pa.analysis_status if pa else "UNANALYZED",
        },
        "cost_analysis": {
            "project_cost": ca.project_cost if ca else p.actual_cost or p.budget or 0,
            "comparable_median": ca.comparable_median if ca else None,
            "comparable_mean": ca.comparable_mean if ca else None,
            "comparable_std": ca.comparable_std if ca else None,
            "cost_deviation_percentage": ca.cost_deviation_percentage if ca else None,
            "percentile_rank": ca.percentile_rank if ca else None,
            "budget_deviation_percentage": ca.budget_deviation_percentage if ca else None,
            "comparable_count": ca.comparable_count if ca else 0,
            "risk_score": ca.risk_score if ca else 0.0,
            "evidence": json.loads(ca.evidence) if ca and ca.evidence else {},
            "ai_explanation": json.loads(ca.ai_explanation) if ca and ca.ai_explanation else {},
        },
        "delay_analysis": {
            "planned_duration_days": da.planned_duration_days if da else None,
            "elapsed_days": da.elapsed_days if da else None,
            "time_elapsed_percentage": da.time_elapsed_percentage if da else None,
            "completion_percentage": da.completion_percentage if da else p.completion_percentage,
            "expected_completion": da.expected_completion if da else None,
            "schedule_deviation": da.schedule_deviation if da else None,
            "delay_classification": da.delay_classification if da else "INSUFFICIENT_INFORMATION",
            "risk_score": da.risk_score if da else 0.0,
            "evidence": json.loads(da.evidence) if da and da.evidence else {},
            "ai_explanation": json.loads(da.ai_explanation) if da and da.ai_explanation else {},
        },
        "data_quality_analysis": {
            "issues": json.loads(dqa.issues) if dqa and dqa.issues else [],
            "total_issues": dqa.total_issues if dqa else 0,
            "critical_issues": dqa.critical_issues if dqa else 0,
            "completeness_score": dqa.completeness_score if dqa else 100.0,
            "risk_score": dqa.risk_score if dqa else 0.0,
            "evidence": json.loads(dqa.evidence) if dqa and dqa.evidence else {},
        },
        "duplicate_analysis": {
            "top_candidates": candidates_formatted,
            "candidates_count": len(candidates_formatted),
            "highest_similarity_score": dua.highest_similarity_score if dua else (candidates_formatted[0]["combined_score"] if candidates_formatted else 0.0),
            "risk_score": dua.risk_score if dua else 0.0,
            "ai_explanation": json.loads(dua.ai_explanation) if dua and dua.ai_explanation else {},
        },
        "review_case": rc_data,
    }


# -------------------------------------------------------------
# 4. Trigger Analysis
# -------------------------------------------------------------
@api_router.post("/projects/{project_id}/analyze")
async def run_project_analysis(project_id: str, db: AsyncSession = Depends(get_db)):
    try:
        res = await analysis_service.analyze_project(db, project_id)
        return res
    except ValueError as e:
        raise HTTPException(404, detail=str(e))
    except Exception as e:
        raise HTTPException(500, detail=f"Analysis pipeline error: {str(e)}")


@api_router.post("/projects/analyze-batch")
async def run_batch_analysis(db: AsyncSession = Depends(get_db)):
    try:
        res = await analysis_service.analyze_batch(db)
        return res
    except Exception as e:
        raise HTTPException(500, detail=f"Batch analysis error: {str(e)}")


# -------------------------------------------------------------
# 5. Human Review Workflow Queue
# -------------------------------------------------------------
@api_router.get("/review-queue")
async def get_review_queue(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await review_service.get_queue(db, status, priority, page, page_size)


@api_router.patch("/review-cases/{case_id}")
async def update_review_case(case_id: str, update: ReviewCaseUpdate, db: AsyncSession = Depends(get_db)):
    try:
        return await review_service.update_status(db, case_id, update.model_dump(exclude_none=True))
    except ValueError as e:
        raise HTTPException(404, detail=str(e))


@api_router.post("/review-cases/{case_id}/notes")
async def add_review_note(case_id: str, note: ReviewNoteCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await review_service.add_note(db, case_id, note.author, note.content, note.action_taken)
    except ValueError as e:
        raise HTTPException(404, detail=str(e))


@api_router.get("/review-cases/{case_id}/notes")
async def get_review_notes(case_id: str, db: AsyncSession = Depends(get_db)):
    return await review_service.get_notes(db, case_id)


# -------------------------------------------------------------
# 6. Data Upload & Column Mapping
# -------------------------------------------------------------
_upload_buffer: Dict[str, Dict[str, Any]] = {}


@api_router.post("/data/upload")
async def upload_dataset_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(400, "Empty filename provided.")

    content = await file.read()
    try:
        content_str = content.decode("utf-8")
    except UnicodeDecodeError:
        content_str = content.decode("latin-1")

    headers, records = import_service.parse_csv(content_str)
    if not headers or not records:
        raise HTTPException(400, "Uploaded file contains no valid tabular data rows.")

    suggested = import_service.suggest_mapping(headers)
    preview = import_service.validate_and_preview(records, suggested)

    import_token = f"tok_{len(_upload_buffer)+1}"
    _upload_buffer[import_token] = {
        "filename": file.filename,
        "records": records,
    }

    return {
        "import_token": import_token,
        "filename": file.filename,
        "headers": headers,
        "standard_fields": import_service.STANDARD_FIELDS,
        "suggested_mapping": suggested,
        "preview": preview,
    }


class ImportCommitRequest(BaseModel):
    import_token: str
    column_mapping: Dict[str, str]


@api_router.post("/data/import")
async def commit_dataset_import(req: ImportCommitRequest, db: AsyncSession = Depends(get_db)):
    buf = _upload_buffer.get(req.import_token)
    if not buf:
        raise HTTPException(404, "Upload session expired or invalid token. Please re-upload.")

    res = await import_service.execute_import(
        db=db,
        filename=buf["filename"],
        records=buf["records"],
        mapping=req.column_mapping,
    )

    _upload_buffer.pop(req.import_token, None)
    return res


@api_router.post("/data/mplads/reload")
async def reload_mplads_dataset(db: AsyncSession = Depends(get_db)):
    """Reloads the official MPLADS national dataset and executes batch anomaly screening."""
    from app.utils.mplads_loader import seed_mplads_database
    count = await seed_mplads_database(db, force_reload=True)
    return {
        "status": "success",
        "dataset": "MPLADS_Nigrani_AI_Data_Package",
        "total_records": count,
        "message": f"Successfully reloaded and screened {count} official MPLADS parliamentary project portfolios.",
    }


# -------------------------------------------------------------
# 7. Analytics & Settings
# -------------------------------------------------------------
@api_router.get("/analytics")
async def get_system_analytics(
    parliament_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    p_filter = []
    if parliament_type and parliament_type.upper() != "ALL":
        p_filter.append(
            or_(
                Project.parliament_type.ilike(f"%{parliament_type}%"),
                Project.category.ilike(f"%{parliament_type}%"),
            )
        )

    cat_q = select(Project.category, func.avg(Project.risk_score), func.count()).where(Project.risk_score.isnot(None))
    for f in p_filter:
        cat_q = cat_q.where(f)
    cat_q = cat_q.group_by(Project.category)
    cat_res = await db.execute(cat_q)
    category_risks = [
        {"category": r[0], "avg_risk": round(r[1] or 0.0, 1), "project_count": r[2]}
        for r in cat_res.all()
    ]

    state_q = select(Project.state, func.avg(Project.risk_score), func.count()).where(Project.risk_score.isnot(None))
    for f in p_filter:
        state_q = state_q.where(f)
    state_q = state_q.group_by(Project.state)
    state_res = await db.execute(state_q)
    state_risks = [
        {"state": r[0], "avg_risk": round(r[1] or 0.0, 1), "project_count": r[2]}
        for r in state_res.all()
    ]

    rev_stats = {}
    for st in ("NEW", "UNDER_REVIEW", "ADDITIONAL_INFORMATION_REQUIRED", "RESOLVED"):
        q_st = select(func.count()).select_from(ReviewCase).join(Project).where(ReviewCase.status == st)
        for f in p_filter:
            q_st = q_st.where(f)
        c = (await db.execute(q_st)).scalar() or 0
        rev_stats[st] = c

    return {
        "category_risks": category_risks,
        "state_risks": state_risks,
        "review_stats": rev_stats,
    }


@api_router.get("/settings/risk-weights")
async def get_risk_weights():
    return {
        "cost": settings.COST_RISK_WEIGHT,
        "duplicate": settings.DUPLICATE_RISK_WEIGHT,
        "delay": settings.DELAY_RISK_WEIGHT,
        "data_quality": settings.DATA_QUALITY_RISK_WEIGHT,
    }


@api_router.put("/settings/risk-weights")
async def update_risk_weights(req: RiskWeightsUpdate):
    tot = req.cost + req.duplicate + req.delay + req.data_quality
    if abs(tot - 1.0) > 0.01:
        raise HTTPException(400, f"Weights must sum to 1.0 (currently {tot:.2f}).")
    settings.COST_RISK_WEIGHT = req.cost
    settings.DUPLICATE_RISK_WEIGHT = req.duplicate
    settings.DELAY_RISK_WEIGHT = req.delay
    settings.DATA_QUALITY_RISK_WEIGHT = req.data_quality
    return {"status": "updated", "weights": req.model_dump()}


@api_router.get("/system/status")
async def get_system_status(db: AsyncSession = Depends(get_db)):
    tot = (await db.execute(select(func.count()).select_from(Project))).scalar() or 0
    analyzed = (await db.execute(select(func.count()).select_from(ProjectAnalysis))).scalar() or 0
    return {
        "platform": "Nigrani AI — Public Project Intelligence",
        "version": "1.0.0",
        "database": "SQLite (aiosqlite async)",
        "ai_provider": settings.AI_PROVIDER,
        "demo_mode": settings.DEMO_MODE,
        "total_projects": tot,
        "total_analyzed": analyzed,
        "status": "OPERATIONAL",
    }
