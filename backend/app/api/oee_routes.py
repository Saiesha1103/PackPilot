from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.oee_schema import (
    OEEInput,
    OEEResponse,
    OEEHistoryResponse,
)

from app.services.oee_service import (
    calculate_oee,
    get_oee_history,
)


router = APIRouter(
    prefix="/oee",
    tags=["OEE"]
)


@router.post(
    "/calculate",
    response_model=OEEResponse
)
def calculate_oee_metrics(
    data: OEEInput,
    db: Session = Depends(get_db)
):
    return calculate_oee(data, db)


@router.get(
    "/history",
    response_model=list[OEEHistoryResponse]
)
def read_oee_history(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    return get_oee_history(db, limit)