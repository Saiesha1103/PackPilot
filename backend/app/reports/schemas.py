from typing import Optional

from pydantic import BaseModel


class OEESummary(BaseModel):
    availability: Optional[float] = None
    performance: Optional[float] = None
    quality: Optional[float] = None
    oee: Optional[float] = None


class MaintenanceSummary(BaseModel):
    scheduled: int
    completed: int
    overdue: int


class DowntimeSummary(BaseModel):
    events: int
    minutes: float


class PFMEASummary(BaseModel):
    high_risk: int
    medium_risk: int
    low_risk: int


class ProductionSummary(BaseModel):
    machines: int
    active: int
    stopped: int


class ReportsSummaryResponse(BaseModel):
    oee: OEESummary
    maintenance: MaintenanceSummary
    downtime: DowntimeSummary
    pfmea: PFMEASummary
    production: ProductionSummary