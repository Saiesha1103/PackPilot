from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.health.service import (
    calculate_machine_health,
    get_all_machine_health,
)
from app.schemas.health_schema import MachineHealthResponse

router = APIRouter(
    prefix="/health",
    tags=["Machine Health"],
)


@router.get(
    "/",
    response_model=list[MachineHealthResponse],
)
def get_all_health(
    db: Session = Depends(get_db),
):
    return get_all_machine_health(db)


@router.get(
    "/{machine_id}",
    response_model=MachineHealthResponse,
)
def get_machine_health(
    machine_id: int,
    db: Session = Depends(get_db),
):
    health = calculate_machine_health(
        db,
        machine_id,
    )

    if health is None:
        raise HTTPException(
            status_code=404,
            detail="Machine not found",
        )

    return health