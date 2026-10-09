"""
Risk Scorer — Multi-signal at-risk student detection.

6 signals: Academic, Skill Readiness, Projects/Experience,
           Placement Participation, Interview Performance, Profile Completeness.
All thresholds are configurable constants.
"""

from sqlalchemy.orm import Session
from app.models.student import Student
from app.models.student_skill import StudentSkill
from app.models.student_project import StudentProject
from app.models.student_experience import StudentExperience
from app.models.application import Application
from app.models.interview import Interview
from app.models.job import Job

# ── CONFIGURABLE THRESHOLDS ──
LOW_CGPA = 6.0
CRITICAL_CGPA = 5.0
MIN_DEMANDED_SKILLS = 3
MIN_PROJECTS = 1
LOW_APPLICATION_RATE = 0.2
HIGH_REJECT_RATE = 0.7
MIN_COMPLETENESS = 0.6


def compute_risk_score(student: Student, db: Session) -> dict:
    """Compute a risk score for a single student.

    Returns dict with: risk_score (0-100), risk_level, contributing_factors, recommendations
    """
    factors = []

    # ── Signal 1: Academic Performance (20%) ──
    cgpa = student.cgpa or 0
    if cgpa >= 8.0:
        academic_risk = 0.0
    elif cgpa >= 7.0:
        academic_risk = 0.2
    elif cgpa >= LOW_CGPA:
        academic_risk = 0.5
    elif cgpa >= CRITICAL_CGPA:
        academic_risk = 0.8
    else:
        academic_risk = 1.0

    if student.active_backlogs > 0:
        academic_risk = min(academic_risk + 0.3, 1.0)

    if academic_risk > 0.3:
        detail = f"CGPA: {cgpa}"
        if student.active_backlogs > 0:
            detail += f", {student.active_backlogs} active backlog(s)"
        factors.append({"signal": "Academic Performance", "score": academic_risk, "detail": detail})

    # ── Signal 2: Skill Readiness (25%) ──
    # Get top demanded skills
    active_jobs = db.query(Job).filter(Job.status == "active").all()
    demand = {}
    for job in active_jobs:
        for skill in job.get_mandatory_skills():
            demand[skill.lower()] = demand.get(skill.lower(), 0) + 1

    top_demanded = sorted(demand.keys(), key=lambda k: demand[k], reverse=True)[:10]
    student_skills = set(
        s.normalized_name.lower()
        for s in db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()
    )

    if top_demanded:
        skill_coverage = len(student_skills & set(top_demanded)) / len(top_demanded)
        skill_risk = 1.0 - skill_coverage
    else:
        skill_risk = 0.3  # Neutral if no jobs active

    if skill_risk > 0.3:
        missing = [s.title() for s in top_demanded if s not in student_skills][:5]
        factors.append({
            "signal": "Skill Readiness", "score": skill_risk,
            "detail": f"Missing demanded skills: {', '.join(missing)}"
        })

    # ── Signal 3: Projects & Experience (15%) ──
    project_count = db.query(StudentProject).filter(StudentProject.student_id == student.id).count()
    has_experience = db.query(StudentExperience).filter(StudentExperience.student_id == student.id).count() > 0

    if project_count >= 3 and has_experience:
        project_risk = 0.0
    elif project_count >= 2:
        project_risk = 0.2
    elif project_count >= 1:
        project_risk = 0.5
    elif has_experience:
        project_risk = 0.4
    else:
        project_risk = 1.0

    if project_risk > 0.3:
        factors.append({
            "signal": "Projects & Experience", "score": project_risk,
            "detail": f"{project_count} project(s), {'has' if has_experience else 'no'} internship/experience"
        })

    # ── Signal 4: Placement Participation (15%) ──
    eligible_count = 0
    for job in active_jobs:
        from app.ai.eligibility_engine import check_eligibility
        elig_data = {
            "branch": student.branch, "cgpa": student.cgpa,
            "active_backlogs": student.active_backlogs,
            "graduation_year": student.graduation_year,
            "total_experience_months": 0,
        }
        job_data = {
            "eligible_branches": job.get_eligible_branches(),
            "min_cgpa": job.min_cgpa, "max_backlogs": job.max_backlogs,
            "required_batch": job.required_batch,
            "min_experience_months": job.min_experience_months,
        }
        result = check_eligibility(elig_data, job_data)
        if result["eligible"]:
            eligible_count += 1

    applied_count = db.query(Application).filter(Application.student_id == student.id).count()

    if eligible_count == 0:
        participation_risk = 0.5
    else:
        application_rate = applied_count / eligible_count
        if application_rate >= 0.5:
            participation_risk = 0.0
        elif application_rate >= LOW_APPLICATION_RATE:
            participation_risk = 0.4
        else:
            participation_risk = 0.9

    if participation_risk > 0.3:
        factors.append({
            "signal": "Placement Participation", "score": participation_risk,
            "detail": f"Applied to {applied_count} of {eligible_count} eligible jobs"
        })

    # ── Signal 5: Interview Performance (15%) ──
    interviews = db.query(Interview).join(Application).filter(
        Application.student_id == student.id,
        Interview.status == "completed",
    ).all()

    total_interviews = len(interviews)
    rejections = sum(1 for iv in interviews if iv.result == "rejected")

    if total_interviews == 0:
        interview_risk = 0.3
    else:
        reject_rate = rejections / total_interviews
        if reject_rate <= 0.3:
            interview_risk = 0.0
        elif reject_rate <= HIGH_REJECT_RATE:
            interview_risk = 0.5
        else:
            interview_risk = 1.0

    if interview_risk > 0.3:
        factors.append({
            "signal": "Interview Performance", "score": interview_risk,
            "detail": f"{rejections}/{total_interviews} interviews resulted in rejection"
        })

    # ── Signal 6: Profile Completeness (10%) ──
    fields = [
        student.name, student.phone, student.branch,
        student.cgpa is not None, student.graduation_year,
        student.resume_path, len(student_skills) >= 1,
        project_count >= 1,
    ]
    completeness = sum(1 for f in fields if f) / len(fields)
    completeness_risk = 1.0 - completeness

    if completeness_risk > 0.3:
        factors.append({
            "signal": "Profile Completeness", "score": completeness_risk,
            "detail": f"Profile {int(completeness * 100)}% complete"
        })

    # ── Composite Score ──
    risk_score = round((
        academic_risk * 0.20 +
        skill_risk * 0.25 +
        project_risk * 0.15 +
        participation_risk * 0.15 +
        interview_risk * 0.15 +
        completeness_risk * 0.10
    ) * 100, 1)

    # ── Risk Level ──
    if risk_score <= 25:
        risk_level = "low"
    elif risk_score <= 50:
        risk_level = "medium"
    elif risk_score <= 75:
        risk_level = "high"
    else:
        risk_level = "critical"

    # ── Generate Recommendations ──
    recommendations = []
    for factor in sorted(factors, key=lambda f: f["score"], reverse=True):
        signal = factor["signal"]
        if signal == "Skill Readiness":
            recommendations.append({
                "priority": "high",
                "action": f"Learn missing skills: {factor['detail'].replace('Missing demanded skills: ', '')}",
                "reason": "These skills are in high demand across active job postings"
            })
        elif signal == "Placement Participation":
            recommendations.append({
                "priority": "high",
                "action": "Apply to more eligible positions",
                "reason": "Low application rate suggests disengagement from placement process"
            })
        elif signal == "Projects & Experience":
            recommendations.append({
                "priority": "medium",
                "action": "Build more projects or seek internship opportunities",
                "reason": "Practical experience significantly improves selection chances"
            })
        elif signal == "Academic Performance":
            recommendations.append({
                "priority": "medium",
                "action": "Clear backlogs and improve academic performance",
                "reason": "Many companies have minimum CGPA requirements"
            })
        elif signal == "Interview Performance":
            recommendations.append({
                "priority": "high",
                "action": "Practice mock interviews and review past feedback",
                "reason": "High rejection rate in interviews needs targeted improvement"
            })
        elif signal == "Profile Completeness":
            recommendations.append({
                "priority": "low",
                "action": "Complete placement profile with all details",
                "reason": "Incomplete profiles may miss matching opportunities"
            })

    return {
        "student_id": student.id,
        "student_name": student.name,
        "branch": student.branch,
        "cgpa": student.cgpa,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "contributing_factors": factors,
        "recommendations": recommendations,
    }


def compute_all_risk_scores(db: Session) -> list[dict]:
    """Compute risk scores for all students, sorted by risk (highest first)."""
    students = db.query(Student).all()
    results = []
    for student in students:
        risk = compute_risk_score(student, db)
        if risk["risk_level"] in ("medium", "high", "critical"):
            results.append(risk)

    results.sort(key=lambda r: r["risk_score"], reverse=True)
    return results
