"""Analysis orchestration service."""

import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.models import (
    Project,
    ProjectAnalysis,
    CostAnalysis,
    DelayAnalysis,
    DataQualityAnalysis,
    DuplicateCandidate,
    DuplicateAnalysis,
    ReviewCase,
)
from app.engines import (
    CostEngine,
    DelayEngine,
    DataQualityEngine,
    DuplicateEngine,
    RiskEngine,
    ConsistencyEngine,
    PaymentEngine,
)
from app.ai.mock_provider import MockAIProvider
from app.config import settings

logger = logging.getLogger(__name__)


class AnalysisService:
    """Orchestrates computational engines, statistical baselines, AI explanations, and review queuing."""

    def __init__(self):
        self.cost_engine = CostEngine()
        self.delay_engine = DelayEngine()
        self.dq_engine = DataQualityEngine()
        self.duplicate_engine = DuplicateEngine()
        self.risk_engine = RiskEngine()
        self.consistency_engine = ConsistencyEngine()
        self.payment_engine = PaymentEngine()
        self.ai_provider = MockAIProvider()

    async def analyze_project(self, db: AsyncSession, project_id: str) -> Dict[str, Any]:
        """Runs the complete intelligence pipeline on an individual project."""
        # Query project
        res = await db.execute(
            select(Project).where((Project.project_id == project_id) | (Project.id == project_id))
        )
        project = res.scalar_one_or_none()
        if not project:
            raise ValueError(f"Project not found: {project_id}")

        proj_dict = project.to_dict()

        # Query all projects for comparables & deduplication
        all_res = await db.execute(select(Project))
        all_projects = [p.to_dict() for p in all_res.scalars().all()]

        # 1. Cost Analysis Engine
        comparables = self.cost_engine.find_comparable_projects(proj_dict, all_projects)
        cost_res = self.cost_engine.analyze(proj_dict, comparables)

        # 2. Delay Analysis Engine
        delay_res = self.delay_engine.analyze(proj_dict)

        # 3. Data Quality Engine
        dq_res = self.dq_engine.analyze(proj_dict)

        # 4. Duplicate Intelligence Engine
        dup_candidates = self.duplicate_engine.find_candidates(proj_dict, all_projects, top_k=5)
        dup_risk = self.duplicate_engine.calculate_risk_score(dup_candidates)

        # 5. Deterministic Risk Scoring
        risk_res = self.risk_engine.calculate(
            cost_risk=cost_res["risk_score"],
            duplicate_risk=dup_risk,
            delay_risk=delay_res["risk_score"],
            dq_risk=dq_res["risk_score"],
        )

        overall_score = risk_res["overall_risk_score"]
        risk_level = risk_res["risk_level"]

        # 6. AI Explanations & Synthesis
        cost_ai = await self.ai_provider.explain_cost_anomaly(proj_dict, cost_res)
        dup_ai = await self.ai_provider.explain_duplicates(proj_dict, dup_candidates)
        delay_ai = await self.ai_provider.explain_delay(proj_dict, delay_res)
        summary_ai = await self.ai_provider.generate_investigation_summary(
            project=proj_dict,
            cost_data=cost_res,
            duplicate_data={"risk_score": dup_risk, "candidates": dup_candidates},
            delay_data=delay_res,
            dq_data=dq_res,
            risk_score=overall_score,
            risk_level=risk_level,
        )

        # 7. Update Database Entities
        project.risk_score = overall_score
        project.risk_level = risk_level
        project.updated_at = datetime.utcnow()

        # Clear prior analysis entities if any
        await db.execute(delete(ProjectAnalysis).where(ProjectAnalysis.project_id == project.id))
        await db.execute(delete(CostAnalysis).where(CostAnalysis.project_id == project.id))
        await db.execute(delete(DelayAnalysis).where(DelayAnalysis.project_id == project.id))
        await db.execute(delete(DataQualityAnalysis).where(DataQualityAnalysis.project_id == project.id))
        await db.execute(delete(DuplicateAnalysis).where(DuplicateAnalysis.project_id == project.id))
        await db.execute(delete(DuplicateCandidate).where(DuplicateCandidate.source_project_id == project.id))

        # ProjectAnalysis
        pa = ProjectAnalysis(
            project_id=project.id,
            cost_risk_score=cost_res["risk_score"],
            duplicate_risk_score=dup_risk,
            delay_risk_score=delay_res["risk_score"],
            data_quality_risk_score=dq_res["risk_score"],
            overall_risk_score=overall_score,
            risk_level=risk_level,
            ai_summary=json.dumps(summary_ai),
            analysis_status="COMPLETED",
            analyzed_at=datetime.utcnow(),
        )
        db.add(pa)

        # CostAnalysis
        ca = CostAnalysis(
            project_id=project.id,
            project_cost=cost_res["project_cost"],
            comparable_median=cost_res["comparable_median"],
            comparable_mean=cost_res["comparable_mean"],
            comparable_std=cost_res["comparable_std"],
            cost_deviation_percentage=cost_res["cost_deviation_percentage"],
            percentile_rank=cost_res["percentile_rank"],
            budget_deviation_percentage=cost_res["budget_deviation_percentage"],
            comparable_count=cost_res["comparable_count"],
            risk_score=cost_res["risk_score"],
            evidence=json.dumps(cost_res["evidence"]),
            ai_explanation=json.dumps(cost_ai),
        )
        db.add(ca)

        # DelayAnalysis
        da = DelayAnalysis(
            project_id=project.id,
            planned_duration_days=delay_res["planned_duration_days"],
            elapsed_days=delay_res["elapsed_days"],
            time_elapsed_percentage=delay_res["time_elapsed_percentage"],
            completion_percentage=delay_res["completion_percentage"],
            expected_completion=delay_res["expected_completion"],
            schedule_deviation=delay_res["schedule_deviation"],
            delay_classification=delay_res["delay_classification"],
            risk_score=delay_res["risk_score"],
            evidence=json.dumps(delay_res["evidence"]),
            ai_explanation=json.dumps(delay_ai),
        )
        db.add(da)

        # DataQualityAnalysis
        dqa = DataQualityAnalysis(
            project_id=project.id,
            issues=json.dumps(dq_res["issues"]),
            total_issues=dq_res["total_issues"],
            critical_issues=dq_res["critical_issues"],
            completeness_score=dq_res["completeness_score"],
            risk_score=dq_res["risk_score"],
            evidence=json.dumps(dq_res["evidence"]),
        )
        db.add(dqa)

        # DuplicateAnalysis
        dua = DuplicateAnalysis(
            project_id=project.id,
            top_candidates_count=len(dup_candidates),
            highest_similarity_score=dup_candidates[0]["combined_score"] if dup_candidates else 0.0,
            risk_score=dup_risk,
            ai_explanation=json.dumps(dup_ai),
        )
        db.add(dua)

        # DuplicateCandidates
        for cand in dup_candidates:
            dc = DuplicateCandidate(
                source_project_id=project.id,
                target_project_id=cand["target_project_id"],
                description_similarity=cand["description_similarity"],
                category_similarity=cand["category_similarity"],
                geographic_distance_km=cand["geographic_distance_km"],
                timeline_overlap=cand["timeline_overlap"],
                budget_similarity=cand["budget_similarity"],
                combined_score=cand["combined_score"],
                classification=cand["classification"],
                evidence=json.dumps(cand["evidence"]),
            )
            db.add(dc)

        # Review queue integration: Create review case if risk >= MEDIUM
        if risk_level in ("MEDIUM", "HIGH", "CRITICAL"):
            rc_res = await db.execute(select(ReviewCase).where(ReviewCase.project_id == project.id))
            existing_rc = rc_res.scalar_one_or_none()
            if not existing_rc:
                new_rc = ReviewCase(
                    project_id=project.id,
                    status="NEW",
                    priority=risk_level,
                )
                db.add(new_rc)

        await db.flush()
        await db.commit()

        return {
            "project_id": project.project_id,
            "overall_risk_score": overall_score,
            "risk_level": risk_level,
            "component_scores": risk_res["component_scores"],
            "ai_summary": summary_ai,
        }

    async def analyze_batch(self, db: AsyncSession, project_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """Analyzes all or specified projects in batch."""
        if project_ids:
            res = await db.execute(select(Project).where(Project.project_id.in_(project_ids)))
        else:
            res = await db.execute(select(Project))

        projects = res.scalars().all()
        total = len(projects)
        completed = 0
        errors = 0

        # Load all project dicts once for speed
        all_dicts = [p.to_dict() for p in projects]

        # Preload existing analysis and review cases to prevent N+1 queries and UNIQUE constraint collisions
        pa_res = await db.execute(select(ProjectAnalysis))
        pa_map = {pa.project_id: pa for pa in pa_res.scalars().all()}

        rc_res = await db.execute(select(ReviewCase))
        rc_map = {rc.project_id: rc for rc in rc_res.scalars().all()}

        for p in projects:
            try:
                p_dict = p.to_dict()
                comparables = self.cost_engine.find_comparable_projects(p_dict, all_dicts)
                cost_res = self.cost_engine.analyze(p_dict, comparables)
                delay_res = self.delay_engine.analyze(p_dict)
                dq_res = self.dq_engine.analyze(p_dict)
                dup_candidates = self.duplicate_engine.find_candidates(p_dict, all_dicts, top_k=3)
                dup_risk = self.duplicate_engine.calculate_risk_score(dup_candidates)

                risk_res = self.risk_engine.calculate(
                    cost_risk=cost_res["risk_score"],
                    duplicate_risk=dup_risk,
                    delay_risk=delay_res["risk_score"],
                    dq_risk=dq_res["risk_score"],
                )

                score = risk_res["overall_risk_score"]
                level = risk_res["risk_level"]

                p.risk_score = score
                p.risk_level = level

                # Create or update ProjectAnalysis entity
                existing_pa = pa_map.get(p.id)
                if existing_pa:
                    existing_pa.cost_risk_score = cost_res["risk_score"]
                    existing_pa.duplicate_risk_score = dup_risk
                    existing_pa.delay_risk_score = delay_res["risk_score"]
                    existing_pa.data_quality_risk_score = dq_res["risk_score"]
                    existing_pa.overall_risk_score = score
                    existing_pa.risk_level = level
                    existing_pa.analyzed_at = datetime.utcnow()
                else:
                    new_pa = ProjectAnalysis(
                        project_id=p.id,
                        cost_risk_score=cost_res["risk_score"],
                        duplicate_risk_score=dup_risk,
                        delay_risk_score=delay_res["risk_score"],
                        data_quality_risk_score=dq_res["risk_score"],
                        overall_risk_score=score,
                        risk_level=level,
                        analysis_status="COMPLETED",
                        analyzed_at=datetime.utcnow(),
                    )
                    db.add(new_pa)
                    pa_map[p.id] = new_pa

                # Check ReviewCase
                if level in ("MEDIUM", "HIGH", "CRITICAL"):
                    existing_rc = rc_map.get(p.id)
                    if not existing_rc:
                        new_rc = ReviewCase(project_id=p.id, status="NEW", priority=level)
                        db.add(new_rc)
                        rc_map[p.id] = new_rc
                    else:
                        existing_rc.priority = level

                completed += 1
            except Exception as e:
                logger.error(f"Error analyzing project {p.project_id}: {e}")
                errors += 1

        await db.flush()
        await db.commit()
        return {"total": total, "completed": completed, "errors": errors}
