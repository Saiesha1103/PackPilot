from pydantic import BaseModel

class MachineCreate(BaseModel):
    machine_name: str
    line: str
    status: str

class MachineResponse(MachineCreate):
    id: int

    class Config:
        from_attributes = True