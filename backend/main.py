from fastapi import FastAPI

from app.database.init_db import init_db
from app.api.machine_routes import router as machine_router
from app.api.sensor_routes import router as sensor_router
from app.api.dashboard_routes import router as dashboard_router
from app.mqtt.mqtt_subscriber import start_mqtt_subscriber

app = FastAPI(
    title="PackPilot API",
    description="Industry 4.0 Manufacturing Operations Platform",
    version="1.0.0"
)

@app.on_event("startup")
def startup():
    init_db()

    app.state.mqtt_client = start_mqtt_subscriber()

    print("PackPilot MQTT integration started")
app.include_router(machine_router)
app.include_router(sensor_router)
app.include_router(dashboard_router)

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