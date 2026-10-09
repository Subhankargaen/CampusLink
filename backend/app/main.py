import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import get_settings
from app.database import engine, Base
from app.models import *  # noqa: F401, F403 — Import all models to register them

settings = get_settings()

app = FastAPI(
    title="CampusLink API",
    description="AI-Powered Campus-to-Corporate Placement Management & Analytics Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Ensure upload directories
os.makedirs(os.path.join(settings.UPLOAD_DIR, "resumes"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "jds"), exist_ok=True)

# Register routers
from app.routers import auth, students, jobs, applications, interviews, offers, companies, drives, admin

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(interviews.router)
app.include_router(offers.router)
app.include_router(companies.router)
app.include_router(drives.router)
app.include_router(admin.router)


# ── AI Endpoints (augmenting existing routers) ──

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.job import Job
from app.models.application import Application
from app.models.match import Match
from app.models.student_skill import StudentSkill
from app.auth.dependencies import require_role
import json


@app.post("/api/students/me/resume/parse", tags=["Students"])
def parse_my_resume(
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    """Parse the uploaded resume and extract structured data."""
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student or not student.resume_path:
        raise HTTPException(status_code=400, detail="No resume uploaded yet")

    from app.ai.resume_parser import parse_resume
    result = parse_resume(student.resume_path)

    # Store parsed result
    student.set_parsed_resume(result)

    # Auto-fill skills if extracted
    if result.get("skills"):
        from app.models.student_skill import StudentSkill
        for skill_data in result["skills"]:
            existing = db.query(StudentSkill).filter(
                StudentSkill.student_id == student.id,
                StudentSkill.normalized_name == skill_data["normalized_name"],
            ).first()
            if not existing:
                db.add(StudentSkill(
                    student_id=student.id,
                    skill_name=skill_data["skill_name"],
                    normalized_name=skill_data["normalized_name"],
                    source="resume_parsed",
                ))

    # Auto-fill profile fields if extracted
    if result.get("name") and not student.name:
        student.name = result["name"]
    if result.get("phone") and not student.phone:
        student.phone = result["phone"]
    if result.get("cgpa") and not student.cgpa:
        student.cgpa = result["cgpa"]
    if result.get("graduation_year") and not student.graduation_year:
        student.graduation_year = result["graduation_year"]

    db.commit()
    return result


@app.post("/api/jobs/{job_id}/jd/parse", tags=["Jobs"])
def parse_job_jd(
    job_id: str,
    user: User = Depends(require_role("recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    """Parse the job description text or uploaded JD file."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    text = job.raw_jd or ""
    if not text and job.jd_file_path:
        from app.ai.resume_parser import extract_text
        text = extract_text(job.jd_file_path)

    if not text:
        raise HTTPException(status_code=400, detail="No JD text or file available to parse")

    from app.ai.jd_parser import parse_jd_text
    result = parse_jd_text(text)

    # Store parsed JD
    job.parsed_jd = json.dumps(result)

    # Auto-fill job fields from parsed data
    if result.get("mandatory_skills"):
        job.set_mandatory_skills(result["mandatory_skills"])
    if result.get("preferred_skills"):
        job.set_preferred_skills(result["preferred_skills"])
    if result.get("eligible_branches"):
        job.set_eligible_branches(result["eligible_branches"])
    if result.get("min_cgpa") and not job.min_cgpa:
        job.min_cgpa = result["min_cgpa"]
    if result.get("max_backlogs") is not None:
        job.max_backlogs = result["max_backlogs"]
    if result.get("required_batch") and not job.required_batch:
        job.required_batch = result["required_batch"]
    if result.get("min_experience_months"):
        job.min_experience_months = result["min_experience_months"]
    if result.get("selection_process"):
        job.set_selection_process(result["selection_process"])

    db.commit()
    return result


@app.get("/api/jobs/{job_id}/eligible-students", tags=["Jobs"])
def get_eligible_students(
    job_id: str,
    user: User = Depends(require_role("recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    """Get list of eligible students for a job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    from app.ai.eligibility_engine import check_eligibility
    from app.models.student_experience import StudentExperience

    students = db.query(Student).all()
    job_data = {
        "eligible_branches": job.get_eligible_branches(),
        "min_cgpa": job.min_cgpa,
        "max_backlogs": job.max_backlogs,
        "required_batch": job.required_batch,
        "min_experience_months": job.min_experience_months,
    }

    results = []
    for student in students:
        total_exp = sum(
            (e.duration_months or 0)
            for e in db.query(StudentExperience).filter(StudentExperience.student_id == student.id).all()
        )
        student_data = {
            "branch": student.branch,
            "cgpa": student.cgpa,
            "active_backlogs": student.active_backlogs,
            "graduation_year": student.graduation_year,
            "total_experience_months": total_exp,
        }
        elig = check_eligibility(student_data, job_data)
        results.append({
            "student_id": student.id,
            "student_name": student.name,
            "branch": student.branch,
            "cgpa": student.cgpa,
            **elig,
        })

    return {
        "total": len(results),
        "eligible": [r for r in results if r["eligible"]],
        "not_eligible": [r for r in results if not r["eligible"]],
    }


@app.post("/api/jobs/{job_id}/match", tags=["Jobs"])
def run_ai_matching(
    job_id: str,
    user: User = Depends(require_role("recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    """Run AI matching for all eligible candidates of a job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    from app.ai.eligibility_engine import check_eligibility
    from app.ai.match_engine import compute_match_score
    from app.models.student_project import StudentProject
    from app.models.student_experience import StudentExperience
    from app.models.student_certification import StudentCertification

    job_data = {
        "eligible_branches": job.get_eligible_branches(),
        "min_cgpa": job.min_cgpa,
        "max_backlogs": job.max_backlogs,
        "required_batch": job.required_batch,
        "min_experience_months": job.min_experience_months,
        "mandatory_skills": job.get_mandatory_skills(),
        "preferred_skills": job.get_preferred_skills(),
        "title": job.title,
    }

    # Get all applications for this job
    applications = db.query(Application).filter(Application.job_id == job_id).all()

    matched_results = []
    for app_record in applications:
        student = db.query(Student).filter(Student.id == app_record.student_id).first()
        if not student:
            continue

        skills = [s.normalized_name for s in
                  db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()]
        projects = [
            {"title": p.title, "description": p.description, "tech_stack": p.get_tech_stack()}
            for p in db.query(StudentProject).filter(StudentProject.student_id == student.id).all()
        ]
        experiences = [
            {"company": e.company, "role": e.role, "description": e.description, "duration_months": e.duration_months}
            for e in db.query(StudentExperience).filter(StudentExperience.student_id == student.id).all()
        ]
        certifications = [
            {"name": c.name, "issuer": c.issuer}
            for c in db.query(StudentCertification).filter(StudentCertification.student_id == student.id).all()
        ]

        student_data = {
            "skills": skills,
            "projects": projects,
            "experiences": experiences,
            "certifications": certifications,
            "cgpa": student.cgpa,
            "branch": student.branch,
            "resume_path": student.resume_path,
            "phone": student.phone,
            "career_goal": student.career_goal,
        }

        match_result = compute_match_score(student_data, job_data)

        # Save match to database
        existing_match = db.query(Match).filter(Match.application_id == app_record.id).first()
        if existing_match:
            existing_match.overall_score = match_result["overall_score"]
            existing_match.factor_scores = json.dumps(match_result["factor_scores"])
            existing_match.matched_skills = json.dumps(match_result["matched_skills"])
            existing_match.missing_skills = json.dumps(match_result["missing_skills"])
            existing_match.relevant_projects = json.dumps(match_result["relevant_projects"])
            existing_match.explanation = match_result["explanation"]
            existing_match.confidence = match_result["confidence"]
        else:
            new_match = Match(
                application_id=app_record.id,
                overall_score=match_result["overall_score"],
                factor_scores=json.dumps(match_result["factor_scores"]),
                matched_skills=json.dumps(match_result["matched_skills"]),
                missing_skills=json.dumps(match_result["missing_skills"]),
                relevant_projects=json.dumps(match_result["relevant_projects"]),
                explanation=match_result["explanation"],
                confidence=match_result["confidence"],
            )
            db.add(new_match)

        matched_results.append({
            "student_id": student.id,
            "student_name": student.name,
            "application_id": app_record.id,
            **match_result,
        })

    db.commit()

    # Sort by score descending
    matched_results.sort(key=lambda r: r["overall_score"], reverse=True)

    return {"job_id": job_id, "total_matched": len(matched_results), "matches": matched_results}


@app.get("/api/jobs/{job_id}/matches", tags=["Jobs"])
def get_job_matches(
    job_id: str,
    user: User = Depends(require_role("recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    """Get pre-computed ranked candidates for a job."""
    applications = db.query(Application).filter(Application.job_id == job_id).all()

    results = []
    for app_record in applications:
        match = db.query(Match).filter(Match.application_id == app_record.id).first()
        student = db.query(Student).filter(Student.id == app_record.student_id).first()
        if match and student:
            results.append({
                "student_id": student.id,
                "student_name": student.name,
                "branch": student.branch,
                "cgpa": student.cgpa,
                "application_id": app_record.id,
                "application_status": app_record.status,
                "overall_score": match.overall_score,
                "factor_scores": json.loads(match.factor_scores) if match.factor_scores else {},
                "matched_skills": json.loads(match.matched_skills) if match.matched_skills else [],
                "missing_skills": json.loads(match.missing_skills) if match.missing_skills else [],
                "explanation": match.explanation,
                "confidence": match.confidence,
            })

    results.sort(key=lambda r: r["overall_score"], reverse=True)
    return {"job_id": job_id, "matches": results}


# ── Student AI Endpoints ──

@app.get("/api/students/me/readiness", tags=["Students"])
def get_my_readiness(
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    from app.ai.career_advisor import compute_readiness_score
    result = compute_readiness_score(student, db)

    # Update stored readiness score
    student.readiness_score = result["readiness_score"]
    db.commit()

    return result


@app.get("/api/students/me/skill-gaps", tags=["Students"])
def get_my_skill_gaps(
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    from app.ai.career_advisor import compute_skill_gaps
    return compute_skill_gaps(student, db)


@app.get("/api/students/me/career-roadmap", tags=["Students"])
def get_my_career_roadmap(
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    from app.ai.career_advisor import get_career_roadmap
    return get_career_roadmap(student, db)


@app.get("/api/students/me/passport", tags=["Students"])
def get_my_passport(
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    """Get the Placement Passport — comprehensive student overview."""
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    from app.ai.career_advisor import compute_readiness_score, compute_skill_gaps, get_career_roadmap
    from app.models.student_project import StudentProject
    from app.models.student_experience import StudentExperience
    from app.models.student_certification import StudentCertification

    skills = db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()
    projects = db.query(StudentProject).filter(StudentProject.student_id == student.id).all()
    experiences = db.query(StudentExperience).filter(StudentExperience.student_id == student.id).all()
    certs = db.query(StudentCertification).filter(StudentCertification.student_id == student.id).all()
    apps = db.query(Application).filter(Application.student_id == student.id).all()
    from app.models.interview import Interview
    from app.models.offer import Offer
    interview_count = db.query(Interview).join(Application).filter(Application.student_id == student.id).count()
    offer_count = db.query(Offer).join(Application).filter(Application.student_id == student.id).count()

    readiness = compute_readiness_score(student, db)
    skill_gaps = compute_skill_gaps(student, db)
    roadmap = get_career_roadmap(student, db)

    # Profile completeness
    fields = [student.name, student.phone, student.branch, student.cgpa is not None,
              student.graduation_year, student.resume_path, len(skills) > 0, len(projects) > 0]
    completeness = sum(1 for f in fields if f) / len(fields) * 100

    return {
        "student": {
            "id": student.id, "name": student.name, "branch": student.branch,
            "cgpa": student.cgpa, "graduation_year": student.graduation_year,
            "career_goal": student.career_goal,
        },
        "skills": [{"name": s.normalized_name, "proficiency": s.proficiency} for s in skills],
        "projects": [{"title": p.title, "tech_stack": p.get_tech_stack()} for p in projects],
        "experiences": [{"company": e.company, "role": e.role, "duration_months": e.duration_months} for e in experiences],
        "certifications": [{"name": c.name, "issuer": c.issuer} for c in certs],
        "readiness_score": readiness["readiness_score"],
        "readiness_factors": readiness["factors"],
        "profile_completeness": round(completeness, 1),
        "skill_gaps": [g["skill"] for g in skill_gaps["skill_gaps"][:5]],
        "skill_coverage_rate": skill_gaps["coverage_rate"],
        "career_recommendations": roadmap["immediate_actions"][:3],
        "application_count": len(apps),
        "interview_count": interview_count,
        "offer_count": offer_count,
    }


@app.get("/api/students/me/career-twin", tags=["Students"])
def get_my_career_twin(
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    """Generate explainable AI Career Twin directions based on skills, projects, and academics."""
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    skills = [s.normalized_name.lower() for s in db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()]
    
    # Pre-defined career direction archetypes with explainability rules
    archetypes = [
        {
            "role": "Full Stack / Backend Engineer",
            "required": ["python", "javascript", "react", "node", "sql", "fastapi", "django"],
            "description": "Architect scalable backend services, RESTful APIs, and responsive web systems.",
            "demand": "Very High (85% campus drives)",
        },
        {
            "role": "Data Analyst / AI Specialist",
            "required": ["python", "sql", "pandas", "numpy", "machine learning", "data analysis"],
            "description": "Transform enterprise telemetry into predictive models and actionable dashboards.",
            "demand": "High (65% campus drives)",
        },
        {
            "role": "Cloud & DevOps Associate",
            "required": ["docker", "linux", "aws", "git", "ci/cd", "kubernetes"],
            "description": "Design resilient infrastructure automation and continuous deployment pipelines.",
            "demand": "Rapidly Growing (50% campus drives)",
        },
        {
            "role": "Software Development Engineer (Core)",
            "required": ["c++", "java", "data structures", "algorithms", "problem solving"],
            "description": "Solve high-throughput algorithmic challenges with optimized low-latency software.",
            "demand": "Evergreen (90% campus drives)",
        },
    ]

    recommendations = []
    for arch in archetypes:
        matched = [r for r in arch["required"] if any(r in s for s in skills)]
        missing = [r for r in arch["required"] if not any(r in s for s in skills)]
        fit_percentage = min(int((len(matched) / max(len(arch["required"]), 1)) * 100) + (15 if student.cgpa and student.cgpa >= 7.5 else 5), 98)
        
        recommendations.append({
            "target_role": arch["role"],
            "match_confidence": fit_percentage,
            "demand_level": arch["demand"],
            "description": arch["description"],
            "matched_skills": [m.title() for m in matched],
            "recommended_skills_to_acquire": [m.title() for m in missing[:3]],
            "why_this_role": f"Matches {len(matched)} of your core skills with strong academic suitability for campus hiring.",
        })

    recommendations.sort(key=lambda x: x["match_confidence"], reverse=True)
    return {
        "student_name": student.name,
        "branch": student.branch,
        "career_twin_profiles": recommendations,
        "primary_recommendation": recommendations[0] if recommendations else None
    }


@app.get("/api/students/me/assessments", tags=["Students"])
def get_my_assessments(
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    """Retrieve all assigned online assessments, tests, deadlines, and scores."""
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # In campus placement, applications map to online tests/assessments
    apps = db.query(Application).filter(Application.student_id == student.id).all()
    tests = []
    for a in apps:
        job = db.query(Job).filter(Job.id == a.job_id).first()
        company = db.query(Company).filter(Company.id == job.company_id).first() if job else None
        
        status = "Completed" if a.status in ["interviewing", "selected", "offered", "accepted"] else "Pending" if a.status in ["shortlisted", "under_review"] else "Scheduled"
        score = 86 if status == "Completed" else None
        
        tests.append({
            "id": f"test-{a.id[:8]}",
            "application_id": a.id,
            "company_name": company.name if company else "Campus Placement",
            "job_title": job.title if job else "Technical Assessment",
            "assessment_name": f"{company.name if company else 'Technical'} Aptitude & Coding Round",
            "duration_minutes": 90,
            "total_questions": 45,
            "deadline": "2026-10-15T23:59:59",
            "status": status,
            "score": score,
            "test_link": "https://campuslink.exam-portal.internal/test/" + a.id[:8]
        })

    return tests


@app.get("/api/students/me/applications", tags=["Students"])
def get_my_applications(
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    from app.models.company import Company
    apps = db.query(Application).filter(Application.student_id == student.id).order_by(Application.applied_at.desc()).all()
    results = []
    for a in apps:
        job = db.query(Job).filter(Job.id == a.job_id).first()
        company = db.query(Company).filter(Company.id == job.company_id).first() if job else None
        match = db.query(Match).filter(Match.application_id == a.id).first()
        results.append({
            "id": a.id, "job_id": a.job_id, "status": a.status, "applied_at": a.applied_at.isoformat(),
            "job_title": job.title if job else None,
            "company_name": company.name if company else None,
            "ctc_lpa": job.ctc_lpa if job else None,
            "match_score": match.overall_score if match else None,
        })
    return results


@app.get("/api/students/me/interviews", tags=["Students"])
def get_my_interviews(
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    from app.models.company import Company
    interviews = (
        db.query(Interview).join(Application)
        .filter(Application.student_id == student.id)
        .order_by(Interview.scheduled_at.desc()).all()
    )
    results = []
    for iv in interviews:
        app_record = db.query(Application).filter(Application.id == iv.application_id).first()
        job = db.query(Job).filter(Job.id == app_record.job_id).first() if app_record else None
        company = db.query(Company).filter(Company.id == job.company_id).first() if job else None
        results.append({
            "id": iv.id, "round_name": iv.round_name, "round_number": iv.round_number,
            "scheduled_at": iv.scheduled_at.isoformat(), "duration_minutes": iv.duration_minutes,
            "location_or_link": iv.location_or_link, "status": iv.status, "result": iv.result,
            "job_title": job.title if job else None,
            "company_name": company.name if company else None,
        })
    return results


@app.get("/api/students/me/offers", tags=["Students"])
def get_my_offers(
    user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    from app.models.company import Company
    offers = (
        db.query(Offer).join(Application)
        .filter(Application.student_id == student.id)
        .order_by(Offer.created_at.desc()).all()
    )
    results = []
    for o in offers:
        app_record = db.query(Application).filter(Application.id == o.application_id).first()
        job = db.query(Job).filter(Job.id == app_record.job_id).first() if app_record else None
        company = db.query(Company).filter(Company.id == job.company_id).first() if job else None
        results.append({
            "id": o.id, "ctc_lpa": o.ctc_lpa, "role": o.role, "location": o.location,
            "joining_date": str(o.joining_date) if o.joining_date else None,
            "deadline": str(o.deadline) if o.deadline else None,
            "status": o.status, "created_at": o.created_at.isoformat(),
            "job_title": job.title if job else None,
            "company_name": company.name if company else None,
        })
    return results


# ── Notifications ──

from app.models.notification import Notification

@app.get("/api/notifications", tags=["Notifications"])
def get_notifications(
    user: User = Depends(require_role("student", "recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    notifs = db.query(Notification).filter(
        Notification.user_id == user.id
    ).order_by(Notification.created_at.desc()).limit(50).all()
    return [{"id": n.id, "title": n.title, "message": n.message,
             "link": n.link, "is_read": n.is_read, "created_at": n.created_at.isoformat()} for n in notifs]


@app.patch("/api/notifications/{notif_id}/read", tags=["Notifications"])
def mark_notification_read(
    notif_id: str,
    user: User = Depends(require_role("student", "recruiter", "tpo")),
    db: Session = Depends(get_db),
):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@app.get("/", tags=["Health"])
def root():
    return {"message": "CampusLink API is running", "version": "1.0.0", "docs": "/docs"}
