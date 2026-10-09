from pydantic import BaseModel
from datetime import datetime


class AnalyticsDashboard(BaseModel):
    total_students: int
    total_companies: int
    total_jobs: int
    total_applications: int
    total_interviews: int
    total_offers: int
    total_placed: int
    placement_rate: float
    avg_package_lpa: float
    highest_package_lpa: float
    active_drives: int
    at_risk_count: int


class BranchAnalytics(BaseModel):
    branch: str
    total_students: int
    placed_students: int
    placement_rate: float
    avg_package_lpa: float


class CompanyAnalytics(BaseModel):
    company_name: str
    jobs_posted: int
    applications_received: int
    offers_made: int
    joined: int


class SkillDemandItem(BaseModel):
    skill: str
    demand_count: int
    supply_count: int
    gap: int


class PackageDistribution(BaseModel):
    range_label: str
    count: int


class AIInsight(BaseModel):
    category: str
    metric: str
    value: str
    trend: str | None
    insight: str
    recommended_action: str
    priority: str  # high, medium, low


class RiskAssessmentResponse(BaseModel):
    student_id: str
    student_name: str
    branch: str | None
    cgpa: float | None
    risk_score: float
    risk_level: str
    contributing_factors: list[dict]
    recommendations: list[dict]
    assessed_at: datetime

    class Config:
        from_attributes = True
