from sqlalchemy.orm import Session

from app.models.sensor import Sensor, SensorReading
from app.models.machine import Machine
from app.models.alert import Alert


def clamp(value, minimum=0, maximum=100):
    return max(minimum, min(maximum, value))


def classify_health(score: float):
    if score >= 90:
        return "Healthy"

    if score >= 70:
        return "Warning"

    if score >= 40:
        return "Critical"

    return "Down"


def calculate_machine_health(
    db: Session,
    machine_id: int,
):
    machine = (
        db.query(Machine)
        .filter(Machine.id == machine_id)
        .first()
    )

    if machine is None:
        return None

    score = 100

    sensors = (
        db.query(Sensor)
        .filter(Sensor.machine_id == machine_id)
        .all()
    )

    for sensor in sensors:

        latest = (
            db.query(SensorReading)
            .filter(SensorReading.sensor_id == sensor.id)
            .order_by(SensorReading.timestamp.desc())
            .first()
        )

        if latest is None:
            continue

        sensor_type = sensor.sensor_type.lower()
        value = latest.value

        if "temperature" in sensor_type and value > 80:
            score -= 20

        elif "vibration" in sensor_type and value > 7:
            score -= 20

        elif (
            "humidity" in sensor_type
            or "ir" in sensor_type
            or "proximity" in sensor_type
        ) and value > 75:
            score -= 10

    if machine.status.lower() == "stopped":
        score -= 30

    active_alerts = (
        db.query(Alert)
        .filter(
            Alert.machine_id == machine_id,
            Alert.status == "Active",
        )
        .count()
    )

    score -= active_alerts * 5

    score = clamp(score)

    return {
        "machine_id": machine.id,
        "machine_name": machine.machine_name,
        "health_score": int(score),
        "health_status": classify_health(score),
    }
def get_all_machine_health(db: Session):
    machines = db.query(Machine).all()

    return [
        calculate_machine_health(
            db,
            machine.id,
        )
        for machine in machines
    ]
