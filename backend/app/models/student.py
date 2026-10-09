import uuid
import json
from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    branch: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    cgpa: Mapped[float | None] = mapped_column(Float, nullable=True)
    graduation_year: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    active_backlogs: Mapped[int] = mapped_column(Integer, default=0)
    resume_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    parsed_resume: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    readiness_score: Mapped[float] = mapped_column(Float, default=0.0)
    career_goal: Mapped[str | None] = mapped_column(Text, nullable=True)
    profile_complete: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="student")
    skills = relationship("StudentSkill", back_populates="student", cascade="all, delete-orphan")
    projects = relationship("StudentProject", back_populates="student", cascade="all, delete-orphan")
    experiences = relationship("StudentExperience", back_populates="student", cascade="all, delete-orphan")
    certifications = relationship("StudentCertification", back_populates="student", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student")
    risk_assessments = relationship("RiskAssessment", back_populates="student")

    def get_parsed_resume(self) -> dict | None:
        if self.parsed_resume:
            return json.loads(self.parsed_resume)
        return None

    def set_parsed_resume(self, data: dict):
        self.parsed_resume = json.dumps(data)
