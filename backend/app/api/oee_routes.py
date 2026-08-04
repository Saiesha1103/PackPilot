from fastapi import APIRouter

from app.schemas.oee_schema import OEEInput, OEEResponse
from app.services.oee_service import calculate_oee


router = APIRouter(
    prefix="/oee",
    tags=["OEE"]
)


@router.post(
    "/calculate",
    response_model=OEEResponse
)
def calculate_oee_metrics(data: OEEInput):
    return calculate_oee(data)