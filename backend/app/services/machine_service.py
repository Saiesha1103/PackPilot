from sqlalchemy.orm import Session
from app.models.machine import Machine

def create_machine(db: Session, machine):
    db_machine = Machine(
        machine_name=machine.machine_name,
        line=machine.line,
        status=machine.status
    )

    db.add(db_machine)
    db.commit()
    db.refresh(db_machine)

    return db_machine


def get_all_machines(db: Session):
    return db.query(Machine).all()