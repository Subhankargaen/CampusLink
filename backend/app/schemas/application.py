from pydantic import BaseModel, Field
from datetime import datetime


class ApplicationCreate(BaseModel):
    job_id: str


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(shortlisted|rejected|interview|offered|accepted|withdrawn)$")


class ApplicationResponse(BaseModel):
    id: str
    student_id: str
    job_id: str
    status: str
    applied_at: datetime
    updated_at: datetime
    student_name: str | None = None
    job_title: str | None = None
    company_name: str | None = None

    class Config:
        from_attributes = True


class MatchResponse(BaseModel):
    id: str
    application_id: str
    overall_score: float
    factor_scores: dict
    matched_skills: list[str]
    missing_skills: list[str]
    relevant_projects: list[dict]
    explanation: str | None
    confidence: float
    computed_at: datetime
    student_name: str | None = None
    student_id: str | None = None

    class Config:
        from_attributes = True


class EligibilityResult(BaseModel):
    student_id: str
    student_name: str
    eligible: bool
    passed_requirements: list[str]
    failed_requirements: list[str]
