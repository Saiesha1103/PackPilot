from pydantic import BaseModel


class SensorCreate(BaseModel):
    sensor_name: str
    sensor_type: str
    machine_id: int


class SensorResponse(SensorCreate):
    id: int

    class Config:
        from_attributes = True