from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.interview import Interview
from app.models.application import Application
from app.models.student import Student
from app.models.job import Job
from app.models.company import Company
from app.auth.dependencies import require_role
from app.schemas.interview import InterviewCreate, InterviewUpdate, InterviewResponse

router = APIRouter(prefix="/api/interviews", tags=["Interviews"])


def enrich_interview(iv: Interview, db: Session) -> dict:
    app = db.query(Application).filter(Application.id == iv.application_id).first()
    student = db.query(Student).filter(Student.id == app.student_id).first() if app else None
    job = db.query(Job).filter(Job.id == app.job_id).first() if app else None
    company = db.query(Company).filter(Company.id == job.company_id).first() if job else None
    return {
        "id": iv.id,
        "application_id": iv.application_id,
        "round_name": iv.round_name,
        "round_number": iv.round_number,
        "scheduled_at": iv.scheduled_at,
        "duration_minutes": iv.duration_minutes,
        "location_or_link": iv.location_or_link,
        "status": iv.status,
        "feedback": iv.feedback,
        "result": iv.result,
        "student_name": student.name if student else None,
        "job_title": job.title if job else None,
        "company_name": company.name if company else None,
    }


@router.get("")
def list_all_interviews(
    user: User = Depends(require_role("tpo", "recruiter")),
    db: Session = Depends(get_db),
):
    """List all interviews across the campus."""
    interviews = db.query(Interview).order_by(Interview.scheduled_at.desc()).all()
    return [enrich_interview(iv, db) for iv in interviews]


@router.get("/my-interviews")
def get_my_interviews(
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    """Get all scheduled, completed, and upcoming interviews for the current student."""
    student = user.student
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    student_app_ids = [a.id for a in db.query(Application).filter(Application.student_id == student.id).all()]
    if not student_app_ids:
        return []

    interviews = db.query(Interview).filter(Interview.application_id.in_(student_app_ids)).all()
    return [enrich_interview(iv, db) for iv in interviews]


@router.post("", status_code=201)
def schedule_interview(
    data: InterviewCreate,
    user: User = Depends(require_role("recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(Application.id == data.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    scheduled_at = datetime.fromisoformat(data.scheduled_at)

    interview = Interview(
        application_id=data.application_id,
        round_name=data.round_name,
        round_number=data.round_number,
        scheduled_at=scheduled_at,
        duration_minutes=data.duration_minutes,
        location_or_link=data.location_or_link,
    )
    db.add(interview)

    # Update application status
    if app.status in ("applied", "shortlisted"):
        app.status = "interview"

    db.commit()
    db.refresh(interview)
    return enrich_interview(interview, db)


@router.get("/{interview_id}")
def get_interview(
    interview_id: str,
    user: User = Depends(require_role("student", "recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return enrich_interview(interview, db)


@router.patch("/{interview_id}")
def update_interview(
    interview_id: str,
    data: InterviewUpdate,
    user: User = Depends(require_role("recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    update_data = data.model_dump(exclude_unset=True)
    if "scheduled_at" in update_data and update_data["scheduled_at"]:
        update_data["scheduled_at"] = datetime.fromisoformat(update_data["scheduled_at"])
    for key, value in update_data.items():
        setattr(interview, key, value)

    db.commit()
    db.refresh(interview)
    return enrich_interview(interview, db)


@router.post("/check-conflicts")
def check_conflicts(
    student_id: str,
    scheduled_at: str,
    duration_minutes: int = 60,
    user: User = Depends(require_role("recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    """Check for scheduling conflicts for a student at a given time."""
    from app.ai.smart_scheduler import check_student_conflicts
    proposed_start = datetime.fromisoformat(scheduled_at)
    result = check_student_conflicts(db, student_id, proposed_start, duration_minutes)
    return result


@router.post("/suggest-slots")
def suggest_slots(
    student_id: str,
    date_start: str,
    date_end: str,
    duration_minutes: int = 60,
    time_start: str = "09:00",
    time_end: str = "17:00",
    user: User = Depends(require_role("recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    """Suggest available interview slots for a student."""
    from app.ai.smart_scheduler import suggest_available_slots
    result = suggest_available_slots(
        db, student_id, date_start, date_end,
        time_start, time_end, duration_minutes
    )
    return result
