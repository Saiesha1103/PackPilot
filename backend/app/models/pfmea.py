from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class PFMEA(Base):
    __tablename__ = "pfmea"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False)
    failure_mode = Column(String, nullable=False)
    failure_effect = Column(String, nullable=True)
    severity = Column(Integer, nullable=False)
    occurrence = Column(Integer, nullable=False)
    detection = Column(Integer, nullable=False)
    rpn = Column(Integer, nullable=False)

    machine = relationship("Machine")