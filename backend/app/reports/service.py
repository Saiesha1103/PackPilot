from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.machine import Machine
from app.models.maintenance import Maintenance
from app.models.downtime_event import DowntimeEvent
from app.models.pfmea import PFMEA
from app.models.oee import OEERecord


def get_reports_summary(db: Session):

    # ---------------- OEE ----------------
    # Reuses the latest genuine OEERecord already stored via
    # POST /oee/calculate (app/services/oee_service.py). No new
    # OEE calculation or record is created here.

    latest_oee = (
        db.query(OEERecord)
        .order_by(OEERecord.timestamp.desc())
        .first()
    )

    if latest_oee:
        availability = latest_oee.availability
        performance = latest_oee.performance
        quality = latest_oee.quality
        oee = latest_oee.oee
    else:
        availability = None
        performance = None
        quality = None
        oee = None

    # ---------------- Maintenance ----------------

    scheduled = (
        db.query(Maintenance)
        .filter(Maintenance.status == "Scheduled")
        .count()
    )

    completed = (
        db.query(Maintenance)
        .filter(Maintenance.status == "Completed")
        .count()
    )

    overdue = (
        db.query(Maintenance)
        .filter(
            Maintenance.status == "Scheduled",
            Maintenance.scheduled_date < func.now(),
        )
        .count()
    )

    # ---------------- Downtime ----------------

    downtime_events = db.query(DowntimeEvent).count()

    downtime_minutes = (
        db.query(
            func.coalesce(
                func.sum(
                    DowntimeEvent.duration_minutes
                ),
                0,
            )
        )
        .scalar()
    )

    # ---------------- PFMEA ----------------

    high = (
        db.query(PFMEA)
        .filter(PFMEA.rpn >= 150)
        .count()
    )

    medium = (
        db.query(PFMEA)
        .filter(
            PFMEA.rpn >= 80,
            PFMEA.rpn < 150,
        )
        .count()
    )

    low = (
        db.query(PFMEA)
        .filter(PFMEA.rpn < 80)
        .count()
    )

    # ---------------- Production ----------------

    machines = db.query(Machine).count()

    active = (
        db.query(Machine)
        .filter(Machine.status == "Running")
        .count()
    )

    stopped = (
        db.query(Machine)
        .filter(Machine.status == "Stopped")
        .count()
    )

    return {
        "oee": {
            "availability": availability,
            "performance": performance,
            "quality": quality,
            "oee": oee,
        },
        "maintenance": {
            "scheduled": scheduled,
            "completed": completed,
            "overdue": overdue,
        },
        "downtime": {
            "events": downtime_events,
            "minutes": downtime_minutes,
        },
        "pfmea": {
            "high_risk": high,
            "medium_risk": medium,
            "low_risk": low,
        },
        "production": {
            "machines": machines,
            "active": active,
            "stopped": stopped,
        },
    }