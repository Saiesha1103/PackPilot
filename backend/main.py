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
from app.pfmea.router import router as pfmea_router
from app.api.alert_routes import router as alert_router
from app.api.health_routes import router as health_router
from app.api.sensor_trend_routes import router as sensor_trend_router
from app.api.maintenance_routes import router as maintenance_router
from app.reports.routes import router as reports_router

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

    if app.state.mqtt_client:
        print("PackPilot MQTT integration started")


@app.on_event("shutdown")
def shutdown():
    mqtt_client = getattr(app.state, "mqtt_client", None)

    if mqtt_client:
        mqtt_client.loop_stop()
        mqtt_client.disconnect()


app.include_router(machine_router)
app.include_router(sensor_router)
app.include_router(dashboard_router)
app.include_router(oee_router)
app.include_router(downtime_router)
app.include_router(changeover_router)
app.include_router(pfmea_router)
app.include_router(alert_router)
app.include_router(health_router)
app.include_router(sensor_trend_router)
app.include_router(maintenance_router)
app.include_router(reports_router)


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
