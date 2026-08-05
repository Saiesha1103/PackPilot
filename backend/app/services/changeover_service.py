from datetime import datetime

from sqlalchemy.orm import Session

from app.models.changeover import Changeover
from app.models.machine import Machine
from app.schemas.changeover_schema import (
    ChangeoverCreate,
    ChangeoverClose,
)


def create_changeover(
    db: Session,
    data: ChangeoverCreate
):
    machine = (
        db.query(Machine)
        .filter(Machine.id == data.machine_id)
        .first()
    )

    if machine is None:
        return None

    changeover = Changeover(
        machine_id=data.machine_id,
        from_product=data.from_product,
        to_product=data.to_product,
        start_time=datetime.utcnow(),
    )

    db.add(changeover)
    db.commit()
    db.refresh(changeover)

    return changeover


def get_all_changeovers(
    db: Session
):
    return (
        db.query(Changeover)
        .order_by(Changeover.start_time.desc())
        .all()
    )


def get_changeover(
    db: Session,
    changeover_id: int
):
    return (
        db.query(Changeover)
        .filter(Changeover.id == changeover_id)
        .first()
    )


def close_changeover(
    db: Session,
    changeover_id: int,
    data: ChangeoverClose
):
    changeover = get_changeover(
        db,
        changeover_id
    )

    if changeover is None:
        return None

    end_time = data.end_time or datetime.utcnow()

    if end_time < changeover.start_time:
        raise ValueError(
            "End time cannot be before start time"
        )

    duration_seconds = (
        end_time - changeover.start_time
    ).total_seconds()

    changeover.end_time = end_time
    changeover.duration_minutes = round(
        duration_seconds / 60
    )

    db.commit()
    db.refresh(changeover)

    return changeover


def get_changeover_analytics(
    db: Session
):
    completed = (
        db.query(Changeover)
        .filter(
            Changeover.duration_minutes.isnot(None)
        )
        .all()
    )

    total_changeovers = len(completed)

    total_changeover_minutes = sum(
        changeover.duration_minutes or 0
        for changeover in completed
    )

    average_duration_minutes = (
        total_changeover_minutes / total_changeovers
        if total_changeovers > 0
        else 0
    )

    return {
        "total_changeovers": total_changeovers,
        "average_duration_minutes": round(
            average_duration_minutes,
            2
        ),
        "total_changeover_minutes":
            total_changeover_minutes,
    }