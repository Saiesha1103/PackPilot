from sqlalchemy.orm import Session

from app.models.pfmea import PFMEA
from app.pfmea.schemas import PFMEACreate


def calculate_rpn(
    severity: int,
    occurrence: int,
    detection: int,
) -> int:
    return severity * occurrence * detection


def get_risk_level(rpn: int) -> str:
    if rpn >= 400:
        return "Critical"

    if rpn >= 200:
        return "High"

    if rpn >= 100:
        return "Medium"

    return "Low"


def create_pfmea(
    db: Session,
    data: PFMEACreate,
) -> PFMEA:
    rpn = calculate_rpn(
        data.severity,
        data.occurrence,
        data.detection,
    )

    record = PFMEA(
        machine_id=data.machine_id,
        failure_mode=data.failure_mode,
        failure_effect=data.failure_effect,
        severity=data.severity,
        occurrence=data.occurrence,
        detection=data.detection,
        rpn=rpn,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


def get_pfmea_records(db: Session):
    return (
        db.query(PFMEA)
        .order_by(PFMEA.rpn.desc())
        .all()
    )


def get_pfmea_by_id(
    db: Session,
    pfmea_id: int,
):
    return (
        db.query(PFMEA)
        .filter(PFMEA.id == pfmea_id)
        .first()
    )