from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.maintenance_schema import (
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceResponse,
)
from app.maintenance.service import (
    create_maintenance,
    get_all_maintenance,
    get_upcoming_maintenance,
    get_completed_maintenance,
    complete_maintenance,
)

router = APIRouter(
    prefix="/maintenance",
    tags=["Preventive Maintenance"],
)


@router.post(
    "/",
    response_model=MaintenanceResponse,
)
def add_maintenance(
    maintenance: MaintenanceCreate,
    db: Session = Depends(get_db),
):
    return create_maintenance(
        db,
        maintenance,
    )


@router.get(
    "/",
    response_model=list[MaintenanceResponse],
)
def read_all_maintenance(
    db: Session = Depends(get_db),
):
    return get_all_maintenance(db)


@router.get(
    "/upcoming",
    response_model=list[MaintenanceResponse],
)
def read_upcoming_maintenance(
    db: Session = Depends(get_db),
):
    return get_upcoming_maintenance(db)


@router.get(
    "/completed",
    response_model=list[MaintenanceResponse],
)
def read_completed_maintenance(
    db: Session = Depends(get_db),
):
    return get_completed_maintenance(db)


@router.put(
    "/{maintenance_id}/complete",
    response_model=MaintenanceResponse,
)
def mark_completed(
    maintenance_id: int,
    maintenance: MaintenanceUpdate,
    db: Session = Depends(get_db),
):
    job = complete_maintenance(
        db,
        maintenance_id,
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Maintenance job not found",
        )

    return job