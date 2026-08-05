from datetime import datetime

from sqlalchemy.orm import Session

from app.models.maintenance import Maintenance


def create_maintenance(db: Session, maintenance):
    job = Maintenance(
        machine_id=maintenance.machine_id,
        maintenance_type=maintenance.maintenance_type,
        description=maintenance.description,
        scheduled_date=maintenance.scheduled_date,
        status="Scheduled",
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


def get_all_maintenance(db: Session):
    return (
        db.query(Maintenance)
        .order_by(Maintenance.scheduled_date.asc())
        .all()
    )


def get_upcoming_maintenance(db: Session):
    return (
        db.query(Maintenance)
        .filter(Maintenance.status == "Scheduled")
        .order_by(Maintenance.scheduled_date.asc())
        .all()
    )


def get_completed_maintenance(db: Session):
    return (
        db.query(Maintenance)
        .filter(Maintenance.status == "Completed")
        .order_by(Maintenance.completed_date.desc())
        .all()
    )


def complete_maintenance(
    db: Session,
    maintenance_id: int,
):
    job = (
        db.query(Maintenance)
        .filter(Maintenance.id == maintenance_id)
        .first()
    )

    if job is None:
        return None

    job.status = "Completed"
    job.completed_date = datetime.utcnow()

    db.commit()
    db.refresh(job)

    return job