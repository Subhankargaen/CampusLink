import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.company import Company
from app.models.job import Job
from app.models.application import Application
from app.models.interview import Interview
from app.models.offer import Offer
from app.models.placement_drive import PlacementDrive
from app.models.student_skill import StudentSkill
from app.models.risk_assessment import RiskAssessment
from app.auth.dependencies import require_role

router = APIRouter(prefix="/api/admin", tags=["Admin / TPO"])


@router.get("/dashboard")
def get_dashboard(
    user: User = Depends(require_role("tpo")),
    db: Session = Depends(get_db),
):
    """Command center dashboard with KPIs."""
    total_students = db.query(Student).count()
    total_companies = db.query(Company).count()
    total_jobs = db.query(Job).filter(Job.status == "active").count()
    total_applications = db.query(Application).count()
    total_interviews = db.query(Interview).count()
    total_offers = db.query(Offer).count()
    total_placed = db.query(Offer).filter(Offer.status.in_(["accepted", "joined"])).count()
    active_drives = db.query(PlacementDrive).filter(PlacementDrive.status == "active").count()
    at_risk_count = db.query(RiskAssessment).filter(
        RiskAssessment.risk_level.in_(["high", "critical"])
    ).distinct(RiskAssessment.student_id).count()

    placement_rate = (total_placed / total_students * 100) if total_students > 0 else 0

    # Package stats
    avg_pkg = db.query(func.avg(Offer.ctc_lpa)).filter(
        Offer.status.in_(["accepted", "joined"])
    ).scalar() or 0
    max_pkg = db.query(func.max(Offer.ctc_lpa)).filter(
        Offer.status.in_(["accepted", "joined"])
    ).scalar() or 0

    return {
        "total_students": total_students,
        "total_companies": total_companies,
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "total_interviews": total_interviews,
        "total_offers": total_offers,
        "total_placed": total_placed,
        "placement_rate": round(placement_rate, 1),
        "avg_package_lpa": round(float(avg_pkg), 2),
        "highest_package_lpa": round(float(max_pkg), 2),
        "active_drives": active_drives,
        "at_risk_count": at_risk_count,
    }


@router.get("/students")
def list_all_students(
    branch: str | None = Query(None),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(require_role("tpo")),
    db: Session = Depends(get_db),
):
    """List all students with filtering and pagination."""
    query = db.query(Student)
    if branch:
        query = query.filter(Student.branch == branch)
    if search:
        query = query.filter(Student.name.ilike(f"%{search}%"))

    total = query.count()
    students = query.offset((page - 1) * limit).limit(limit).all()

    results = []
    for s in students:
        user_obj = db.query(User).filter(User.id == s.user_id).first()
        skills = db.query(StudentSkill).filter(StudentSkill.student_id == s.id).all()
        results.append({
            "id": s.id,
            "name": s.name,
            "email": user_obj.email if user_obj else None,
            "branch": s.branch,
            "cgpa": s.cgpa,
            "graduation_year": s.graduation_year,
            "active_backlogs": s.active_backlogs,
            "readiness_score": s.readiness_score,
            "profile_complete": s.profile_complete,
            "skill_count": len(skills),
        })

    return {"total": total, "page": page, "limit": limit, "students": results}


