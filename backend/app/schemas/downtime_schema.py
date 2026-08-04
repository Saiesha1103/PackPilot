from datetime import datetime

from pydantic import BaseModel, Field
from enum import Enum
class DowntimeReason(str, Enum):
    mechanical_failure = "Mechanical Failure"
    electrical_failure = "Electrical Failure"
    material_shortage = "Material Shortage"
    quality_issue = "Quality Issue"
    changeover = "Changeover"
    planned_maintenance = "Planned Maintenance"
    operator_unavailable = "Operator Unavailable"
    other = "Other"


class DowntimeCreate(BaseModel):
    machine_id: int = Field(gt=0)
    reason: DowntimeReason

class DowntimeClose(BaseModel):
    end_time: datetime | None = None


class DowntimeResponse(BaseModel):
    id: int
    machine_id: int
    reason: str
    start_time: datetime
    end_time: datetime | None
    duration_minutes: int | None

    model_config = {
        "from_attributes": True
    }


class DowntimeAnalyticsResponse(BaseModel):
    total_events: int
    total_downtime_minutes: int
    average_downtime_minutes: float
    top_reason: str | None
class DowntimeReasonAnalytics(BaseModel):
    reason: str
    event_count: int
    total_downtime_minutes: int
class DowntimeMachineAnalytics(BaseModel):
    machine_id: int
    machine_name: str
    line: str
    machine_status: str
    event_count: int
    total_downtime_minutes: int
    active_stops: int