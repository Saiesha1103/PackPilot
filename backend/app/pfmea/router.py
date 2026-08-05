from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.pfmea.schemas import PFMEACreate
from app.pfmea.service import (
    create_pfmea,
    get_pfmea_records,
    get_pfmea_by_id,
    get_risk_level,
)

router = APIRouter(
    prefix="/pfmea",
    tags=["PFMEA"],
)


@router.post("/")
def create_pfmea_record(
    data: PFMEACreate,
    db: Session = Depends(get_db),
):
    record = create_pfmea(db, data)

    return {
        "id": record.id,
        "machine_id": record.machine_id,
        "failure_mode": record.failure_mode,
        "failure_effect": record.failure_effect,
        "severity": record.severity,
        "occurrence": record.occurrence,
        "detection": record.detection,
        "rpn": record.rpn,
        "risk_level": get_risk_level(record.rpn),
    }


@router.get("/")
def list_pfmea_records(
    db: Session = Depends(get_db),
):
    records = get_pfmea_records(db)

    return [
        {
            "id": record.id,
            "machine_id": record.machine_id,
            "failure_mode": record.failure_mode,
            "failure_effect": record.failure_effect,
            "severity": record.severity,
            "occurrence": record.occurrence,
            "detection": record.detection,
            "rpn": record.rpn,
            "risk_level": get_risk_level(record.rpn),
        }
        for record in records
    ]


@router.get("/{pfmea_id}")
def get_pfmea_record(
    pfmea_id: int,
    db: Session = Depends(get_db),
):
    record = get_pfmea_by_id(db, pfmea_id)

    if not record:
        raise HTTPException(
            status_code=404,
            detail="PFMEA record not found",
        )

    return {
        "id": record.id,
        "machine_id": record.machine_id,
        "failure_mode": record.failure_mode,
        "failure_effect": record.failure_effect,
        "severity": record.severity,
        "occurrence": record.occurrence,
        "detection": record.detection,
        "rpn": record.rpn,
        "risk_level": get_risk_level(record.rpn),
    }