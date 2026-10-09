import uuid
import json
from datetime import datetime, timezone
from sqlalchemy import String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class StudentProject(Base):
    __tablename__ = "student_projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    tech_stack: Mapped[str] = mapped_column(Text, default="[]")  # JSON array
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    start_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    student = relationship("Student", back_populates="projects")

    def get_tech_stack(self) -> list[str]:
        return json.loads(self.tech_stack) if self.tech_stack else []

    def set_tech_stack(self, stack: list[str]):
        self.tech_stack = json.dumps(stack)
