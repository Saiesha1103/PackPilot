from sqlalchemy import Column, Integer, Float, DateTime
from sqlalchemy.sql import func

from app.database.base import Base


class OEERecord(Base):
    __tablename__ = "oee_records"

    id = Column(Integer, primary_key=True, index=True)

    availability = Column(Float, nullable=False)
    performance = Column(Float, nullable=False)
    quality = Column(Float, nullable=False)
    oee = Column(Float, nullable=False)

    timestamp = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )