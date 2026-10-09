import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id: Mapped[str] = mapped_column(String(36), ForeignKey("applications.id"), unique=True, nullable=False)
    ctc_lpa: Mapped[float] = mapped_column(Float, nullable=False)
    role: Mapped[str | None] = mapped_column(String(255), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    joining_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    deadline: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="extended")
    # Status values: extended, accepted, declined, expired, joined, not_joined
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    application = relationship("Application", back_populates="offer")
