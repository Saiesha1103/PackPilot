from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.machine import Machine
from app.models.maintenance import Maintenance
from app.models.downtime_event import DowntimeEvent
from app.models.pfmea import PFMEA


def get_reports_summary(db: Session):

    # ---------------- OEE ----------------

    availability = 92
    performance = 88
    quality = 97

    oee = round(
        availability
        * performance
        * quality
        / 10000,
        2,
    )

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