from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.company import Company
from app.auth.dependencies import require_role
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse

router = APIRouter(prefix="/api/companies", tags=["Companies"])


@router.get("/my-company", response_model=CompanyResponse)
def get_my_company(
    user: User = Depends(require_role("recruiter")),
    db: Session = Depends(get_db),
):
    from app.models.recruiter import Recruiter
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    
    company = db.query(Company).filter(Company.id == recruiter.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.get("", response_model=list[CompanyResponse])
def list_companies(
    user: User = Depends(require_role("student", "recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    companies = db.query(Company).order_by(Company.created_at.desc()).all()
    return companies


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(
    company_id: str,
    user: User = Depends(require_role("student", "recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: str,
    data: CompanyUpdate,
    user: User = Depends(require_role("recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(company, key, value)
    db.commit()
    db.refresh(company)
    return company


@router.patch("/{company_id}/approve", response_model=CompanyResponse)
def approve_company(
    company_id: str,
    user: User = Depends(require_role("tpo")),
    db: Session = Depends(get_db),
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.is_approved = True
    db.commit()
    db.refresh(company)
    return company
