from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import TravelRequestModel, GroupModel, UserModel
from ..schemas import MatchingResponse, MatchItem, ScoreBreakdown
from ..auth import get_current_user

router = APIRouter(prefix="/matching", tags=["matching"])

def parse_date(d_str: str) -> datetime:
    return datetime.strptime(d_str[:10], "%Y-%m-%d")

@router.get("/{request_id}", response_model=MatchingResponse)
def get_matches_for_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    req = db.query(TravelRequestModel).filter(
        TravelRequestModel.id == request_id,
        TravelRequestModel.user_id == current_user.id,
    ).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    candidate_groups = (
        db.query(GroupModel)
        .filter(
            GroupModel.origin_id == req.origin_id,
            GroupModel.destination_id == req.destination_id,
            GroupModel.status != "closed",
        )
        .all()
    )

    req_date = parse_date(req.departure_date)
    matches = []
    for g in candidate_groups:
        g_target = parse_date(g.target_date)
        diff_days = abs((g_target - req_date).days)
        date_compatible = diff_days <= (req.flexibility_days + 2)
        available_cap = g.max_seats - g.seats_filled

        # Score formula: deduct 12 per day diff, deduct 30 if insufficient capacity
        score = 100 - (diff_days * 12) - (30 if available_cap < req.passenger_count else 0)
        score = max(0, min(100, score))

        capacity_explanation = (
            f"Not enough passenger seats: 30 points deducted"
            if available_cap < req.passenger_count
            else f"{available_cap} passenger seats available: no deduction"
        )
        budget_explanation = (
            "Budget not scored: an available fare is not guaranteed."
            if req.max_budget
            else "No budget set; no budget deduction."
        )

        matches.append(
            MatchItem(
                group_id=g.id,
                route=g.route,
                target_date=g.target_date,
                window_start=g.window_start,
                window_end=g.window_end,
                passengers=g.seats_filled,
                available_capacity=available_cap,
                match_score=score,
                date_compatible=date_compatible,
                status=g.status,
                score_breakdown=ScoreBreakdown(
                    date=f"{diff_days} day difference: {diff_days * 12} points deducted from 100",
                    budget=budget_explanation,
                    capacity=capacity_explanation,
                ),
            )
        )

    matches.sort(key=lambda m: m.match_score, reverse=True)
    return MatchingResponse(request_id=request_id, matches=matches)
