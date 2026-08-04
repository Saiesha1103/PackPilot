from sqlalchemy.orm import Session

from app.models.sensor import Sensor, SensorReading


def create_sensor(db: Session, sensor):
    db_sensor = Sensor(
        sensor_name=sensor.sensor_name,
        sensor_type=sensor.sensor_type,
        machine_id=sensor.machine_id
    )

    db.add(db_sensor)
    db.commit()
    db.refresh(db_sensor)

    return db_sensor


def get_all_sensors(db: Session):
    return db.query(Sensor).all()


def get_sensor(db: Session, sensor_id: int):
    return db.query(Sensor).filter(
        Sensor.id == sensor_id
    ).first()


def update_sensor(db: Session, sensor_id: int, sensor):
    db_sensor = db.query(Sensor).filter(
        Sensor.id == sensor_id
    ).first()

    if db_sensor:
        db_sensor.sensor_name = sensor.sensor_name
        db_sensor.sensor_type = sensor.sensor_type
        db_sensor.machine_id = sensor.machine_id

        db.commit()
        db.refresh(db_sensor)

    return db_sensor


def delete_sensor(db: Session, sensor_id: int):
    db_sensor = db.query(Sensor).filter(
        Sensor.id == sensor_id
    ).first()

    if db_sensor:
        db.delete(db_sensor)
        db.commit()

    return db_sensor
def create_sensor_reading(db: Session, reading):
    db_reading = SensorReading(
        sensor_id=reading.sensor_id,
        value=reading.value
    )

    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)

    return db_reading


def get_sensor_readings(db: Session, sensor_id: int):
    return (
        db.query(SensorReading)
        .filter(SensorReading.sensor_id == sensor_id)
        .order_by(SensorReading.timestamp.desc())
        .all()
    )


def get_latest_sensor_reading(db: Session, sensor_id: int):
    return (
        db.query(SensorReading)
        .filter(SensorReading.sensor_id == sensor_id)
        .order_by(SensorReading.timestamp.desc())
        .first()
    )