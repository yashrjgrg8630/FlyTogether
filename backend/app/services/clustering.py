from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..models import (
    TravelRequestModel,
    GroupModel,
    GroupMemberModel,
    AirportModel,
    UserModel,
)
from ..auth import to_safe_alias
from .notifications import dispatch_notification

def parse_date(date_str: str) -> datetime:
    return datetime.strptime(date_str[:10], "%Y-%m-%d")

def cluster_and_form_groups(db: Session, min_seats_threshold: int = 10) -> Dict[str, Any]:
    """
    Scans open travel requests and automatically clusters compatible demands on identical routes
    and overlapping dates. When pooled passenger seats reach threshold, forms a new group.
    """
    open_requests = (
        db.query(TravelRequestModel)
        .filter(
            TravelRequestModel.status == "open",
            TravelRequestModel.group_id == None,
        )
        .all()
    )

    if not open_requests:
        return {"groups_created": 0, "requests_grouped": 0, "groups": []}

    # Group requests by route: (origin_id, destination_id)
    route_buckets: Dict[tuple, List[TravelRequestModel]] = {}
    for req in open_requests:
        key = (req.origin_id, req.destination_id)
        route_buckets.setdefault(key, []).append(req)

    created_groups: List[str] = []
    total_requests_grouped = 0

    for (origin_id, dest_id), reqs in route_buckets.items():
        if len(reqs) < 2 and sum(r.passenger_count for r in reqs) < min_seats_threshold:
            continue

        # Sort by departure date
        reqs.sort(key=lambda r: r.departure_date)

        clusters: List[List[TravelRequestModel]] = []
        for req in reqs:
            req_d = parse_date(req.departure_date)
            assigned = False
            for cluster in clusters:
                # Check if compatible with cluster anchor
                anchor = cluster[0]
                anchor_d = parse_date(anchor.departure_date)
                max_flex = max(anchor.flexibility_days, req.flexibility_days) + 2
                if abs((anchor_d - req_d).days) <= max_flex:
                    cluster.append(req)
                    assigned = True
                    break
            if not assigned:
                clusters.append([req])

        # Evaluate each cluster
        for cluster in clusters:
            total_seats = sum(r.passenger_count for r in cluster)
            if total_seats >= min_seats_threshold:
                origin = db.query(AirportModel).filter(AirportModel.id == origin_id).first()
                dest = db.query(AirportModel).filter(AirportModel.id == dest_id).first()
                if not origin or not dest:
                    continue

                dates = [parse_date(r.departure_date) for r in cluster]
                min_date = min(dates)
                max_date = max(dates)
                target_date = (min_date + (max_date - min_date) // 2).strftime("%Y-%m-%d")
                window_start = (min_date - timedelta(days=2)).strftime("%Y-%m-%d")
                window_end = (max_date + timedelta(days=2)).strftime("%Y-%m-%d")

                status = "quotation_eligible" if total_seats >= 10 else "forming"
                now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

                new_group = GroupModel(
                    route=f"{origin.iata_code}-{dest.iata_code}",
                    origin_id=origin.id,
                    destination_id=dest.id,
                    target_date=target_date,
                    window_start=window_start,
                    window_end=window_end,
                    seats_filled=total_seats,
                    max_seats=max(30, total_seats + 10),
                    min_seats_for_quote=10,
                    status=status,
                    created_at=now_str,
                )
                db.add(new_group)
                db.flush() # obtain new_group.id

                # Attach members and update requests
                for r in cluster:
                    r.status = "grouped"
                    r.group_id = new_group.id
                    user = db.query(UserModel).filter(UserModel.id == r.user_id).first()
                    display_alias = to_safe_alias(user.full_name) if user else "Traveller"

                    member = GroupMemberModel(
                        group_id=new_group.id,
                        travel_request_id=r.id,
                        user_id=r.user_id,
                        display_name=display_alias,
                        passenger_count=r.passenger_count,
                        joined_at=now_str,
                    )
                    db.add(member)

                    if user:
                        dispatch_notification(
                            db=db,
                            user=user,
                            title="New group formed on your route!",
                            message=f"Your flight request for {origin.city} → {dest.city} was grouped with co-travellers! {total_seats} passenger seats are now pooled.",
                            link=f"/groups/{new_group.id}",
                        )

                db.commit()
                created_groups.append(new_group.id)
                total_requests_grouped += len(cluster)

    return {
        "groups_created": len(created_groups),
        "requests_grouped": total_requests_grouped,
        "group_ids": created_groups,
    }
