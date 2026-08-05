from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.reports.schemas import ReportsSummaryResponse
from app.reports.service import get_reports_summary

router = APIRouter(
    prefix="/reports",
    tags=["Engineering Reports"],
)


@router.get(
    "/summary",
    response_model=ReportsSummaryResponse,
)
def reports_summary(
    db: Session = Depends(get_db),
):
    return get_reports_summary(db)