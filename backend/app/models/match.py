import uuid
import json
from datetime import datetime, timezone
from sqlalchemy import String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id: Mapped[str] = mapped_column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), unique=True, nullable=False)
    overall_score: Mapped[float] = mapped_column(Float, nullable=False)
    factor_scores: Mapped[str] = mapped_column(Text, nullable=False)  # JSON
    matched_skills: Mapped[str] = mapped_column(Text, default="[]")  # JSON array
    missing_skills: Mapped[str] = mapped_column(Text, default="[]")  # JSON array
    relevant_projects: Mapped[str] = mapped_column(Text, default="[]")  # JSON array
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.80)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    application = relationship("Application", back_populates="match")

    def get_factor_scores(self) -> dict:
        return json.loads(self.factor_scores) if self.factor_scores else {}

    def get_matched_skills(self) -> list[str]:
        return json.loads(self.matched_skills) if self.matched_skills else []

    def get_missing_skills(self) -> list[str]:
        return json.loads(self.missing_skills) if self.missing_skills else []
