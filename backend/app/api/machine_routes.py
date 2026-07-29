from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.machine_schema import MachineCreate, MachineResponse
from app.services.machine_service import (
    create_machine,
    get_all_machines,
    get_machine,
    update_machine,
    delete_machine,
)

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


@router.get("/{machine_id}", response_model=MachineResponse)
def read_machine(
    machine_id: int,
    db: Session = Depends(get_db)
):

    machine = get_machine(db, machine_id)

    if machine is None:
        raise HTTPException(
            status_code=404,
            detail="Machine not found"
        )

    return machine


@router.put("/{machine_id}", response_model=MachineResponse)
def edit_machine(
    machine_id: int,
    machine: MachineCreate,
    db: Session = Depends(get_db)
):

    updated = update_machine(
        db,
        machine_id,
        machine
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Machine not found"
        )

    return updated


@router.delete("/{machine_id}")
def remove_machine(
    machine_id: int,
    db: Session = Depends(get_db)
):

    deleted = delete_machine(
        db,
        machine_id
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Machine not found"
        )

    return {
        "message": "Machine deleted successfully"
    }