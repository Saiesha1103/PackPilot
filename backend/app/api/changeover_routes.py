from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.changeover_schema import (
    ChangeoverCreate,
    ChangeoverClose,
    ChangeoverResponse,
    ChangeoverAnalyticsResponse,
)
from app.services.changeover_service import (
    create_changeover,
    get_all_changeovers,
    get_changeover,
    close_changeover,
    get_changeover_analytics,
)

router = APIRouter(
    prefix="/changeover",
    tags=["Changeover"]
)


@router.post(
    "/",
    response_model=ChangeoverResponse
)
def start_changeover(
    data: ChangeoverCreate,
    db: Session = Depends(get_db)
):
    changeover = create_changeover(
        db,
        data
    )

    if changeover is None:
        raise HTTPException(
            status_code=404,
            detail="Machine not found"
        )

    return changeover


@router.get(
    "/",
    response_model=list[ChangeoverResponse]
)
def read_changeovers(
    db: Session = Depends(get_db)
):
    return get_all_changeovers(db)


@router.get(
    "/analytics",
    response_model=ChangeoverAnalyticsResponse
)
def read_changeover_analytics(
    db: Session = Depends(get_db)
):
    return get_changeover_analytics(db)


@router.get(
    "/{changeover_id}",
    response_model=ChangeoverResponse
)
def read_changeover(
    changeover_id: int,
    db: Session = Depends(get_db)
):
    changeover = get_changeover(
        db,
        changeover_id
    )

    if changeover is None:
        raise HTTPException(
            status_code=404,
            detail="Changeover not found"
        )

    return changeover


@router.put(
    "/{changeover_id}/close",
    response_model=ChangeoverResponse
)
def finish_changeover(
    changeover_id: int,
    data: ChangeoverClose,
    db: Session = Depends(get_db)
):
    try:
        changeover = close_changeover(
            db,
            changeover_id,
            data
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    if changeover is None:
        raise HTTPException(
            status_code=404,
            detail="Changeover not found"
        )

    return changeover