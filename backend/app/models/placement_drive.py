import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Date, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class PlacementDrive(Base):
    __tablename__ = "placement_drives"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False)
    start_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="upcoming")  # upcoming, active, completed
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    jobs = relationship("Job", back_populates="drive")
