from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import (
    GroupModel,
    GroupMemberModel,
    TravelRequestModel,
    QuoteModel,
    UserModel,
    AirportModel,
)
from ..schemas import (
    GroupResponse,
    GroupMemberResponse,
    JoinGroupPayload,
    GroupCreatePayload,
    QuoteResponse,
    AirportResponse,
)
from ..auth import get_current_user, require_admin, to_safe_alias

router = APIRouter(prefix="/groups", tags=["groups"])

def format_group(g: GroupModel) -> GroupResponse:
    return GroupResponse(
        id=g.id,
        route=g.route,
        origin=AirportResponse.model_validate(g.origin),
        destination=AirportResponse.model_validate(g.destination),
        target_date=g.target_date,
        window_start=g.window_start,
        window_end=g.window_end,
        seats_filled=g.seats_filled,
        max_seats=g.max_seats,
        min_seats_for_quote=g.min_seats_for_quote,
        status=g.status,
        quote_deadline=g.quote_deadline,
        created_at=g.created_at,
    )

@router.get("", response_model=List[GroupResponse])
def list_groups(
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    status: Optional[str] = None,
    date: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(GroupModel)
    if origin:
        query = query.join(GroupModel.origin).filter(AirportModel.iata_code == origin.upper())
    if destination:
        query = query.join(GroupModel.destination).filter(AirportModel.iata_code == destination.upper())
    if status:
        query = query.filter(GroupModel.status == status)
    if date:
        query = query.filter(GroupModel.window_start <= date, GroupModel.window_end >= date)
    return [format_group(g) for g in query.all()]

@router.post("", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    payload: GroupCreatePayload,
    db: Session = Depends(get_db),
    admin: UserModel = Depends(require_admin),
):
    origin = db.query(AirportModel).filter(AirportModel.id == payload.origin_id).first()
    dest = db.query(AirportModel).filter(AirportModel.id == payload.destination_id).first()
    if not origin or not dest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Airport not found")
    if origin.id == dest.id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Origin and destination must differ")

    new_group = GroupModel(
        route=f"{origin.iata_code}-{dest.iata_code}",
        origin_id=origin.id,
        destination_id=dest.id,
        target_date=payload.target_date,
        window_start=payload.window_start,
        window_end=payload.window_end,
        seats_filled=0,
        max_seats=payload.max_seats,
        min_seats_for_quote=payload.min_seats_for_quote,
        status="forming",
        created_at=datetime.now().strftime("%Y-%m-%d"),
    )
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    return format_group(new_group)

@router.get("/{id}", response_model=GroupResponse)
def get_group(id: str, db: Session = Depends(get_db)):
    group = db.query(GroupModel).filter(GroupModel.id == id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    return format_group(group)

@router.get("/{id}/members", response_model=List[GroupMemberResponse])
def get_group_members(id: str, db: Session = Depends(get_db)):
    members = db.query(GroupMemberModel).filter(GroupMemberModel.group_id == id).all()
    return [GroupMemberResponse.model_validate(m) for m in members]

@router.post("/{id}/join", response_model=GroupResponse)
def join_group(
    id: str,
    payload: JoinGroupPayload,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    # Enforce ACID transaction and concurrency safety
    group = db.query(GroupModel).filter(GroupModel.id == id).with_for_update().first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    req = db.query(TravelRequestModel).filter(
        TravelRequestModel.id == payload.travel_request_id,
        TravelRequestModel.user_id == current_user.id,
    ).with_for_update().first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Travel request not found")

    if group.status not in ["forming", "quotation_eligible"]:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This group is no longer accepting travellers.")

    # Check already in group
    existing_member = db.query(GroupMemberModel).filter(
        GroupMemberModel.group_id == id,
        GroupMemberModel.user_id == current_user.id,
    ).first()
    if existing_member:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already joined this group")

    if req.status == "grouped":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This requirement is already in a group. Leave that group first.")
    if req.status != "open":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This requirement was cancelled. Choose an open requirement.")

    if req.origin_id != group.origin_id or req.destination_id != group.destination_id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This requirement has a different route.")

    # Check capacity
    remaining_seats = group.max_seats - group.seats_filled
    if remaining_seats < req.passenger_count:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Only {remaining_seats} passenger seats remain; your requirement needs {req.passenger_count}.",
        )

    # Date check
    g_target = datetime.strptime(group.target_date, "%Y-%m-%d")
    r_date = datetime.strptime(req.departure_date, "%Y-%m-%d")
    if abs((g_target - r_date).days) > (req.flexibility_days + 2):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This group is outside your flexible date window.")

    # Apply seat updates
    group.seats_filled += req.passenger_count
    if group.status == "forming" and group.seats_filled >= group.min_seats_for_quote:
        group.status = "quotation_eligible"

    req.status = "grouped"
    req.group_id = group.id

    # Create membership using privacy-preserving safe display alias
    member = GroupMemberModel(
        group_id=group.id,
        travel_request_id=req.id,
        user_id=current_user.id,
        display_name=to_safe_alias(current_user.full_name),
        passenger_count=req.passenger_count,
        joined_at=datetime.now().strftime("%Y-%m-%d"),
    )
    db.add(member)
    db.commit()
    db.refresh(group)
    return format_group(group)

@router.post("/{id}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_group(
    id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    group = db.query(GroupModel).filter(GroupModel.id == id).with_for_update().first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    member = db.query(GroupMemberModel).filter(
        GroupMemberModel.group_id == id,
        GroupMemberModel.user_id == current_user.id,
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You are not in this group")

    group.seats_filled -= member.passenger_count
    if group.status == "quotation_eligible" and group.seats_filled < group.min_seats_for_quote:
        group.status = "forming"

    req = db.query(TravelRequestModel).filter(TravelRequestModel.id == member.travel_request_id).first()
    if req:
        req.status = "open"
        req.group_id = None

    db.delete(member)
    db.commit()
    return None

@router.get("/{id}/quotes", response_model=List[QuoteResponse])
def get_group_quotes(id: str, db: Session = Depends(get_db)):
    # Travellers only see published quotes, never drafts
    quotes = db.query(QuoteModel).filter(
        QuoteModel.group_id == id,
        QuoteModel.status != "draft",
    ).all()
    return [QuoteResponse.model_validate(q) for q in quotes]
