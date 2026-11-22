from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import NotificationModel, UserModel
from ..schemas import NotificationResponse
from ..auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=List[NotificationResponse])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    notifications = (
        db.query(NotificationModel)
        .filter(NotificationModel.user_id == current_user.id)
        .order_by(NotificationModel.created_at.desc())
        .all()
    )
    return [NotificationResponse.model_validate(n) for n in notifications]

# Route precedence rule: read-all must come before /{id}/read
@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    unread = (
        db.query(NotificationModel)
        .filter(
            NotificationModel.user_id == current_user.id,
            NotificationModel.read == False,
        )
        .all()
    )
    count = len(unread)
    for n in unread:
        n.read = True
    db.commit()
    return {"updated": count}

@router.patch("/{id}/read", response_model=NotificationResponse)
def mark_notification_read(
    id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    n = db.query(NotificationModel).filter(
        NotificationModel.id == id,
        NotificationModel.user_id == current_user.id,
    ).first()
    if not n:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    n.read = True
    db.commit()
    db.refresh(n)
    return NotificationResponse.model_validate(n)
