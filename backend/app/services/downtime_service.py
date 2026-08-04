from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.downtime_event import DowntimeEvent
from app.models.machine import Machine
from app.schemas.downtime_schema import (
    DowntimeCreate,
    DowntimeClose,
)


def create_downtime_event(
    db: Session,
    data: DowntimeCreate
):
    machine = (
        db.query(Machine)
        .filter(Machine.id == data.machine_id)
        .first()
    )

    if machine is None:
        return None

    event = DowntimeEvent(
        machine_id=data.machine_id,
        reason=data.reason,
        start_time=datetime.utcnow(),
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event


def get_all_downtime_events(
    db: Session
):
    return (
        db.query(DowntimeEvent)
        .order_by(DowntimeEvent.start_time.desc())
        .all()
    )


def get_downtime_event(
    db: Session,
    event_id: int
):
    return (
        db.query(DowntimeEvent)
        .filter(DowntimeEvent.id == event_id)
        .first()
    )


def close_downtime_event(
    db: Session,
    event_id: int,
    data: DowntimeClose
):
    event = get_downtime_event(
        db,
        event_id
    )

    if event is None:
        return None

    end_time = data.end_time or datetime.utcnow()

    if end_time < event.start_time:
        raise ValueError(
            "End time cannot be before start time"
        )

    duration_seconds = (
        end_time - event.start_time
    ).total_seconds()

    event.end_time = end_time
    event.duration_minutes = round(
        duration_seconds / 60
    )

    db.commit()
    db.refresh(event)

    return event


def get_downtime_analytics(
    db: Session
):
    completed_events = (
        db.query(DowntimeEvent)
        .filter(
            DowntimeEvent.duration_minutes.isnot(None)
        )
        .all()
    )

    total_events = len(completed_events)

    total_downtime_minutes = sum(
        event.duration_minutes or 0
        for event in completed_events
    )

    average_downtime_minutes = (
        total_downtime_minutes / total_events
        if total_events > 0
        else 0
    )

    top_reason_row = (
        db.query(
            DowntimeEvent.reason,
            func.count(DowntimeEvent.id).label("count")
        )
        .group_by(DowntimeEvent.reason)
        .order_by(
            func.count(DowntimeEvent.id).desc()
        )
        .first()
    )

    top_reason = (
        top_reason_row[0]
        if top_reason_row
        else None
    )

    return {
        "total_events": total_events,
        "total_downtime_minutes":
            total_downtime_minutes,
        "average_downtime_minutes":
            round(average_downtime_minutes, 2),
        "top_reason": top_reason,
    }
def get_downtime_by_reason(
    db: Session
):
    rows = (
        db.query(
            DowntimeEvent.reason,
            func.count(
                DowntimeEvent.id
            ).label("event_count"),
            func.coalesce(
                func.sum(
                    DowntimeEvent.duration_minutes
                ),
                0
            ).label("total_downtime_minutes"),
        )
        .group_by(DowntimeEvent.reason)
        .order_by(
            func.coalesce(
                func.sum(
                    DowntimeEvent.duration_minutes
                ),
                0
            ).desc()
        )
        .all()
    )

    return [
        {
            "reason": row.reason,
            "event_count": row.event_count,
            "total_downtime_minutes":
                row.total_downtime_minutes,
        }
        for row in rows
    ]
def get_downtime_by_machine(
    db: Session
):
    machines = (
        db.query(Machine)
        .order_by(Machine.id)
        .all()
    )

    result = []

    for machine in machines:
        events = (
            db.query(DowntimeEvent)
            .filter(
                DowntimeEvent.machine_id == machine.id
            )
            .all()
        )

        total_downtime_minutes = sum(
            event.duration_minutes or 0
            for event in events
        )

        active_stops = sum(
            1
            for event in events
            if event.end_time is None
        )

        result.append({
            "machine_id": machine.id,
            "machine_name": machine.machine_name,
            "line": machine.line,
            "machine_status": machine.status,
            "event_count": len(events),
            "total_downtime_minutes": total_downtime_minutes,
            "active_stops": active_stops,
        })

    return result