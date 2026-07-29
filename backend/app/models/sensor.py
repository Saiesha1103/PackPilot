from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    sensor_name = Column(String, nullable=False)
    sensor_type = Column(String, nullable=False)
    machine_id = Column(Integer, ForeignKey("machines.id"))

    machine = relationship("Machine")