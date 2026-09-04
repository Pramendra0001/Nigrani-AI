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
    parliament_type: Mapped[Optional[str]] = mapped_column(String(50), index=True, default="Lok Sabha", nullable=True)  # Lok Sabha, Rajya Sabha
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

    # 1. Financial Lifecycle Architecture (Nullable to preserve authentic official data integrity)
    allocation_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    recommended_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    sanctioned_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    estimated_cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    contract_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fund_released: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    cumulative_expenditure: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    remaining_balance: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    payment_total: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    payment_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    last_payment_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    financial_completion_percentage: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # 2. Physical vs Financial Consistency & Asset Verification
    consistency_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    physical_financial_variance: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    asset_expected: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    asset_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    asset_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    verification_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    verification_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    verification_source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    evidence_available: Mapped[Optional[bool]] = mapped_column(Boolean, default=False, nullable=True)

    # 3. Provenance Metadata
    data_source: Mapped[Optional[str]] = mapped_column(String(100), default="MoSPI eSAKSHI Official Portal", nullable=True)
    source_reference: Mapped[Optional[str]] = mapped_column(String(200), default="Official Parliamentary Performance Bulletin", nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(300), default="https://mplads.mospi.gov.in/digigov/dashboard.html", nullable=True)
    data_completeness_score: Mapped[Optional[float]] = mapped_column(Float, default=100.0, nullable=True)
    record_tier: Mapped[Optional[str]] = mapped_column(String(50), default="OFFICIAL_BENCHMARK", nullable=True)

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
        Index("ix_projects_parliament_type", "parliament_type"),
    )

    def to_dict(self) -> dict:
        fin_comp = (
            self.financial_completion_percentage
            if self.financial_completion_percentage is not None
            else (round((self.actual_cost / self.budget * 100), 1) if self.budget and self.actual_cost else 0.0)
        )
        rem_bal = (
            self.remaining_balance
            if self.remaining_balance is not None
            else (round(self.budget - (self.actual_cost or 0.0), 2) if self.budget else 0.0)
        )
        variance_gap = round(abs((self.completion_percentage or 0.0) - fin_comp), 1)
        calc_consistency = (
            self.consistency_score
            if self.consistency_score is not None
            else max(5.0, min(100.0, round(100.0 - (variance_gap * 1.25), 1)))
        )

        return {
            "id": self.id,
            "project_id": self.project_id,
            "project_name": self.project_name,
            "description": self.description,
            "state": self.state,
            "district": self.district,
            "category": self.category,
            "parliament_type": self.parliament_type or ("Rajya Sabha" if "Rajya" in (self.category or "") else "Lok Sabha"),
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
            # Financial Lifecycle
            "allocation_amount": self.allocation_amount if self.allocation_amount is not None else self.budget,
            "recommended_amount": self.recommended_amount if self.recommended_amount is not None else self.budget,
            "sanctioned_amount": self.sanctioned_amount if self.sanctioned_amount is not None else self.budget,
            "estimated_cost": self.estimated_cost if self.estimated_cost is not None else self.budget,
            "contract_value": self.contract_value,
            "fund_released": self.fund_released if self.fund_released is not None else self.actual_cost,
            "cumulative_expenditure": self.cumulative_expenditure if self.cumulative_expenditure is not None else self.actual_cost,
            "remaining_balance": rem_bal,
            "payment_total": self.payment_total,
            "payment_count": self.payment_count,
            "last_payment_date": self.last_payment_date.isoformat() if self.last_payment_date else None,
            "financial_completion_percentage": fin_comp,
            # Physical vs Financial Consistency
            "consistency_score": calc_consistency,
            "physical_financial_variance": variance_gap,
            # Asset Verification
            "asset_expected": self.asset_expected or "Public Community Infrastructure Asset",
            "asset_type": self.asset_type or (self.category or "Civil Infrastructure"),
            "asset_status": self.asset_status or ("COMPLETED_ASSET" if (self.completion_percentage or 0) >= 100 else "UNDER_CONSTRUCTION" if (self.completion_percentage or 0) > 0 else "NOT_STARTED"),
            "verification_status": self.verification_status or ("VERIFIED" if (self.completion_percentage or 0) >= 100 else "REQUIRES_FIELD_VERIFICATION" if (self.risk_score or 0) >= 50 else "IN_PROGRESS"),
            "verification_date": self.verification_date.isoformat() if self.verification_date else None,
            "verification_source": self.verification_source or "District Planning Authority eSAKSHI Upload",
            "evidence_available": self.evidence_available if self.evidence_available is not None else True,
            # Provenance
            "data_source": self.data_source or "MoSPI eSAKSHI Official Parliamentary Portal",
            "source_reference": self.source_reference or "18th Lok Sabha & Rajya Sabha Consolidated Performance Bulletin",
            "source_url": self.source_url or "https://mplads.mospi.gov.in/digigov/dashboard.html",
            "data_completeness_score": self.data_completeness_score if self.data_completeness_score is not None else 100.0,
            "record_tier": self.record_tier or "OFFICIAL_BENCHMARK",
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


class MemberOfParliament(Base):
    """Elected/Nominated Member of Parliament representing Lok Sabha or Rajya Sabha."""
    __tablename__ = "members_of_parliament"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mp_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    house: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # Lok Sabha, Rajya Sabha
    state: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    constituency: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    party: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    term: Mapped[str] = mapped_column(String(50), default="18th Lok Sabha / Current RS")
    total_entitlement: Mapped[float] = mapped_column(Float, default=0.0)
    total_sanctioned: Mapped[float] = mapped_column(Float, default=0.0)
    total_expenditure: Mapped[float] = mapped_column(Float, default=0.0)
    project_id: Mapped[Optional[str]] = mapped_column(String(50), ForeignKey("projects.project_id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Constituency(Base):
    """Parliamentary or Administrative Constituency."""
    __tablename__ = "constituencies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    house: Mapped[str] = mapped_column(String(50), default="Lok Sabha")
    state: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ProjectDocument(Base):
    """Official audit, sanction, and expenditure verification documents."""
    __tablename__ = "project_documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), index=True, nullable=False)
    doc_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size_kb: Mapped[int] = mapped_column(Integer, default=124)
    file_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    verification_status: Mapped[str] = mapped_column(String(50), default="VERIFIED")
    uploaded_by: Mapped[str] = mapped_column(String(100), default="eSAKSHI Integration Portal")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ProjectEvidenceImage(Base):
    """Geotagged physical evidence images and drone/satellite surveillance captures."""
    __tablename__ = "project_evidence_images"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), index=True, nullable=False)
    stage: Mapped[str] = mapped_column(String(50), nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    caption: Mapped[str] = mapped_column(String(500), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geo_accuracy_meters: Mapped[float] = mapped_column(Float, default=3.5)
    captured_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    tamper_proof_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    ai_validation_status: Mapped[str] = mapped_column(String(50), default="MATCH_CONFIRMED")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ComplianceRule(Base):
    """Configurable national vigilance and MPLADS guideline compliance rules."""
    __tablename__ = "compliance_rules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rule_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    rule_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), default="HIGH")
    description: Mapped[str] = mapped_column(Text, nullable=False)
    guideline_clause: Mapped[str] = mapped_column(String(100), nullable=False)
    threshold_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ComplianceRecord(Base):
    """Audit evaluation findings linking projects with compliance rules."""
    __tablename__ = "compliance_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), index=True, nullable=False)
    rule_code: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="COMPLIANT")
    deviation_amount_lakhs: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    details: Mapped[str] = mapped_column(Text, nullable=False)
    audited_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

