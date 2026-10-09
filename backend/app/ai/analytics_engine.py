"""
Analytics Engine — Generate data-driven insights with recommended actions.

Format: DATA → INSIGHT → RECOMMENDED ACTION
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.student import Student
from app.models.company import Company
from app.models.job import Job
from app.models.application import Application
from app.models.offer import Offer
from app.models.interview import Interview
from app.models.student_skill import StudentSkill


def generate_insights(db: Session) -> list[dict]:
    """Generate AI-powered insights for TPO dashboard."""
    insights = []

    # ── Insight 1: Overall Placement Rate ──
    total_students = db.query(Student).count()
    placed = db.query(Offer).filter(Offer.status.in_(["accepted", "joined"])).count()
    rate = (placed / total_students * 100) if total_students > 0 else 0

    insights.append({
        "category": "Placement Rate",
        "metric": "Overall Placement Rate",
        "value": f"{rate:.1f}%",
        "trend": "neutral",
        "insight": f"{placed} out of {total_students} students have been placed so far.",
        "recommended_action": "Focus placement drives on unplaced students with targeted company outreach." if rate < 80 else "Strong placement rate. Continue current strategy.",
        "priority": "high" if rate < 60 else "medium",
    })

    # ── Insight 2: Skill Gap Analysis ──
    active_jobs = db.query(Job).filter(Job.status == "active").all()
    demand = {}
    for job in active_jobs:
        for skill in job.get_mandatory_skills():
            demand[skill] = demand.get(skill, 0) + 1

    all_skills = db.query(StudentSkill).all()
    supply = {}
    for s in all_skills:
        supply[s.normalized_name] = supply.get(s.normalized_name, 0) + 1

    top_gaps = []
    for skill, d_count in sorted(demand.items(), key=lambda x: x[1], reverse=True)[:5]:
        s_count = supply.get(skill, 0)
        if d_count > s_count:
            top_gaps.append(f"{skill} (demand: {d_count}, supply: {s_count})")

    if top_gaps:
        insights.append({
            "category": "Skill Intelligence",
            "metric": "Top Skill Gaps",
            "value": f"{len(top_gaps)} critical gaps",
            "trend": "needs_attention",
            "insight": f"Critical skill gaps identified: {'; '.join(top_gaps[:3])}",
            "recommended_action": "Organize targeted workshops or online training for the most in-demand skills.",
            "priority": "high",
        })

    # ── Insight 3: Interview Conversion Rate ──
    total_interviews = db.query(Interview).filter(Interview.status == "completed").count()
    selections = db.query(Interview).filter(Interview.result == "selected").count()
    conversion = (selections / total_interviews * 100) if total_interviews > 0 else 0

    insights.append({
        "category": "Interview Performance",
        "metric": "Interview Conversion Rate",
        "value": f"{conversion:.1f}%",
        "trend": "neutral",
        "insight": f"{selections} out of {total_interviews} completed interviews resulted in selection.",
        "recommended_action": "Implement mock interview sessions to improve student preparation." if conversion < 50 else "Good conversion rate. Maintain interview prep resources.",
        "priority": "high" if conversion < 30 else "medium",
    })

    # ── Insight 4: Application Engagement ──
    students_with_apps = db.query(Application.student_id).distinct().count()
    inactive = total_students - students_with_apps

    if inactive > 0:
        insights.append({
            "category": "Student Engagement",
            "metric": "Inactive Students",
            "value": f"{inactive} students",
            "trend": "needs_attention",
            "insight": f"{inactive} students have not applied to any job yet.",
            "recommended_action": "Send personalized notifications and career counseling sessions to engage inactive students.",
            "priority": "high" if inactive > total_students * 0.3 else "medium",
        })

    # ── Insight 5: Company Diversity ──
    companies_hiring = db.query(Job.company_id).filter(Job.status == "active").distinct().count()
    total_companies = db.query(Company).count()

    insights.append({
        "category": "Company Relations",
        "metric": "Active Hiring Companies",
        "value": f"{companies_hiring}/{total_companies}",
        "trend": "neutral",
        "insight": f"{companies_hiring} out of {total_companies} registered companies have active job postings.",
        "recommended_action": "Reach out to inactive companies to create new job opportunities." if companies_hiring < total_companies else "All companies are actively hiring.",
        "priority": "medium",
    })

    # ── Insight 6: Package Trends ──
    avg_pkg = db.query(func.avg(Offer.ctc_lpa)).filter(
        Offer.status.in_(["accepted", "joined"])
    ).scalar()
    max_pkg = db.query(func.max(Offer.ctc_lpa)).filter(
        Offer.status.in_(["accepted", "joined"])
    ).scalar()

    if avg_pkg:
        insights.append({
            "category": "Compensation",
            "metric": "Average Package",
            "value": f"{float(avg_pkg):.1f} LPA",
            "trend": "neutral",
            "insight": f"Average package is {float(avg_pkg):.1f} LPA with highest at {float(max_pkg):.1f} LPA.",
            "recommended_action": "Invite higher-paying companies to improve average package." if float(avg_pkg) < 8 else "Package distribution is healthy.",
            "priority": "medium",
        })

    return insights
