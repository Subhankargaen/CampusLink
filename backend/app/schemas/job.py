from pydantic import BaseModel, Field
from datetime import datetime


class JobCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    role_type: str | None = None
    location: str | None = None
    ctc_lpa: float | None = None
    deadline: str | None = None
    drive_id: str | None = None
    eligible_branches: list[str] = []
    min_cgpa: float = Field(0.0, ge=0, le=10)
    max_backlogs: int = Field(0, ge=0)
    required_batch: int | None = None
    mandatory_skills: list[str] = []
    preferred_skills: list[str] = []
    min_experience_months: int = Field(0, ge=0)
    selection_process: list[str] = []
    raw_jd: str | None = None
    status: str = "draft"


class JobUpdate(BaseModel):
    title: str | None = None
    role_type: str | None = None
    location: str | None = None
    ctc_lpa: float | None = None
    deadline: str | None = None
    drive_id: str | None = None
    eligible_branches: list[str] | None = None
    min_cgpa: float | None = None
    max_backlogs: int | None = None
    required_batch: int | None = None
    mandatory_skills: list[str] | None = None
    preferred_skills: list[str] | None = None
    min_experience_months: int | None = None
    selection_process: list[str] | None = None
    raw_jd: str | None = None
    status: str | None = None


class JobResponse(BaseModel):
    id: str
    company_id: str
    drive_id: str | None
    title: str
    role_type: str | None
    location: str | None
    ctc_lpa: float | None
    deadline: str | None
    eligible_branches: list[str] = []
    min_cgpa: float
    max_backlogs: int
    required_batch: int | None
    mandatory_skills: list[str] = []
    preferred_skills: list[str] = []
    min_experience_months: int
    selection_process: list[str] = []
    raw_jd: str | None
    jd_file_path: str | None
    status: str
    company_name: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class JobWithCompanyResponse(JobResponse):
    company_name: str | None = None
    company_industry: str | None = None
