from sqlalchemy.orm import Session

from app.models.sensor import SensorReading


def get_sensor_trend(
    db: Session,
    sensor_id: int,
    limit: int = 50,
):
    readings = (
        db.query(SensorReading)
        .filter(
            SensorReading.sensor_id == sensor_id
        )
        .order_by(
            SensorReading.timestamp.desc()
        )
        .limit(limit)
        .all()
    )

    readings.reverse()

    return [
        {
            "timestamp": reading.timestamp,
            "value": reading.value,
        }
        for reading in readings
    ]