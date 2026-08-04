from pydantic import BaseModel


class SensorCreate(BaseModel):
    sensor_name: str
    sensor_type: str
    machine_id: int


class SensorResponse(SensorCreate):
    id: int

    class Config:
        from_attributes = True
from datetime import datetime


class SensorReadingCreate(BaseModel):
    sensor_id: int
    value: float


class SensorReadingResponse(SensorReadingCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True