from fastapi import FastAPI

from app.database.init_db import init_db
from app.api.machine_routes import router as machine_router
from app.api.sensor_routes import router as sensor_router
from app.api.dashboard_routes import router as dashboard_router
from app.mqtt.mqtt_subscriber import start_mqtt_subscriber
from fastapi.middleware.cors import CORSMiddleware
from app.api.oee_routes import router as oee_router
from app.api.downtime_routes import router as downtime_router
from app.api.changeover_routes import (
    router as changeover_router
)

app = FastAPI(
    title="PackPilot API",
    description="Industry 4.0 Manufacturing Operations Platform",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

    app.state.mqtt_client = start_mqtt_subscriber()

    print("PackPilot MQTT integration started")
app.include_router(machine_router)
app.include_router(sensor_router)
app.include_router(dashboard_router)
app.include_router(oee_router)
app.include_router(downtime_router)
app.include_router(changeover_router)

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
