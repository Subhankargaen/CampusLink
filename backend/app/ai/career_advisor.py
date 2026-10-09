"""
Career Advisor — Skill gap analysis and career recommendations for students.
"""

from sqlalchemy.orm import Session
from app.models.student import Student
from app.models.student_skill import StudentSkill
from app.models.job import Job


def compute_readiness_score(student: Student, db: Session) -> dict:
    """Compute a placement readiness score for a student."""
    from app.models.student_project import StudentProject
    from app.models.student_experience import StudentExperience
    from app.models.student_certification import StudentCertification

    skills = db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()
    projects = db.query(StudentProject).filter(StudentProject.student_id == student.id).all()
    experiences = db.query(StudentExperience).filter(StudentExperience.student_id == student.id).all()
    certs = db.query(StudentCertification).filter(StudentCertification.student_id == student.id).all()

    # Factor scores (each 0-100)
    profile_score = 0
    if student.name: profile_score += 15
    if student.phone: profile_score += 10
    if student.branch: profile_score += 15
    if student.cgpa is not None: profile_score += 15
    if student.graduation_year: profile_score += 10
    if student.resume_path: profile_score += 20
    if student.career_goal: profile_score += 15

    skill_score = min(len(skills) * 15, 100)
    project_score = min(len(projects) * 30, 100)
    experience_score = min(len(experiences) * 40, 100)
    cert_score = min(len(certs) * 25, 100)

    # Weighted readiness
    readiness = (
        profile_score * 0.20 +
        skill_score * 0.25 +
        project_score * 0.25 +
        experience_score * 0.20 +
        cert_score * 0.10
    )

    return {
        "readiness_score": round(readiness, 1),
        "factors": {
            "profile_completeness": {"score": profile_score, "max": 100},
            "skills": {"score": skill_score, "max": 100, "count": len(skills)},
            "projects": {"score": project_score, "max": 100, "count": len(projects)},
            "experience": {"score": experience_score, "max": 100, "count": len(experiences)},
            "certifications": {"score": cert_score, "max": 100, "count": len(certs)},
        }
    }


def compute_skill_gaps(student: Student, db: Session) -> dict:
    """Identify skill gaps for a student vs market demand."""
    student_skills = set(
        s.normalized_name.lower()
        for s in db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()
    )

    active_jobs = db.query(Job).filter(Job.status == "active").all()
    demand = {}
    for job in active_jobs:
        for skill in job.get_mandatory_skills() + job.get_preferred_skills():
            skill_lower = skill.lower()
            demand[skill_lower] = demand.get(skill_lower, 0) + 1

    # Sort by demand
    sorted_demand = sorted(demand.items(), key=lambda x: x[1], reverse=True)

    gaps = []
    owned = []
    for skill, count in sorted_demand:
        if skill in student_skills:
            owned.append({"skill": skill.title(), "demand_count": count})
        else:
            gaps.append({"skill": skill.title(), "demand_count": count})

    return {
        "skill_gaps": gaps[:15],
        "owned_demanded_skills": owned,
        "total_demanded": len(sorted_demand),
        "coverage_rate": round(len(owned) / len(sorted_demand) * 100, 1) if sorted_demand else 100,
    }


def get_career_roadmap(student: Student, db: Session) -> dict:
    """Generate personalized career recommendations."""
    skill_gap_data = compute_skill_gaps(student, db)

    recommendations = []
    for i, gap in enumerate(skill_gap_data["skill_gaps"][:10]):
        priority = "high" if i < 3 else ("medium" if i < 6 else "low")
        recommendations.append({
            "skill": gap["skill"],
            "priority": priority,
            "reason": f"Demanded by {gap['demand_count']} active job posting(s)",
            "action": f"Learn {gap['skill']} through online courses or projects",
        })

    return {
        "career_goal": student.career_goal,
        "current_coverage": skill_gap_data["coverage_rate"],
        "recommendations": recommendations,
        "immediate_actions": [r for r in recommendations if r["priority"] == "high"],
        "medium_term": [r for r in recommendations if r["priority"] == "medium"],
        "nice_to_have": [r for r in recommendations if r["priority"] == "low"],
    }
