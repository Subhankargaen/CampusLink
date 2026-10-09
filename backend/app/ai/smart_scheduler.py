"""
Smart Scheduler — Interview conflict detection and alternative slot generation.
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.interview import Interview
from app.models.application import Application


def check_student_conflicts(
    db: Session,
    student_id: str,
    proposed_start: datetime,
    duration_minutes: int = 60,
) -> dict:
    """Check if a student has any scheduling conflicts at the proposed time."""
    proposed_end = proposed_start + timedelta(minutes=duration_minutes)

    # Get all scheduled interviews for this student
    student_interviews = (
        db.query(Interview)
        .join(Application)
        .filter(
            Application.student_id == student_id,
            Interview.status == "scheduled",
        )
        .all()
    )

    conflicts = []
    for iv in student_interviews:
        iv_end = iv.scheduled_at + timedelta(minutes=iv.duration_minutes)
        if iv.scheduled_at < proposed_end and proposed_start < iv_end:
            conflicts.append({
                "type": "interview",
                "interview_id": iv.id,
                "round_name": iv.round_name,
                "start": iv.scheduled_at.isoformat(),
                "end": iv_end.isoformat(),
                "detail": f"Interview '{iv.round_name}' from {iv.scheduled_at.strftime('%H:%M')} to {iv_end.strftime('%H:%M')}",
            })

    alternatives = []
    if conflicts:
        alternatives = _suggest_alternatives(
            db, student_id, proposed_start, duration_minutes, count=3
        )

    return {
        "has_conflict": len(conflicts) > 0,
        "conflicts": conflicts,
        "alternatives": alternatives,
    }


def suggest_available_slots(
    db: Session,
    student_id: str,
    date_start: str,
    date_end: str,
    time_start: str = "09:00",
    time_end: str = "17:00",
    duration_minutes: int = 60,
) -> list[dict]:
    """Generate available interview slots for a student within a date/time range."""
    start_date = datetime.strptime(date_start, "%Y-%m-%d").date()
    end_date = datetime.strptime(date_end, "%Y-%m-%d").date()
    t_start = datetime.strptime(time_start, "%H:%M").time()
    t_end = datetime.strptime(time_end, "%H:%M").time()

    candidate_slots = _generate_slots(start_date, end_date, t_start, t_end, duration_minutes)

    available = []
    for slot_start, slot_end in candidate_slots:
        result = check_student_conflicts(db, student_id, slot_start, duration_minutes)
        if not result["has_conflict"]:
            available.append({
                "start": slot_start.isoformat(),
                "end": slot_end.isoformat(),
                "date": slot_start.strftime("%Y-%m-%d"),
                "time": slot_start.strftime("%H:%M"),
            })

    return available[:20]  # Return max 20 slots


def _generate_slots(
    start_date,
    end_date,
    time_start,
    time_end,
    duration_minutes: int,
    gap_minutes: int = 15,
) -> list[tuple[datetime, datetime]]:
    """Generate all possible time slots within the given constraints."""
    slots = []
    current_date = start_date
    delta = timedelta(days=1)

    while current_date <= end_date:
        # Skip weekends
        if current_date.weekday() < 5:  # Monday=0 to Friday=4
            current = datetime.combine(current_date, time_start)
            end_of_day = datetime.combine(current_date, time_end)

            while current + timedelta(minutes=duration_minutes) <= end_of_day:
                slot_end = current + timedelta(minutes=duration_minutes)
                slots.append((current, slot_end))
                current += timedelta(minutes=duration_minutes + gap_minutes)

        current_date += delta

    return slots


def _suggest_alternatives(
    db: Session,
    student_id: str,
    original_start: datetime,
    duration_minutes: int,
    count: int = 3,
) -> list[dict]:
    """Suggest alternative slots near the original requested time."""
    # Search ±2 days from original date, same time window (9am-5pm)
    search_start = (original_start - timedelta(days=2)).date()
    search_end = (original_start + timedelta(days=2)).date()

    from datetime import time
    t_start = time(9, 0)
    t_end = time(17, 0)

    candidate_slots = _generate_slots(search_start, search_end, t_start, t_end, duration_minutes)

    available = []
    for slot_start, slot_end in candidate_slots:
        result = check_student_conflicts(db, student_id, slot_start, duration_minutes)
        if not result["has_conflict"]:
            available.append({
                "start": slot_start.isoformat(),
                "end": slot_end.isoformat(),
                "date": slot_start.strftime("%Y-%m-%d"),
                "time": slot_start.strftime("%H:%M"),
                "distance_hours": abs((slot_start - original_start).total_seconds() / 3600),
            })

    # Sort by proximity to original time
    available.sort(key=lambda s: s["distance_hours"])

    # Remove distance_hours from output
    for s in available:
        del s["distance_hours"]

    return available[:count]
