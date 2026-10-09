from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.offer import Offer
from app.models.application import Application
from app.models.student import Student
from app.models.job import Job
from app.models.company import Company
from app.auth.dependencies import require_role
from app.schemas.offer import OfferCreate, OfferUpdate

router = APIRouter(prefix="/api/offers", tags=["Offers"])


def enrich_offer(offer: Offer, db: Session) -> dict:
    app = db.query(Application).filter(Application.id == offer.application_id).first()
    student = db.query(Student).filter(Student.id == app.student_id).first() if app else None
    job = db.query(Job).filter(Job.id == app.job_id).first() if app else None
    company = db.query(Company).filter(Company.id == job.company_id).first() if job else None
    return {
        "id": offer.id,
        "application_id": offer.application_id,
        "ctc_lpa": offer.ctc_lpa,
        "role": offer.role,
        "location": offer.location,
        "joining_date": str(offer.joining_date) if offer.joining_date else None,
        "deadline": str(offer.deadline) if offer.deadline else None,
        "status": offer.status,
        "created_at": offer.created_at,
        "student_name": student.name if student else None,
        "job_title": job.title if job else None,
        "company_name": company.name if company else None,
    }


@router.get("")
def list_all_offers(
    user: User = Depends(require_role("tpo", "recruiter")),
    db: Session = Depends(get_db),
):
    """List all offers issued across the campus."""
    offers = db.query(Offer).order_by(Offer.created_at.desc()).all()
    return [enrich_offer(o, db) for o in offers]


@router.get("/my-offers")
def get_my_offers(
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    """Get all offers received by the current student."""
    student = user.student
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    student_app_ids = [a.id for a in db.query(Application).filter(Application.student_id == student.id).all()]
    if not student_app_ids:
        return []

    offers = db.query(Offer).filter(Offer.application_id.in_(student_app_ids)).all()
    return [enrich_offer(o, db) for o in offers]


@router.post("", status_code=201)
def create_offer(
    data: OfferCreate,
    user: User = Depends(require_role("recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(Application.id == data.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    existing = db.query(Offer).filter(Offer.application_id == data.application_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Offer already exists for this application")

    offer = Offer(
        application_id=data.application_id,
        ctc_lpa=data.ctc_lpa,
        role=data.role,
        location=data.location,
    )
    db.add(offer)

    # Update application status
    app.status = "offered"

    db.commit()
    db.refresh(offer)
    return enrich_offer(offer, db)


@router.get("/{offer_id}")
def get_offer(
    offer_id: str,
    user: User = Depends(require_role("student", "recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return enrich_offer(offer, db)


@router.patch("/{offer_id}")
def update_offer_status(
    offer_id: str,
    data: OfferUpdate,
    user: User = Depends(require_role("student", "recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    offer.status = data.status

    # Update application status based on offer status
    app = db.query(Application).filter(Application.id == offer.application_id).first()
    if app and data.status == "accepted":
        app.status = "accepted"

    db.commit()
    db.refresh(offer)
    return enrich_offer(offer, db)
