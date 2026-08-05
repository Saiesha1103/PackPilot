from pydantic import BaseModel, Field, ConfigDict


class PFMEACreate(BaseModel):
    machine_id: int
    failure_mode: str
    failure_effect: str | None = None

    severity: int = Field(..., ge=1, le=10)
    occurrence: int = Field(..., ge=1, le=10)
    detection: int = Field(..., ge=1, le=10)


class PFMEAResponse(BaseModel):
    id: int
    machine_id: int
    failure_mode: str
    failure_effect: str | None

    severity: int
    occurrence: int
    detection: int
    rpn: int

    risk_level: str

    model_config = ConfigDict(from_attributes=True)