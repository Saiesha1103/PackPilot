from pydantic import BaseModel


class MachineHealthResponse(BaseModel):
    machine_id: int
    machine_name: str
    health_score: int
    health_status: str