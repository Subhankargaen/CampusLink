from pydantic import BaseModel, Field
from datetime import datetime


class OfferCreate(BaseModel):
    application_id: str
    ctc_lpa: float = Field(..., gt=0)
    role: str | None = None
    location: str | None = None
    joining_date: str | None = None
    deadline: str | None = None


class OfferUpdate(BaseModel):
    status: str = Field(..., pattern="^(accepted|declined|expired|joined|not_joined)$")


class OfferResponse(BaseModel):
    id: str
    application_id: str
    ctc_lpa: float
    role: str | None
    location: str | None
    joining_date: str | None
    deadline: str | None
    status: str
    created_at: datetime
    student_name: str | None = None
    job_title: str | None = None
    company_name: str | None = None

    class Config:
        from_attributes = True