@router.get("/students/{student_id}")
def get_student_detail(
    student_id: str,
    user: User = Depends(require_role("tpo", "recruiter")),
    db: Session = Depends(get_db),
):
    """Get full student profile for admin view."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    user_obj = db.query(User).filter(User.id == student.user_id).first()
    skills = db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()
    from app.models.student_project import StudentProject
    from app.models.student_experience import StudentExperience
    from app.models.student_certification import StudentCertification
    projects = db.query(StudentProject).filter(StudentProject.student_id == student.id).all()
    experiences = db.query(StudentExperience).filter(StudentExperience.student_id == student.id).all()
    certs = db.query(StudentCertification).filter(StudentCertification.student_id == student.id).all()
    apps = db.query(Application).filter(Application.student_id == student.id).all()

    return {
        "student": {
            "id": student.id, "name": student.name, "phone": student.phone,
            "branch": student.branch, "cgpa": student.cgpa,
            "graduation_year": student.graduation_year,
            "active_backlogs": student.active_backlogs,
            "readiness_score": student.readiness_score,
            "career_goal": student.career_goal,
            "profile_complete": student.profile_complete,
        },
        "email": user_obj.email if user_obj else None,
        "skills": [{"id": s.id, "skill_name": s.skill_name, "normalized_name": s.normalized_name, "proficiency": s.proficiency} for s in skills],
        "projects": [{"id": p.id, "title": p.title, "description": p.description, "tech_stack": p.get_tech_stack()} for p in projects],
        "experiences": [{"id": e.id, "company": e.company, "role": e.role, "duration_months": e.duration_months, "is_internship": e.is_internship} for e in experiences],
        "certifications": [{"id": c.id, "name": c.name, "issuer": c.issuer} for c in certs],
        "application_count": len(apps),
    }


@router.get("/analytics/placements")
def get_placement_analytics(
    user: User = Depends(require_role("tpo")),
    db: Session = Depends(get_db),
):
    """Branch-wise placement analytics."""
    students = db.query(Student).all()
    branches = set(s.branch for s in students if s.branch)

    branch_stats = []
    for branch in sorted(branches):
        branch_students = [s for s in students if s.branch == branch]
        total = len(branch_students)
        placed = 0
        packages = []
        for s in branch_students:
            offers = db.query(Offer).join(Application).filter(
                Application.student_id == s.id,
                Offer.status.in_(["accepted", "joined"]),
            ).all()
            if offers:
                placed += 1
                packages.extend([o.ctc_lpa for o in offers])

        branch_stats.append({
            "branch": branch,
            "total_students": total,
            "placed_students": placed,
            "placement_rate": round(placed / total * 100, 1) if total > 0 else 0,
            "avg_package_lpa": round(sum(packages) / len(packages), 2) if packages else 0,
        })

    return {"branch_analytics": branch_stats}


@router.get("/analytics/skills")
def get_skill_analytics(
    user: User = Depends(require_role("tpo")),
    db: Session = Depends(get_db),
):
    """Skill demand vs supply analysis."""
    # Demand: count skills across active jobs
    active_jobs = db.query(Job).filter(Job.status == "active").all()
    demand = {}
    for job in active_jobs:
        for skill in job.get_mandatory_skills() + job.get_preferred_skills():
            demand[skill] = demand.get(skill, 0) + 1

    # Supply: count students with each skill
    all_skills = db.query(StudentSkill).all()
    supply = {}
    for skill in all_skills:
        supply[skill.normalized_name] = supply.get(skill.normalized_name, 0) + 1

    # Combine
    all_skill_names = set(list(demand.keys()) + list(supply.keys()))
    skill_analysis = []
    for skill in sorted(all_skill_names):
        d = demand.get(skill, 0)
        s = supply.get(skill, 0)
        skill_analysis.append({
            "skill": skill,
            "demand_count": d,
            "supply_count": s,
            "gap": d - s,
        })

    # Sort by gap descending (biggest gaps first)
    skill_analysis.sort(key=lambda x: x["gap"], reverse=True)

    return {"skill_analytics": skill_analysis[:30]}  # Top 30


@router.get("/analytics/packages")
def get_package_analytics(
    user: User = Depends(require_role("tpo")),
    db: Session = Depends(get_db),
):
    """Package distribution analytics."""
    offers = db.query(Offer).filter(Offer.status.in_(["accepted", "joined"])).all()
    ranges = [
        ("0-5 LPA", 0, 5),
        ("5-8 LPA", 5, 8),
        ("8-12 LPA", 8, 12),
        ("12-15 LPA", 12, 15),
        ("15-20 LPA", 15, 20),
        ("20+ LPA", 20, 999),
    ]

    distribution = []
    for label, low, high in ranges:
        count = sum(1 for o in offers if low <= o.ctc_lpa < high)
        distribution.append({"range_label": label, "count": count})

    return {"package_distribution": distribution}


@router.get("/analytics/at-risk")
def get_at_risk_students(
    user: User = Depends(require_role("tpo")),
    db: Session = Depends(get_db),
):
    """Get at-risk students with risk assessments."""
    from app.ai.risk_scorer import compute_all_risk_scores
    risk_data = compute_all_risk_scores(db)
    return {"at_risk_students": risk_data}


@router.get("/analytics/company-wise")
def get_company_analytics(
    user: User = Depends(require_role("tpo")),
    db: Session = Depends(get_db),
):
    """Company-wise hiring analytics."""
    companies = db.query(Company).all()
    results = []
    for company in companies:
        jobs = db.query(Job).filter(Job.company_id == company.id).all()
        job_ids = [j.id for j in jobs]
        apps = db.query(Application).filter(Application.job_id.in_(job_ids)).count() if job_ids else 0
        offers = db.query(Offer).join(Application).filter(
            Application.job_id.in_(job_ids)
        ).count() if job_ids else 0
        joined = db.query(Offer).join(Application).filter(
            Application.job_id.in_(job_ids),
            Offer.status == "joined",
        ).count() if job_ids else 0

        results.append({
            "company_name": company.name,
            "jobs_posted": len(jobs),
            "applications_received": apps,
            "offers_made": offers,
            "joined": joined,
        })

    return {"company_analytics": results}


@router.get("/ai-advisor")
def get_ai_insights(
    user: User = Depends(require_role("tpo")),
    db: Session = Depends(get_db),
):
    """AI-generated insights and recommendations."""
    from app.ai.analytics_engine import generate_insights
    insights = generate_insights(db)
    return {"insights": insights}
