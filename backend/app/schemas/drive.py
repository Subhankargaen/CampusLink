from pydantic import BaseModel, Field
from datetime import datetime


class DriveCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    academic_year: str = Field(..., min_length=4, max_length=20)
    start_date: str | None = None
    end_date: str | None = None
    status: str = "upcoming"
    description: str | None = None


class DriveUpdate(BaseModel):
    name: str | None = None
    academic_year: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    status: str | None = None
    description: str | None = None


class DriveResponse(BaseModel):
    id: str
    name: str
    academic_year: str
    start_date: str | None
    end_date: str | None
    status: str
    description: str | None
    created_at: datetime
    job_count: int = 0

    class Config:
        from_attributes = True
