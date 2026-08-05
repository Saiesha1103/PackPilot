from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.alert import Alert


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
)


@router.get("/")
def get_all_alerts(db: Session = Depends(get_db)):
    return (
        db.query(Alert)
        .order_by(Alert.timestamp.desc())
        .all()
    )


@router.get("/active")
def get_active_alerts(db: Session = Depends(get_db)):
    return (
        db.query(Alert)
        .filter(Alert.status == "Active")
        .order_by(Alert.timestamp.desc())
        .all()
    )


@router.get("/active/count")
def get_active_alert_count(db: Session = Depends(get_db)):
    count = (
        db.query(Alert)
        .filter(Alert.status == "Active")
        .count()
    )

    return {
        "active_alerts": count
    }


@router.patch("/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
):
    alert = (
        db.query(Alert)
        .filter(Alert.id == alert_id)
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    alert.status = "Resolved"

    db.commit()
    db.refresh(alert)

    return alert