from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.placement_drive import PlacementDrive
from app.models.job import Job
from app.auth.dependencies import require_role
from app.schemas.drive import DriveCreate, DriveUpdate, DriveResponse

router = APIRouter(prefix="/api/drives", tags=["Placement Drives"])


@router.get("", response_model=list[DriveResponse])
def list_drives(
    user: User = Depends(require_role("student", "recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    drives = db.query(PlacementDrive).order_by(PlacementDrive.created_at.desc()).all()
    result = []
    for d in drives:
        job_count = db.query(Job).filter(Job.drive_id == d.id).count()
        result.append(DriveResponse(
            id=d.id, name=d.name, academic_year=d.academic_year,
            start_date=str(d.start_date) if d.start_date else None,
            end_date=str(d.end_date) if d.end_date else None,
            status=d.status, description=d.description,
            created_at=d.created_at, job_count=job_count,
        ))
    return result


@router.get("/{drive_id}")
def get_drive(
    drive_id: str,
    user: User = Depends(require_role("student", "recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    drive = db.query(PlacementDrive).filter(PlacementDrive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
    job_count = db.query(Job).filter(Job.drive_id == drive.id).count()
    return DriveResponse(
        id=drive.id, name=drive.name, academic_year=drive.academic_year,
        start_date=str(drive.start_date) if drive.start_date else None,
        end_date=str(drive.end_date) if drive.end_date else None,
        status=drive.status, description=drive.description,
        created_at=drive.created_at, job_count=job_count,
    )


@router.post("", status_code=201)
def create_drive(
    data: DriveCreate,
    user: User = Depends(require_role("tpo")),
    db: Session = Depends(get_db),
):
    drive = PlacementDrive(
        name=data.name,
        academic_year=data.academic_year,
        status=data.status,
        description=data.description,
    )
    db.add(drive)
    db.commit()
    db.refresh(drive)
    return DriveResponse(
        id=drive.id, name=drive.name, academic_year=drive.academic_year,
        start_date=str(drive.start_date) if drive.start_date else None,
        end_date=str(drive.end_date) if drive.end_date else None,
        status=drive.status, description=drive.description,
        created_at=drive.created_at, job_count=0,
    )


@router.put("/{drive_id}")
def update_drive(
    drive_id: str,
    data: DriveUpdate,
    user: User = Depends(require_role("tpo")),
    db: Session = Depends(get_db),
):
    drive = db.query(PlacementDrive).filter(PlacementDrive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(drive, key, value)
    db.commit()
    db.refresh(drive)
    job_count = db.query(Job).filter(Job.drive_id == drive.id).count()
    return DriveResponse(
        id=drive.id, name=drive.name, academic_year=drive.academic_year,
        start_date=str(drive.start_date) if drive.start_date else None,
        end_date=str(drive.end_date) if drive.end_date else None,
        status=drive.status, description=drive.description,
        created_at=drive.created_at, job_count=job_count,
    )
