from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import TravelRequestModel, UserModel, AirportModel
from ..schemas import (
    TravelRequestPayload,
    TravelRequestResponse,
    AirportResponse,
)
from ..auth import get_current_user

router = APIRouter(prefix="/travel-requests", tags=["travel-requests"])

def format_request(r: TravelRequestModel) -> TravelRequestResponse:
    c_at = r.created_at.strftime("%Y-%m-%d") if isinstance(r.created_at, datetime) else str(r.created_at)
    return TravelRequestResponse(
        id=r.id,
        user_id=r.user_id,
        origin_id=r.origin_id,
        destination_id=r.destination_id,
        departure_date=r.departure_date,
        flexibility_days=r.flexibility_days,
        passenger_count=r.passenger_count,
        max_budget=r.max_budget,
        status=r.status,
        group_id=r.group_id,
        origin=AirportResponse.model_validate(r.origin) if r.origin else None,
        destination=AirportResponse.model_validate(r.destination) if r.destination else None,
        created_at=c_at,
    )

@router.post("", response_model=TravelRequestResponse)
def create_travel_request(
    payload: TravelRequestPayload,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    if payload.origin_id == payload.destination_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Origin and destination must differ",
        )
    origin = db.query(AirportModel).filter(AirportModel.id == payload.origin_id).first()
    dest = db.query(AirportModel).filter(AirportModel.id == payload.destination_id).first()
    if not origin or not dest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Airport not found",
        )

    req = TravelRequestModel(
        user_id=current_user.id,
        origin_id=payload.origin_id,
        destination_id=payload.destination_id,
        departure_date=payload.departure_date,
        flexibility_days=payload.flexibility_days,
        passenger_count=payload.passenger_count,
        max_budget=payload.max_budget,
        status="open",
        group_id=None,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return format_request(req)

@router.get("/my", response_model=List[TravelRequestResponse])
def list_my_requests(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    requests = (
        db.query(TravelRequestModel)
        .filter(TravelRequestModel.user_id == current_user.id)
        .order_by(TravelRequestModel.created_at.desc())
        .all()
    )
    return [format_request(r) for r in requests]

@router.patch("/{id}", response_model=TravelRequestResponse)
def update_travel_request(
    id: str,
    payload: TravelRequestPayload,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    req = db.query(TravelRequestModel).filter(TravelRequestModel.id == id, TravelRequestModel.user_id == current_user.id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if req.status == "grouped":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Leave the group before editing this request")

    if payload.origin_id == payload.destination_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Origin and destination must differ")

    req.origin_id = payload.origin_id
    req.destination_id = payload.destination_id
    req.departure_date = payload.departure_date
    req.flexibility_days = payload.flexibility_days
    req.passenger_count = payload.passenger_count
    req.max_budget = payload.max_budget
    db.commit()
    db.refresh(req)
    return format_request(req)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_travel_request(
    id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    req = db.query(TravelRequestModel).filter(TravelRequestModel.id == id, TravelRequestModel.user_id == current_user.id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if req.status == "grouped":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Leave the group before cancelling this request")

    req.status = "cancelled"
    db.commit()
    return None
