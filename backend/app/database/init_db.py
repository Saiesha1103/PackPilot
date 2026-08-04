from app.database.database import engine
from app.database.base import Base

# Import all Day 3 database models
from app.models.machine import Machine
from app.models.sensor import Sensor, SensorReading
from app.models.downtime_event import DowntimeEvent
from app.models.maintenance import Maintenance
from app.models.alert import Alert
from app.models.pfmea import PFMEA
from app.models.report import Report
from app.models.changeover import Changeover
from app.models.oee import OEERecord


def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")