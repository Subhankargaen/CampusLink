import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint("student_id", "job_id", name="uq_student_job"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("students.id"), nullable=False, index=True)
    job_id: Mapped[str] = mapped_column(String(36), ForeignKey("jobs.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="applied", index=True)
    # Status values: applied, shortlisted, rejected, interview, offered, accepted, withdrawn
    applied_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    student = relationship("Student", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    match = relationship("Match", back_populates="application", uselist=False)
    interviews = relationship("Interview", back_populates="application")
    offer = relationship("Offer", back_populates="application", uselist=False)
