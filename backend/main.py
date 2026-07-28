from fastapi import FastAPI

from app.database.init_db import init_db
from app.api.machine_routes import router as machine_router

app = FastAPI(
    title="PackPilot API",
    description="Industry 4.0 Manufacturing Operations Platform",
    version="1.0.0"
)

@app.on_event("startup")
def startup():
    init_db()
app.include_router(machine_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to PackPilot API 🚀"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }