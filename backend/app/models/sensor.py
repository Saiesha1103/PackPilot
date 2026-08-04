from datetime import datetime

from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship

from app.database.base import Base


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    sensor_name = Column(String, nullable=False)
    sensor_type = Column(String, nullable=False)
    machine_id = Column(Integer, ForeignKey("machines.id"))

    machine = relationship("Machine")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(
        Integer,
        ForeignKey("sensors.id"),
        nullable=False
    )
    value = Column(Float, nullable=False)
    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    sensor = relationship("Sensor")