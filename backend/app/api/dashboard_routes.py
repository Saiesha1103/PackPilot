from fastapi import APIRouter

from app.services.dashboard_service import (
    get_dashboard_overview,
    get_dashboard_kpis
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/overview")
def dashboard_overview():
    return get_dashboard_overview()


@router.get("/kpis")
def dashboard_kpis():
    return get_dashboard_kpis()