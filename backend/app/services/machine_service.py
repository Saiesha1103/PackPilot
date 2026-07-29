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


def get_machine(db: Session, machine_id: int):
    return db.query(Machine).filter(
        Machine.id == machine_id
    ).first()


def update_machine(db: Session, machine_id: int, machine):
    db_machine = db.query(Machine).filter(
        Machine.id == machine_id
    ).first()

    if db_machine:

        db_machine.machine_name = machine.machine_name
        db_machine.line = machine.line
        db_machine.status = machine.status

        db.commit()
        db.refresh(db_machine)

    return db_machine


def delete_machine(db: Session, machine_id: int):

    db_machine = db.query(Machine).filter(
        Machine.id == machine_id
    ).first()

    if db_machine:
        db.delete(db_machine)
        db.commit()

    return db_machine