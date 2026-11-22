from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import QuoteModel, GroupModel, UserModel
from ..schemas import QuoteResponse, QuoteCreatePayload, QuoteRequestPayload
from ..auth import require_admin

router = APIRouter(prefix="/admin/quotes", tags=["admin-quotes"])

@router.get("", response_model=List[QuoteResponse])
def list_admin_quotes(
    db: Session = Depends(get_db),
    admin: UserModel = Depends(require_admin),
):
    quotes = db.query(QuoteModel).all()
    return [QuoteResponse.model_validate(q) for q in quotes]

@router.post("/request")
def request_quotes(
    payload: QuoteRequestPayload,
    db: Session = Depends(get_db),
    admin: UserModel = Depends(require_admin),
):
    # Verify deadline is not in the past
    if payload.deadline < datetime.now().strftime("%Y-%m-%d"):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Choose a valid quote deadline")

    group = db.query(GroupModel).filter(GroupModel.id == payload.group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    if group.status != "quotation_eligible":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Group has not reached the quote threshold")

    group.status = "quote_requested"
    group.quote_deadline = payload.deadline
    db.commit()
    return {"ok": True}

@router.post("", response_model=QuoteResponse)
def create_quote(
    payload: QuoteCreatePayload,
    db: Session = Depends(get_db),
    admin: UserModel = Depends(require_admin),
):
    group = db.query(GroupModel).filter(GroupModel.id == payload.group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    if group.status == "closed":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This group is closed")

    if payload.valid_until < datetime.now().strftime("%Y-%m-%d"):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Validity date cannot be in the past")

    quote = QuoteModel(
        group_id=payload.group_id,
        airline_name=payload.airline_name,
        price_per_passenger=payload.price_per_passenger,
        available_seats=payload.available_seats,
        source_type=payload.source_type,
        baggage_details=payload.baggage_details,
        terms=payload.terms,
        valid_until=payload.valid_until,
        status="draft",
    )
    db.add(quote)
    db.commit()
    db.refresh(quote)
    return QuoteResponse.model_validate(quote)

@router.patch("/{id}/publish", response_model=QuoteResponse)
def publish_quote(
    id: str,
    db: Session = Depends(get_db),
    admin: UserModel = Depends(require_admin),
):
    quote = db.query(QuoteModel).filter(QuoteModel.id == id).first()
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found")
    if quote.status != "draft":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only draft quotations can be published")

    if quote.valid_until < datetime.now().strftime("%Y-%m-%d"):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This draft has expired; create a new quotation")

    group = db.query(GroupModel).filter(GroupModel.id == quote.group_id).first()
    if not group or group.status == "closed":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This group is unavailable or closed")

    quote.status = "published"
    group.status = "quoted"
    db.commit()
    db.refresh(quote)
    return QuoteResponse.model_validate(quote)
