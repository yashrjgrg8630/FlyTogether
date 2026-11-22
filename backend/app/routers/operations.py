from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import UserModel, GroupModel
from ..auth import require_admin
from ..services.clustering import cluster_and_form_groups
from ..services.rfq import generate_group_rfq

router = APIRouter(prefix="/admin", tags=["admin-operations"])

@router.post("/clustering/run")
def trigger_demand_clustering(
    min_seats: int = 10,
    db: Session = Depends(get_db),
    admin: UserModel = Depends(require_admin),
):
    """
    Scans open, ungrouped traveller requirements and automatically groups
    co-travellers heading on identical routes and dates when pooled seats >= min_seats.
    """
    result = cluster_and_form_groups(db, min_seats_threshold=min_seats)
    return {
        "status": "success",
        "message": f"Clustering run complete: {result['groups_created']} groups created from {result['requests_grouped']} pooled passenger requirements.",
        "data": result,
    }

@router.get("/groups/{group_id}/rfq")
def get_group_airline_rfq(
    group_id: str,
    db: Session = Depends(get_db),
    admin: UserModel = Depends(require_admin),
):
    """
    Generates a formal, standardized Request For Quotation (RFQ) packet
    for airline group sales desks.
    """
    group = db.query(GroupModel).filter(GroupModel.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    if group.status not in ["quotation_eligible", "quote_requested", "quoted"]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Group has not reached the quotation threshold yet.",
        )

    return generate_group_rfq(group)
