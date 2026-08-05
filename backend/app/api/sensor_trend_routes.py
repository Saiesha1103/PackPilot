from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.sensor_trends.service import get_sensor_trend
from app.schemas.sensor_trend_schema import SensorTrendResponse

router = APIRouter(
    prefix="/sensor-trends",
    tags=["Sensor Trends"],
)


@router.get(
    "/{sensor_id}",
    response_model=list[SensorTrendResponse],
)
def read_sensor_trend(
    sensor_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return get_sensor_trend(
        db,
        sensor_id,
        limit,
    )