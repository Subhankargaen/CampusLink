import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.models.company import Company
from app.models.recruiter import Recruiter
from app.auth.dependencies import require_role
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.utils.file_handler import save_upload_file

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


def get_recruiter_or_404(user: User, db: Session) -> Recruiter:
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    return recruiter


def job_to_response(job: Job, db: Session) -> dict:
    company = db.query(Company).filter(Company.id == job.company_id).first()
    return {
        "id": job.id,
        "company_id": job.company_id,
        "drive_id": job.drive_id,
        "title": job.title,
        "role_type": job.role_type,
        "location": job.location,
        "ctc_lpa": job.ctc_lpa,
        "deadline": str(job.deadline) if job.deadline else None,
        "eligible_branches": job.get_eligible_branches(),
        "min_cgpa": job.min_cgpa,
        "max_backlogs": job.max_backlogs,
        "required_batch": job.required_batch,
        "mandatory_skills": job.get_mandatory_skills(),
        "preferred_skills": job.get_preferred_skills(),
        "min_experience_months": job.min_experience_months,
        "selection_process": job.get_selection_process(),
        "raw_jd": job.raw_jd,
        "jd_file_path": job.jd_file_path,
        "status": job.status,
        "company_name": company.name if company else None,
        "created_at": job.created_at,
    }


@router.get("", response_model=list[JobResponse])
def list_jobs(
    status: str | None = Query(None),
    drive_id: str | None = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(require_role("student", "recruiter", "tpo")),
):
    query = db.query(Job)
    if status:
        query = query.filter(Job.status == status)
    if drive_id:
        query = query.filter(Job.drive_id == drive_id)
    if user.role == "recruiter":
        recruiter = get_recruiter_or_404(user, db)
        query = query.filter(Job.company_id == recruiter.company_id)

    jobs = query.order_by(Job.created_at.desc()).all()
    return [job_to_response(j, db) for j in jobs]


@router.get("/{job_id}")
def get_job(
    job_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("student", "recruiter", "tpo")),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job_to_response(job, db)


@router.post("", status_code=201)
def create_job(
    data: JobCreate,
    user: User = Depends(require_role("recruiter")),
    db: Session = Depends(get_db),
):
    recruiter = get_recruiter_or_404(user, db)
    job = Job(
        company_id=recruiter.company_id,
        title=data.title,
        role_type=data.role_type,
        location=data.location,
        ctc_lpa=data.ctc_lpa,
        drive_id=data.drive_id,
        min_cgpa=data.min_cgpa,
        max_backlogs=data.max_backlogs,
        required_batch=data.required_batch,
        min_experience_months=data.min_experience_months,
        raw_jd=data.raw_jd,
        status=data.status,
    )
    job.set_eligible_branches(data.eligible_branches)
    job.set_mandatory_skills(data.mandatory_skills)
    job.set_preferred_skills(data.preferred_skills)
    job.set_selection_process(data.selection_process)

    db.add(job)
    db.commit()
    db.refresh(job)
    return job_to_response(job, db)


@router.put("/{job_id}")
def update_job(
    job_id: str,
    data: JobUpdate,
    user: User = Depends(require_role("recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if user.role == "recruiter":
        recruiter = get_recruiter_or_404(user, db)
        if job.company_id != recruiter.company_id:
            raise HTTPException(status_code=403, detail="Not your company's job")

    update_data = data.model_dump(exclude_unset=True)
    list_fields = {
        "eligible_branches": job.set_eligible_branches,
        "mandatory_skills": job.set_mandatory_skills,
        "preferred_skills": job.set_preferred_skills,
        "selection_process": job.set_selection_process,
    }
    for field, setter in list_fields.items():
        if field in update_data:
            setter(update_data.pop(field))
    for key, value in update_data.items():
        setattr(job, key, value)

    db.commit()
    db.refresh(job)
    return job_to_response(job, db)


@router.post("/{job_id}/jd")
async def upload_jd(
    job_id: str,
    file: UploadFile = File(...),
    user: User = Depends(require_role("recruiter")),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    recruiter = get_recruiter_or_404(user, db)
    if job.company_id != recruiter.company_id:
        raise HTTPException(status_code=403, detail="Not your company's job")

    file_path = await save_upload_file(file, "jds")
    job.jd_file_path = file_path
    db.commit()
    return {"message": "JD uploaded successfully", "path": file_path}
