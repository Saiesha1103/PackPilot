from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime

from app.database.base import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    file_path = Column(String, nullable=True)