from app.database.database import engine
from app.database.base import Base

# Import ONLY existing models
from app.models.machine import Machine


def init_db():
    Base.metadata.create_all(bind=engine)
    print("✅ Database created successfully!")