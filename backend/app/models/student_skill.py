import uuid
from datetime import datetime, timezone
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name: Mapped[str] = mapped_column(String(100), nullable=False)
    normalized_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    proficiency: Mapped[str] = mapped_column(String(20), default="intermediate")  # beginner, intermediate, advanced, expert
    source: Mapped[str] = mapped_column(String(50), default="manual")  # manual, resume_parsed

    # Relationships
    student = relationship("Student", back_populates="skills")
