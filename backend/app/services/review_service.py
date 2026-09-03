"""Human review workflow service."""

from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.models.models import ReviewCase, ReviewNote, Project


class ReviewService:
    """Manages reviewer queue, priority routing, status updates, and audit notes."""

    async def get_queue(
        self,
        db: AsyncSession,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        page: int = 1,
        page_size: int = 25,
    ) -> Dict[str, Any]:
        q = select(ReviewCase).join(Project, ReviewCase.project_id == Project.id)

        if status and status != "ALL":
            q = q.where(ReviewCase.status == status)
        if priority and priority != "ALL":
            q = q.where(ReviewCase.priority == priority)

        # Count
        count_q = select(func.count()).select_from(q.subquery())
        total = (await db.execute(count_q)).scalar() or 0

        # Sort by project risk score descending
        q = q.order_by(desc(Project.risk_score))
        q = q.offset((page - 1) * page_size).limit(page_size)

        res = await db.execute(q)
        cases = res.scalars().all()

        results = []
        for c in cases:
            p = await db.get(Project, c.project_id)
            notes_count = (await db.execute(
                select(func.count()).select_from(ReviewNote).where(ReviewNote.review_case_id == c.id)
            )).scalar() or 0

            results.append({
                "id": c.id,
                "project_id": c.project_id,
                "project_code": p.project_id if p else "N/A",
                "project_name": p.project_name if p else "Unknown",
                "category": p.category if p else "N/A",
                "state": p.state if p else "N/A",
                "district": p.district if p else "N/A",
                "budget": p.budget if p else 0,
                "risk_score": p.risk_score if p else 0.0,
                "risk_level": p.risk_level if p else "LOW",
                "status": c.status,
                "priority": c.priority,
                "assigned_to": c.assigned_to or "Unassigned",
                "notes_count": notes_count,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            })

        return {
            "cases": results,
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    async def update_status(self, db: AsyncSession, case_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        c = await db.get(ReviewCase, case_id)
        if not c:
            raise ValueError(f"Review case not found: {case_id}")

        if "status" in update_data and update_data["status"]:
            c.status = update_data["status"]
        if "priority" in update_data and update_data["priority"]:
            c.priority = update_data["priority"]
        if "assigned_to" in update_data:
            c.assigned_to = update_data["assigned_to"]

        await db.flush()
        await db.commit()
        return {"id": c.id, "status": c.status, "priority": c.priority, "assigned_to": c.assigned_to}

    async def add_note(self, db: AsyncSession, case_id: str, author: str, content: str, action: Optional[str] = None) -> Dict[str, Any]:
        c = await db.get(ReviewCase, case_id)
        if not c:
            raise ValueError(f"Review case not found: {case_id}")

        note = ReviewNote(
            review_case_id=case_id,
            author=author or "Analyst",
            content=content,
            action_taken=action,
        )
        db.add(note)
        await db.flush()
        await db.commit()
        return {
            "id": note.id,
            "author": note.author,
            "content": note.content,
            "action_taken": note.action_taken,
            "created_at": note.created_at.isoformat(),
        }

    async def get_notes(self, db: AsyncSession, case_id: str) -> List[Dict[str, Any]]:
        res = await db.execute(
            select(ReviewNote).where(ReviewNote.review_case_id == case_id).order_by(desc(ReviewNote.created_at))
        )
        notes = res.scalars().all()
        return [
            {
                "id": n.id,
                "author": n.author,
                "content": n.content,
                "action_taken": n.action_taken,
                "created_at": n.created_at.isoformat(),
            }
            for n in notes
        ]
