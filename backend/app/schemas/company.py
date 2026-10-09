from pydantic import BaseModel, Field
from datetime import datetime


class CompanyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    industry: str | None = None
    description: str | None = None
    website: str | None = None


class CompanyUpdate(BaseModel):
    name: str | None = None
    industry: str | None = None
    description: str | None = None
    website: str | None = None


class CompanyResponse(BaseModel):
    id: str
    name: str
    industry: str | None
    description: str | None
    website: str | None
    logo_path: str | None
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class RecruiterResponse(BaseModel):
    id: str
    user_id: str
    company_id: str
    name: str
    designation: str | None
    phone: str | None
    company: CompanyResponse | None = None

    class Config:
        from_attributes = True
