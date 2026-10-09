import uuid
import json
from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), nullable=False, index=True)
    drive_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("placement_drives.id"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    role_type: Mapped[str | None] = mapped_column(String(100), nullable=True)  # Full-time, Internship, etc.
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ctc_lpa: Mapped[float | None] = mapped_column(Float, nullable=True)
    deadline: Mapped[datetime | None] = mapped_column(Date, nullable=True)

    # Eligibility criteria stored as JSON strings for SQLite compatibility
    eligible_branches: Mapped[str] = mapped_column(Text, default="[]")  # JSON array
    min_cgpa: Mapped[float] = mapped_column(Float, default=0.0)
    max_backlogs: Mapped[int] = mapped_column(Integer, default=0)
    required_batch: Mapped[int | None] = mapped_column(Integer, nullable=True)
    mandatory_skills: Mapped[str] = mapped_column(Text, default="[]")  # JSON array
    preferred_skills: Mapped[str] = mapped_column(Text, default="[]")  # JSON array
    min_experience_months: Mapped[int] = mapped_column(Integer, default=0)
    selection_process: Mapped[str] = mapped_column(Text, default="[]")  # JSON array

    raw_jd: Mapped[str | None] = mapped_column(Text, nullable=True)
    jd_file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    parsed_jd: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    status: Mapped[str] = mapped_column(String(20), default="draft", index=True)  # draft, active, closed, cancelled
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    company = relationship("Company", back_populates="jobs")
    drive = relationship("PlacementDrive", back_populates="jobs")
    applications = relationship("Application", back_populates="job")

    # JSON field helpers
    def get_eligible_branches(self) -> list[str]:
        return json.loads(self.eligible_branches) if self.eligible_branches else []

    def set_eligible_branches(self, branches: list[str]):
        self.eligible_branches = json.dumps(branches)

    def get_mandatory_skills(self) -> list[str]:
        return json.loads(self.mandatory_skills) if self.mandatory_skills else []

    def set_mandatory_skills(self, skills: list[str]):
        self.mandatory_skills = json.dumps(skills)

    def get_preferred_skills(self) -> list[str]:
        return json.loads(self.preferred_skills) if self.preferred_skills else []

    def set_preferred_skills(self, skills: list[str]):
        self.preferred_skills = json.dumps(skills)

    def get_selection_process(self) -> list[str]:
        return json.loads(self.selection_process) if self.selection_process else []

    def set_selection_process(self, steps: list[str]):
        self.selection_process = json.dumps(steps)
