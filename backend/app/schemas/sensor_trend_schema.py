from datetime import datetime

from pydantic import BaseModel


class SensorTrendResponse(BaseModel):
    timestamp: datetime
    value: float

    class Config:
        from_attributes = True