"""Pydantic schemas for Nigrani AI API."""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime


class ProjectBase(BaseModel):
    project_id: str
    project_name: str
    description: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    category: Optional[str] = None
    budget: Optional[float] = None
    actual_cost: Optional[float] = None
    start_date: Optional[date] = None
    expected_end_date: Optional[date] = None
    completion_percentage: float = 0.0
    status: str = "ONGOING"
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: str
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int
    page: int
    page_size: int


class DashboardMetrics(BaseModel):
    total_projects: int
    projects_requiring_review: int
    high_risk_count: int
    critical_risk_count: int
    duplicate_cases: int
    cost_anomalies: int
    schedule_risks: int
    data_quality_issues: int


class DashboardResponse(BaseModel):
    metrics: DashboardMetrics
    risk_distribution: Dict[str, int]
    category_distribution: List[Dict[str, Any]]
    state_distribution: List[Dict[str, Any]]
    high_priority_projects: List[ProjectResponse]


class ReviewNoteCreate(BaseModel):
    author: str = "Government Analyst"
    content: str
    action_taken: Optional[str] = None


class ReviewNoteResponse(BaseModel):
    id: str
    author: str
    content: str
    action_taken: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReviewCaseUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None


class RiskWeightsUpdate(BaseModel):
    cost: float = 0.35
    duplicate: float = 0.30
    delay: float = 0.25
    data_quality: float = 0.10


# -------------------------------------------------------------
# Authentication & User Profile Schemas
# -------------------------------------------------------------
class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: str
    phone: str
    password: str = Field(..., min_length=8)
    organization: Optional[str] = "National Infrastructure Review Cell"
    designation: Optional[str] = "Project Review Analyst"


class UserLoginRequest(BaseModel):
    identifier: str  # Email or phone number
    password: str


class VerifyEmailOtpRequest(BaseModel):
    email: str
    otp: str = Field(..., min_length=4, max_length=10)


class VerifyPhoneOtpRequest(BaseModel):
    phone: str
    otp: str = Field(..., min_length=4, max_length=10)


class ResendOtpRequest(BaseModel):
    target: str  # Email or phone
    code_type: str = "EMAIL_VERIFICATION"  # EMAIL_VERIFICATION or PHONE_VERIFICATION


class GoogleAuthRequest(BaseModel):
    credential: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str = Field(..., min_length=8)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    organization: Optional[str] = None
    designation: Optional[str] = None
    avatar_url: Optional[str] = None


class DeleteAccountRequest(BaseModel):
    password_confirmation: str

