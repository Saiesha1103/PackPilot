from datetime import datetime

from sqlalchemy.orm import Session

from app.models.alert import Alert


# ---------------------------------------------------------
# Engineering alert thresholds
# ---------------------------------------------------------

TEMPERATURE_HIGH = 80.0       # °C
VIBRATION_HIGH = 7.0          # mm/s
HUMIDITY_HIGH = 75.0          # %
OEE_LOW = 60.0                # %


def create_alert(
    db: Session,
    machine_id: int,
    alert_type: str,
    message: str,
    severity: str,
):
    # Do not create another identical alert while one is already active
    existing_alert = (
        db.query(Alert)
        .filter(
            Alert.machine_id == machine_id,
            Alert.alert_type == alert_type,
            Alert.status == "Active",
        )
        .first()
    )

    if existing_alert:
        return existing_alert

    alert = Alert(
        machine_id=machine_id,
        alert_type=alert_type,
        message=message,
        severity=severity,
        timestamp=datetime.utcnow(),
        status="Active",
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert

def evaluate_sensor_reading(
    db: Session,
    machine_id: int,
    sensor_type: str,
    value: float,
):
    sensor_type = sensor_type.lower().strip()

    if sensor_type == "temperature" and value > TEMPERATURE_HIGH:
        return create_alert(
            db,
            machine_id,
            "High Temperature",
            f"Temperature reached {value:.1f} °C; threshold is {TEMPERATURE_HIGH:.1f} °C.",
            "Critical",
        )

    if sensor_type == "vibration" and value > VIBRATION_HIGH:
        return create_alert(
            db,
            machine_id,
            "High Vibration",
            f"Vibration reached {value:.1f} mm/s; threshold is {VIBRATION_HIGH:.1f} mm/s.",
            "High",
        )

    if sensor_type == "humidity" and value > HUMIDITY_HIGH:
        return create_alert(
            db,
            machine_id,
            "High Humidity",
            f"Humidity reached {value:.1f}%; threshold is {HUMIDITY_HIGH:.1f}%.",
            "Medium",
        )

    return None


def evaluate_machine_status(
    db: Session,
    machine_id: int,
    status: str,
):
    if status.lower().strip() == "stopped":
        return create_alert(
            db,
            machine_id,
            "Machine Stopped",
            "Machine has entered stopped state.",
            "Critical",
        )

    return None


def evaluate_oee(
    db: Session,
    machine_id: int,
    oee: float,
):
    if oee < OEE_LOW:
        return create_alert(
            db,
            machine_id,
            "Low OEE",
            f"OEE dropped to {oee:.1f}%; minimum threshold is {OEE_LOW:.1f}%.",
            "High",
        )

    return None