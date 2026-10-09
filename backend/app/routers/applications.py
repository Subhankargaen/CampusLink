from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.application import Application
from app.models.student import Student
from app.models.job import Job
from app.models.company import Company
from app.models.recruiter import Recruiter
from app.auth.dependencies import require_role
from app.schemas.application import ApplicationCreate, ApplicationStatusUpdate, ApplicationResponse

router = APIRouter(prefix="/api/applications", tags=["Applications"])


def enrich_application(app: Application, db: Session) -> dict:
    student = db.query(Student).filter(Student.id == app.student_id).first()
    job = db.query(Job).filter(Job.id == app.job_id).first()
    company = db.query(Company).filter(Company.id == job.company_id).first() if job else None
    return {
        "id": app.id,
        "student_id": app.student_id,
        "job_id": app.job_id,
        "status": app.status,
        "applied_at": app.applied_at,
        "updated_at": app.updated_at,
        "student_name": student.name if student else None,
        "job_title": job.title if job else None,
        "company_name": company.name if company else None,
    }


@router.get("")
def list_all_applications(
    job_id: str | None = None,
    user: User = Depends(require_role("tpo", "recruiter")),
    db: Session = Depends(get_db),
):
    """List all campus applications for TPO oversight."""
    query = db.query(Application)
    if job_id:
        query = query.filter(Application.job_id == job_id)
    apps = query.order_by(Application.applied_at.desc()).all()
    return [enrich_application(a, db) for a in apps]


@router.get("/my-applications")
def get_my_applications(
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    """Get all applications submitted by the current student."""
    student = user.student
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    apps = db.query(Application).filter(Application.student_id == student.id).all()
    return [enrich_application(a, db) for a in apps]


@router.post("", status_code=201)
def apply_to_job(
    data: ApplicationCreate,
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = user.student
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Check job exists and is active
    job = db.query(Job).filter(Job.id == data.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "active":
        raise HTTPException(status_code=400, detail="Job is not accepting applications")

    # Check duplicate
    existing = db.query(Application).filter(
        Application.student_id == student.id,
        Application.job_id == data.job_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already applied to this job")

    application = Application(student_id=student.id, job_id=data.job_id)
    db.add(application)
    db.commit()
    db.refresh(application)
    return enrich_application(application, db)


@router.get("/{app_id}")
def get_application(
    app_id: str,
    user: User = Depends(require_role("student", "recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    application = db.query(Application).filter(Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return enrich_application(application, db)


@router.patch("/{app_id}/status")
def update_application_status(
    app_id: str,
    data: ApplicationStatusUpdate,
    user: User = Depends(require_role("recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    application = db.query(Application).filter(Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if user.role == "recruiter":
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
        job = db.query(Job).filter(Job.id == application.job_id).first()
        if not recruiter or not job or job.company_id != recruiter.company_id:
            raise HTTPException(status_code=403, detail="Not authorized for this application")

    application.status = data.status
    db.commit()
    db.refresh(application)
    return enrich_application(application, db)
