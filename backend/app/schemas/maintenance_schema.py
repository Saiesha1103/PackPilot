from datetime import datetime

from pydantic import BaseModel


class MaintenanceCreate(BaseModel):
    machine_id: int
    maintenance_type: str
    description: str | None = None
    scheduled_date: datetime


class MaintenanceUpdate(BaseModel):
    status: str
    completed_date: datetime | None = None


class MaintenanceResponse(BaseModel):
    id: int
    machine_id: int
    maintenance_type: str
    description: str | None
    scheduled_date: datetime
    completed_date: datetime | None
    status: str

    class Config:
        from_attributes = True