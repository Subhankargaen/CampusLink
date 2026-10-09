# Models Package - Import all models for Alembic and table creation
from app.models.user import User
from app.models.student import Student
from app.models.company import Company
from app.models.recruiter import Recruiter
from app.models.job import Job
from app.models.student_skill import StudentSkill
from app.models.student_project import StudentProject
from app.models.student_experience import StudentExperience
from app.models.student_certification import StudentCertification
from app.models.placement_drive import PlacementDrive
from app.models.application import Application
from app.models.match import Match
from app.models.interview import Interview
from app.models.offer import Offer
from app.models.risk_assessment import RiskAssessment
from app.models.notification import Notification

__all__ = [
    "User", "Student", "Company", "Recruiter", "Job",
    "StudentSkill", "StudentProject", "StudentExperience", "StudentCertification",
    "PlacementDrive", "Application", "Match", "Interview", "Offer",
    "RiskAssessment", "Notification",
]
