from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.machine_schema import MachineCreate, MachineResponse
from app.services.machine_service import create_machine, get_all_machines

router = APIRouter(
    prefix="/machines",
    tags=["Machines"]
)


@router.post("/", response_model=MachineResponse)
def add_machine(
    machine: MachineCreate,
    db: Session = Depends(get_db)
):
    return create_machine(db, machine)


@router.get("/", response_model=list[MachineResponse])
def read_machines(
    db: Session = Depends(get_db)
):
    return get_all_machines(db)