import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.student_skill import StudentSkill
from app.models.student_project import StudentProject
from app.models.student_experience import StudentExperience
from app.models.student_certification import StudentCertification
from app.auth.dependencies import get_current_user, require_role
from app.schemas.student import (
    StudentUpdate, StudentResponse, SkillCreate, SkillResponse,
    ProjectCreate, ProjectUpdate, ProjectResponse,
    ExperienceCreate, ExperienceUpdate, ExperienceResponse,
    CertificationCreate, CertificationResponse,
)
from app.utils.file_handler import save_upload_file

router = APIRouter(prefix="/api/students", tags=["Students"])


def get_student_or_404(user: User, db: Session) -> Student:
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student


# ──── Profile ────

@router.get("/me", response_model=StudentResponse)
def get_my_profile(user: User = Depends(require_role("student"))):
    student = user.student
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student


@router.put("/me", response_model=StudentResponse)
def update_my_profile(
    data: StudentUpdate,
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(user, db)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(student, key, value)

    # Check profile completeness
    student.profile_complete = all([
        student.name, student.phone, student.branch,
        student.cgpa is not None, student.graduation_year,
    ])

    db.commit()
    db.refresh(student)
    return student


# ──── Resume ────

@router.post("/me/resume")
async def upload_resume(
    file: UploadFile = File(...),
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(user, db)
    file_path = await save_upload_file(file, "resumes")
    student.resume_path = file_path
    db.commit()
    return {"message": "Resume uploaded successfully", "path": file_path}


# ──── Skills ────

@router.get("/me/skills", response_model=list[SkillResponse])
def list_my_skills(user: User = Depends(require_role("student")), db: Session = Depends(get_db)):
    student = get_student_or_404(user, db)
    return student.skills


@router.post("/me/skills", response_model=SkillResponse, status_code=201)
def add_skill(
    data: SkillCreate,
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(user, db)

    # Import normalizer here to avoid circular imports at module level
    from app.ai.skill_normalizer import normalize_skill
    normalized = normalize_skill(data.skill_name)

    # Check for duplicate normalized skill
    existing = db.query(StudentSkill).filter(
        StudentSkill.student_id == student.id,
        StudentSkill.normalized_name == normalized,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Skill '{normalized}' already exists")

    skill = StudentSkill(
        student_id=student.id,
        skill_name=data.skill_name,
        normalized_name=normalized,
        proficiency=data.proficiency,
        source="manual",
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@router.delete("/me/skills/{skill_id}")
def delete_skill(
    skill_id: str,
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(user, db)
    skill = db.query(StudentSkill).filter(
        StudentSkill.id == skill_id,
        StudentSkill.student_id == student.id,
    ).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()
    return {"message": "Skill deleted"}


# ──── Projects ────

@router.get("/me/projects", response_model=list[ProjectResponse])
def list_my_projects(user: User = Depends(require_role("student")), db: Session = Depends(get_db)):
    student = get_student_or_404(user, db)
    projects = student.projects
    result = []
    for p in projects:
        result.append(ProjectResponse(
            id=p.id, title=p.title, description=p.description,
            tech_stack=p.get_tech_stack(), url=p.url,
            start_date=str(p.start_date) if p.start_date else None,
            end_date=str(p.end_date) if p.end_date else None,
        ))
    return result


@router.post("/me/projects", response_model=ProjectResponse, status_code=201)
def add_project(
    data: ProjectCreate,
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(user, db)
    project = StudentProject(
        student_id=student.id,
        title=data.title,
        description=data.description,
        url=data.url,
    )
    project.set_tech_stack(data.tech_stack)
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectResponse(
        id=project.id, title=project.title, description=project.description,
        tech_stack=project.get_tech_stack(), url=project.url,
        start_date=str(project.start_date) if project.start_date else None,
        end_date=str(project.end_date) if project.end_date else None,
    )


@router.put("/me/projects/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    data: ProjectUpdate,
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(user, db)
    project = db.query(StudentProject).filter(
        StudentProject.id == project_id,
        StudentProject.student_id == student.id,
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = data.model_dump(exclude_unset=True)
    if "tech_stack" in update_data:
        project.set_tech_stack(update_data.pop("tech_stack"))
    for key, value in update_data.items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)
    return ProjectResponse(
        id=project.id, title=project.title, description=project.description,
        tech_stack=project.get_tech_stack(), url=project.url,
        start_date=str(project.start_date) if project.start_date else None,
        end_date=str(project.end_date) if project.end_date else None,
    )


@router.delete("/me/projects/{project_id}")
def delete_project(
    project_id: str,
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(user, db)
    project = db.query(StudentProject).filter(
        StudentProject.id == project_id,
        StudentProject.student_id == student.id,
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}


# ──── Experience ────

@router.get("/me/experiences", response_model=list[ExperienceResponse])
def list_my_experiences(user: User = Depends(require_role("student")), db: Session = Depends(get_db)):
    student = get_student_or_404(user, db)
    return student.experiences


@router.post("/me/experiences", response_model=ExperienceResponse, status_code=201)
def add_experience(
    data: ExperienceCreate,
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(user, db)
    exp = StudentExperience(
        student_id=student.id,
        company=data.company,
        role=data.role,
        description=data.description,
        duration_months=data.duration_months,
        is_internship=data.is_internship,
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.put("/me/experiences/{exp_id}", response_model=ExperienceResponse)
def update_experience(
    exp_id: str,
    data: ExperienceUpdate,
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(user, db)
    exp = db.query(StudentExperience).filter(
        StudentExperience.id == exp_id,
        StudentExperience.student_id == student.id,
    ).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(exp, key, value)
    db.commit()
    db.refresh(exp)
    return exp


@router.delete("/me/experiences/{exp_id}")
def delete_experience(
    exp_id: str,
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(user, db)
    exp = db.query(StudentExperience).filter(
        StudentExperience.id == exp_id,
        StudentExperience.student_id == student.id,
    ).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(exp)
    db.commit()
    return {"message": "Experience deleted"}


# ──── Certifications ────

@router.get("/me/certifications", response_model=list[CertificationResponse])
def list_my_certifications(user: User = Depends(require_role("student")), db: Session = Depends(get_db)):
    student = get_student_or_404(user, db)
    return student.certifications


@router.post("/me/certifications", response_model=CertificationResponse, status_code=201)
def add_certification(
    data: CertificationCreate,
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(user, db)
    cert = StudentCertification(
        student_id=student.id,
        name=data.name,
        issuer=data.issuer,
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert


@router.delete("/me/certifications/{cert_id}")
def delete_certification(
    cert_id: str,
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(user, db)
    cert = db.query(StudentCertification).filter(
        StudentCertification.id == cert_id,
        StudentCertification.student_id == student.id,
    ).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    db.delete(cert)
    db.commit()
    return {"message": "Certification deleted"}
