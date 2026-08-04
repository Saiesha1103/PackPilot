from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.sensor_schema import (
    SensorCreate,
    SensorResponse,
    SensorReadingCreate,
    SensorReadingResponse,
)
from app.services.sensor_service import (
    create_sensor,
    get_all_sensors,
    get_sensor,
    update_sensor,
    delete_sensor,
    create_sensor_reading,
    get_sensor_readings,
    get_latest_sensor_reading,
)

router = APIRouter(
    prefix="/sensors",
    tags=["Sensors"]
)


@router.post("/", response_model=SensorResponse)
def add_sensor(
    sensor: SensorCreate,
    db: Session = Depends(get_db)
):
    return create_sensor(db, sensor)


@router.get("/", response_model=list[SensorResponse])
def read_sensors(
    db: Session = Depends(get_db)
):
    return get_all_sensors(db)


@router.get("/{sensor_id}", response_model=SensorResponse)
def read_sensor(
    sensor_id: int,
    db: Session = Depends(get_db)
):
    sensor = get_sensor(db, sensor_id)

    if sensor is None:
        raise HTTPException(
            status_code=404,
            detail="Sensor not found"
        )

    return sensor


@router.put("/{sensor_id}", response_model=SensorResponse)
def edit_sensor(
    sensor_id: int,
    sensor: SensorCreate,
    db: Session = Depends(get_db)
):
    updated = update_sensor(
        db,
        sensor_id,
        sensor
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Sensor not found"
        )

    return updated


@router.delete("/{sensor_id}")
def remove_sensor(
    sensor_id: int,
    db: Session = Depends(get_db)
):
    deleted = delete_sensor(
        db,
        sensor_id
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Sensor not found"
        )

    return {
        "message": "Sensor deleted successfully"
    }
@router.post(
    "/readings",
    response_model=SensorReadingResponse
)
def add_sensor_reading(
    reading: SensorReadingCreate,
    db: Session = Depends(get_db)
):
    sensor = get_sensor(db, reading.sensor_id)

    if sensor is None:
        raise HTTPException(
            status_code=404,
            detail="Sensor not found"
        )

    return create_sensor_reading(db, reading)


@router.get(
    "/{sensor_id}/readings",
    response_model=list[SensorReadingResponse]
)
def read_sensor_readings(
    sensor_id: int,
    db: Session = Depends(get_db)
):
    sensor = get_sensor(db, sensor_id)

    if sensor is None:
        raise HTTPException(
            status_code=404,
            detail="Sensor not found"
        )

    return get_sensor_readings(db, sensor_id)


@router.get(
    "/{sensor_id}/readings/latest",
    response_model=SensorReadingResponse
)
def read_latest_sensor_reading(
    sensor_id: int,
    db: Session = Depends(get_db)
):
    sensor = get_sensor(db, sensor_id)

    if sensor is None:
        raise HTTPException(
            status_code=404,
            detail="Sensor not found"
        )

    reading = get_latest_sensor_reading(
        db,
        sensor_id
    )

    if reading is None:
        raise HTTPException(
            status_code=404,
            detail="No readings found for this sensor"
        )

    return reading