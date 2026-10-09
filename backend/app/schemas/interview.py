from pydantic import BaseModel, Field
from datetime import datetime


class InterviewCreate(BaseModel):
    application_id: str
    round_name: str = Field(..., min_length=1, max_length=100)
    round_number: int = Field(1, ge=1)
    scheduled_at: str  # ISO datetime string
    duration_minutes: int = Field(60, ge=15, le=480)
    location_or_link: str | None = None


class InterviewUpdate(BaseModel):
    scheduled_at: str | None = None
    duration_minutes: int | None = None
    location_or_link: str | None = None
    status: str | None = None
    feedback: str | None = None
    result: str | None = None


class InterviewResponse(BaseModel):
    id: str
    application_id: str
    round_name: str
    round_number: int
    scheduled_at: datetime
    duration_minutes: int
    location_or_link: str | None
    status: str
    feedback: str | None
    result: str
    student_name: str | None = None
    job_title: str | None = None
    company_name: str | None = None

    class Config:
        from_attributes = True


class ConflictCheckRequest(BaseModel):
    student_id: str
    scheduled_at: str  # ISO datetime string
    duration_minutes: int = 60


class ConflictResponse(BaseModel):
    has_conflict: bool
    conflicts: list[dict]
    alternatives: list[dict]


class SlotSuggestionRequest(BaseModel):
    student_ids: list[str]
    date_start: str
    date_end: str
    time_start: str = "09:00"
    time_end: str = "17:00"
    duration_minutes: int = 60
