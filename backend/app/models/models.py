"""SQLAlchemy models for Nigrani AI."""

import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, Text, Float, Integer, Date, DateTime, ForeignKey, Index, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Project(Base):
    """Core public infrastructure project entity."""

    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    project_name: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    budget: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # in Lakhs
    actual_cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # in Lakhs
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    expected_end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    completion_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(50), default="ONGOING")
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    embedding: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    risk_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    risk_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # LOW, MEDIUM, HIGH, CRITICAL
    data_import_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=datetime.utcnow, nullable=True)

    # Relationships
    analysis: Mapped[Optional["ProjectAnalysis"]] = relationship(
        "ProjectAnalysis", back_populates="project", uselist=False, cascade="all, delete-orphan"
    )
    cost_analysis: Mapped[Optional["CostAnalysis"]] = relationship(
        "CostAnalysis", back_populates="project", uselist=False, cascade="all, delete-orphan"
    )
    delay_analysis: Mapped[Optional["DelayAnalysis"]] = relationship(
        "DelayAnalysis", back_populates="project", uselist=False, cascade="all, delete-orphan"
    )
    data_quality_analysis: Mapped[Optional["DataQualityAnalysis"]] = relationship(
        "DataQualityAnalysis", back_populates="project", uselist=False, cascade="all, delete-orphan"
    )
    review_case: Mapped[Optional["ReviewCase"]] = relationship(
        "ReviewCase", back_populates="project", uselist=False, cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_projects_category_district", "category", "district"),
        Index("ix_projects_risk_level", "risk_level"),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "project_id": self.project_id,
            "project_name": self.project_name,
            "description": self.description,
            "state": self.state,
            "district": self.district,
            "category": self.category,
            "budget": self.budget,
            "actual_cost": self.actual_cost,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "expected_end_date": self.expected_end_date.isoformat() if self.expected_end_date else None,
            "completion_percentage": self.completion_percentage,
            "status": self.status,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
        }


class ProjectRawData(Base):
    __tablename__ = "project_raw_data"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), nullable=False)
    raw_data: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ProjectAnalysis(Base):
    __tablename__ = "project_analyses"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), unique=True, nullable=False)
    cost_risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    duplicate_risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    delay_risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    data_quality_risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    overall_risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    risk_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    ai_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    analysis_status: Mapped[str] = mapped_column(String(20), default="COMPLETED")
    analyzed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="analysis")


class CostAnalysis(Base):
    __tablename__ = "cost_analyses"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), unique=True, nullable=False)
    project_cost: Mapped[float] = mapped_column(Float, default=0.0)
    comparable_median: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    comparable_mean: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    comparable_std: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    cost_deviation_percentage: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    percentile_rank: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    budget_deviation_percentage: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    comparable_count: Mapped[int] = mapped_column(Integer, default=0)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    evidence: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="cost_analysis")


class DelayAnalysis(Base):
    __tablename__ = "delay_analyses"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), unique=True, nullable=False)
    planned_duration_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    elapsed_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    time_elapsed_percentage: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    completion_percentage: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    expected_completion: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    schedule_deviation: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    delay_classification: Mapped[str] = mapped_column(String(30), default="INSUFFICIENT_INFORMATION")
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    evidence: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="delay_analysis")


class DataQualityAnalysis(Base):
    __tablename__ = "data_quality_analyses"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), unique=True, nullable=False)
    issues: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    total_issues: Mapped[int] = mapped_column(Integer, default=0)
    critical_issues: Mapped[int] = mapped_column(Integer, default=0)
    completeness_score: Mapped[float] = mapped_column(Float, default=100.0)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    evidence: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="data_quality_analysis")


class DuplicateCandidate(Base):
    __tablename__ = "duplicate_candidates"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    target_project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    description_similarity: Mapped[float] = mapped_column(Float, default=0.0)
    category_similarity: Mapped[float] = mapped_column(Float, default=0.0)
    geographic_distance_km: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    timeline_overlap: Mapped[float] = mapped_column(Float, default=0.0)
    budget_similarity: Mapped[float] = mapped_column(Float, default=0.0)
    combined_score: Mapped[float] = mapped_column(Float, default=0.0)
    classification: Mapped[str] = mapped_column(String(35), default="DIFFERENT_PROJECT")
    evidence: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class DuplicateAnalysis(Base):
    __tablename__ = "duplicate_analyses"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), unique=True, nullable=False)
    top_candidates_count: Mapped[int] = mapped_column(Integer, default=0)
    highest_similarity_score: Mapped[float] = mapped_column(Float, default=0.0)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    ai_explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ReviewCase(Base):
    __tablename__ = "review_cases"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), unique=True, nullable=False)
    status: Mapped[str] = mapped_column(String(35), default="NEW")  # NEW, UNDER_REVIEW, ADDITIONAL_INFO_REQUIRED, RESOLVED
    priority: Mapped[str] = mapped_column(String(20), default="MEDIUM")
    assigned_to: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=datetime.utcnow, nullable=True)

    project: Mapped["Project"] = relationship("Project", back_populates="review_case")
    notes: Mapped[List["ReviewNote"]] = relationship("ReviewNote", back_populates="review_case", cascade="all, delete-orphan")


class ReviewNote(Base):
    __tablename__ = "review_notes"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    review_case_id: Mapped[str] = mapped_column(String(36), ForeignKey("review_cases.id"), nullable=False)
    author: Mapped[str] = mapped_column(String(100), default="Government Analyst")
    content: Mapped[str] = mapped_column(Text, nullable=False)
    action_taken: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    review_case: Mapped["ReviewCase"] = relationship("ReviewCase", back_populates="notes")


class DataImport(Base):
    __tablename__ = "data_imports"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(10), nullable=False)
    total_records: Mapped[int] = mapped_column(Integer, default=0)
    imported_records: Mapped[int] = mapped_column(Integer, default=0)
    failed_records: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="COMPLETED")
    column_mapping: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(100), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    performed_by: Mapped[str] = mapped_column(String(100), default="System")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SystemSettings(Base):
    __tablename__ = "system_settings"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=datetime.utcnow, nullable=True)
