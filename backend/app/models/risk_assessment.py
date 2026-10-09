import uuid
import json
from datetime import datetime, timezone
from sqlalchemy import String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("students.id"), nullable=False, index=True)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)  # low, medium, high, critical
    contributing_factors: Mapped[str] = mapped_column(Text, nullable=False)  # JSON
    recommendations: Mapped[str] = mapped_column(Text, default="[]")  # JSON array
    assessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    student = relationship("Student", back_populates="risk_assessments")

    def get_contributing_factors(self) -> list[dict]:
        return json.loads(self.contributing_factors) if self.contributing_factors else []

    def get_recommendations(self) -> list[dict]:
        return json.loads(self.recommendations) if self.recommendations else []
