from sqlalchemy import Column, Integer, String
from app.database.base import Base

class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    machine_name = Column(String, nullable=False)
    line = Column(String, nullable=False)
    status = Column(String, default="Running")