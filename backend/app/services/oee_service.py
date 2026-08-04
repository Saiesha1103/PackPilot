from sqlalchemy.orm import Session

from app.models.oee import OEERecord


def calculate_oee(data, db: Session):
    availability = (
        data.run_time /
        data.planned_production_time
    )

    performance = (
        data.ideal_cycle_time *
        data.total_units
    ) / data.run_time if data.run_time > 0 else 0

    quality = (
        data.good_units /
        data.total_units
    )

    oee = (
        availability *
        performance *
        quality
    )

    result = {
        "availability": round(availability * 100, 2),
        "performance": round(performance * 100, 2),
        "quality": round(quality * 100, 2),
        "oee": round(oee * 100, 2),
    }

    db_record = OEERecord(
        availability=result["availability"],
        performance=result["performance"],
        quality=result["quality"],
        oee=result["oee"],
    )

    db.add(db_record)
    db.commit()

    return result
def get_oee_history(db: Session, limit: int = 20):
    return (
        db.query(OEERecord)
        .order_by(OEERecord.timestamp.desc())
        .limit(limit)
        .all()
    )