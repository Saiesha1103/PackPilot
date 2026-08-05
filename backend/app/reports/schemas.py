from pydantic import BaseModel


class OEESummary(BaseModel):
    availability: float
    performance: float
    quality: float
    oee: float


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