from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.downtime_schema import (
    DowntimeCreate,
    DowntimeClose,
    DowntimeResponse,
    DowntimeAnalyticsResponse,
    DowntimeReasonAnalytics,
    DowntimeMachineAnalytics,
)
from app.services.downtime_service import (
    create_downtime_event,
    get_all_downtime_events,
    get_downtime_event,
    close_downtime_event,
    get_downtime_analytics,
    get_downtime_by_reason,
    get_downtime_by_machine,
)


router = APIRouter(
    prefix="/downtime",
    tags=["Downtime"]
)


@router.post(
    "/",
    response_model=DowntimeResponse
)
def start_downtime(
    data: DowntimeCreate,
    db: Session = Depends(get_db)
):
    event = create_downtime_event(
        db,
        data
    )

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Machine not found"
        )

    return event


@router.get(
    "/",
    response_model=list[DowntimeResponse]
)
def read_downtime_events(
    db: Session = Depends(get_db)
):
    return get_all_downtime_events(db)


@router.get(
    "/analytics",
    response_model=DowntimeAnalyticsResponse
)
def read_downtime_analytics(
    db: Session = Depends(get_db)
):
    return get_downtime_analytics(db)


@router.get(
    "/analytics/by-reason",
    response_model=list[DowntimeReasonAnalytics]
)
def read_downtime_by_reason(
    db: Session = Depends(get_db)
):
    return get_downtime_by_reason(db)


@router.get(
    "/analytics/by-machine",
    response_model=list[DowntimeMachineAnalytics]
)
def read_downtime_by_machine(
    db: Session = Depends(get_db)
):
    return get_downtime_by_machine(db)


@router.get(
    "/{event_id}",
    response_model=DowntimeResponse
)
def read_downtime_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    event = get_downtime_event(
        db,
        event_id
    )

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Downtime event not found"
        )

    return event


@router.put(
    "/{event_id}/close",
    response_model=DowntimeResponse
)
def close_downtime(
    event_id: int,
    data: DowntimeClose,
    db: Session = Depends(get_db)
):
    try:
        event = close_downtime_event(
            db,
            event_id,
            data
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Downtime event not found"
        )

    return event