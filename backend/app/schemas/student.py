from pydantic import BaseModel, Field
from datetime import datetime


# ---- Student Profile ----
class StudentUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    branch: str | None = None
    cgpa: float | None = Field(None, ge=0, le=10)
    graduation_year: int | None = None
    active_backlogs: int | None = Field(None, ge=0)
    career_goal: str | None = None


class StudentResponse(BaseModel):
    id: str
    user_id: str
    name: str
    phone: str | None
    branch: str | None
    cgpa: float | None
    graduation_year: int | None
    active_backlogs: int
    resume_path: str | None
    readiness_score: float
    career_goal: str | None
    profile_complete: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---- Skills ----
class SkillCreate(BaseModel):
    skill_name: str = Field(..., min_length=1, max_length=100)
    proficiency: str = Field("intermediate", pattern="^(beginner|intermediate|advanced|expert)$")


class SkillResponse(BaseModel):
    id: str
    skill_name: str
    normalized_name: str
    proficiency: str
    source: str

    class Config:
        from_attributes = True


# ---- Projects ----
class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    tech_stack: list[str] = []
    url: str | None = None
    start_date: str | None = None
    end_date: str | None = None


class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    tech_stack: list[str] | None = None
    url: str | None = None
    start_date: str | None = None
    end_date: str | None = None


class ProjectResponse(BaseModel):
    id: str
    title: str
    description: str | None
    tech_stack: list[str] = []
    url: str | None
    start_date: str | None
    end_date: str | None

    class Config:
        from_attributes = True


# ---- Experience ----
class ExperienceCreate(BaseModel):
    company: str = Field(..., min_length=1, max_length=255)
    role: str | None = None
    description: str | None = None
    duration_months: int | None = Field(None, ge=0)
    is_internship: bool = True
    start_date: str | None = None
    end_date: str | None = None


class ExperienceUpdate(BaseModel):
    company: str | None = None
    role: str | None = None
    description: str | None = None
    duration_months: int | None = None
    is_internship: bool | None = None
    start_date: str | None = None
    end_date: str | None = None


class ExperienceResponse(BaseModel):
    id: str
    company: str
    role: str | None
    description: str | None
    duration_months: int | None
    is_internship: bool
    start_date: str | None
    end_date: str | None

    class Config:
        from_attributes = True


# ---- Certifications ----
class CertificationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    issuer: str | None = None
    issue_date: str | None = None
    credential_url: str | None = None


class CertificationResponse(BaseModel):
    id: str
    name: str
    issuer: str | None
    issue_date: str | None
    credential_url: str | None

    class Config:
        from_attributes = True


# ---- Placement Passport ----
class PlacementPassportResponse(BaseModel):
    student: StudentResponse
    skills: list[SkillResponse]
    projects: list[ProjectResponse]
    experiences: list[ExperienceResponse]
    certifications: list[CertificationResponse]
    readiness_score: float
    profile_completeness: float
    skill_gaps: list[str]
    career_recommendations: list[dict]
    application_count: int
    interview_count: int
    offer_count: int


# ---- Full Student Profile (for TPO/Recruiter view) ----
class StudentFullResponse(BaseModel):
    student: StudentResponse
    skills: list[SkillResponse]
    projects: list[ProjectResponse]
    experiences: list[ExperienceResponse]
    certifications: list[CertificationResponse]
    email: str
