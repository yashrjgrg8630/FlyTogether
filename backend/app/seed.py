from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import (
    AirportModel,
    UserModel,
    GroupModel,
    GroupMemberModel,
    TravelRequestModel,
    QuoteModel,
    NotificationModel,
)
from .auth import get_password_hash, to_safe_alias

INITIAL_AIRPORTS = [
    ("ap_BLR", "BLR", "Kempegowda International", "Bengaluru"),
    ("ap_DEL", "DEL", "Indira Gandhi International", "New Delhi"),
    ("ap_BOM", "BOM", "Chhatrapati Shivaji Maharaj International", "Mumbai"),
    ("ap_HYD", "HYD", "Rajiv Gandhi International", "Hyderabad"),
    ("ap_MAA", "MAA", "Chennai International", "Chennai"),
    ("ap_CCU", "CCU", "Netaji Subhas Chandra Bose International", "Kolkata"),
    ("ap_PNQ", "PNQ", "Pune Airport", "Pune"),
    ("ap_GOI", "GOI", "Dabolim Airport", "Goa"),
    ("ap_GOX", "GOX", "Manohar International", "North Goa"),
    ("ap_AMD", "AMD", "Sardar Vallabhbhai Patel International", "Ahmedabad"),
    ("ap_JAI", "JAI", "Jaipur International", "Jaipur"),
    ("ap_LKO", "LKO", "Chaudhary Charan Singh International", "Lucknow"),
    ("ap_COK", "COK", "Cochin International", "Kochi"),
    ("ap_TRV", "TRV", "Trivandrum International", "Thiruvananthapuram"),
    ("ap_GAU", "GAU", "Lokpriya Gopinath Bordoloi International", "Guwahati"),
    ("ap_IXC", "IXC", "Chandigarh International", "Chandigarh"),
    ("ap_PAT", "PAT", "Jay Prakash Narayan International", "Patna"),
    ("ap_BBI", "BBI", "Biju Patnaik International", "Bhubaneswar"),
    ("ap_NAG", "NAG", "Dr. Babasaheb Ambedkar International", "Nagpur"),
    ("ap_IDR", "IDR", "Devi Ahilya Bai Holkar", "Indore"),
    ("ap_SXR", "SXR", "Sheikh ul-Alam International", "Srinagar"),
    ("ap_IXB", "IXB", "Bagdogra Airport", "Siliguri"),
    ("ap_VNS", "VNS", "Lal Bahadur Shastri International", "Varanasi"),
    ("ap_IXZ", "IXZ", "Veer Savarkar International", "Port Blair"),
    ("ap_CJB", "CJB", "Coimbatore International", "Coimbatore"),
    ("ap_IXM", "IXM", "Madurai Airport", "Madurai"),
]

def d(offset: int) -> str:
    return (datetime.now() + timedelta(days=offset)).strftime("%Y-%m-%d")

def seed_database(db: Session):
    # Seed airports
    if db.query(AirportModel).count() == 0:
        for ap_id, code, name, city in INITIAL_AIRPORTS:
            db.add(AirportModel(id=ap_id, iata_code=code, airport_name=name, city=city, country="India"))
        db.commit()

    # Seed users
    if db.query(UserModel).count() == 0:
        u_trav = UserModel(
            id="u_trav",
            full_name="Aarav Sharma",
            email="traveller@demo.com",
            role="traveller",
            password_hash=get_password_hash("demo1234"),
        )
        u_admin = UserModel(
            id="u_admin",
            full_name="Priya Nair",
            email="admin@demo.com",
            role="admin",
            password_hash=get_password_hash("demo1234"),
        )
        db.add_all([u_trav, u_admin])
        db.commit()

    # Seed initial groups
    if db.query(GroupModel).count() == 0:
        group_specs = [
            ("g_1", "BLR", "DEL", 21, 14, 30, "quoted"),
            ("g_2", "BOM", "GOI", 18, 6, 20, "forming"),
            ("g_3", "DEL", "BOM", 30, 22, 30, "quoted"),
            ("g_4", "HYD", "BLR", 14, 11, 25, "quote_requested"),
            ("g_5", "MAA", "CCU", 40, 4, 20, "forming"),
            ("g_6", "BLR", "DEL", 35, 30, 30, "closed"),
            ("g_7", "PNQ", "JAI", 26, 9, 18, "forming"),
            ("g_8", "COK", "DEL", 24, 18, 24, "quoted"),
            ("g_9", "AMD", "BLR", 45, 2, 20, "forming"),
            ("g_10", "LKO", "BOM", 28, 12, 20, "quotation_eligible"),
        ]
        for gid, orig, dest, off, filled, max_s, status in group_specs:
            g = GroupModel(
                id=gid,
                route=f"{orig}-{dest}",
                origin_id=f"ap_{orig}",
                destination_id=f"ap_{dest}",
                target_date=d(off),
                window_start=d(off - 2),
                window_end=d(off + 2),
                seats_filled=filled,
                max_seats=max_s,
                min_seats_for_quote=10,
                status=status,
                quote_deadline=d(5) if status == "quote_requested" else None,
                created_at=d(-10),
            )
            db.add(g)
        db.commit()

    # Seed requests and memberships
    if db.query(TravelRequestModel).count() == 0:
        r1 = TravelRequestModel(
            id="r_1",
            user_id="u_trav",
            origin_id="ap_BLR",
            destination_id="ap_DEL",
            departure_date=d(21),
            flexibility_days=2,
            passenger_count=3,
            max_budget=6500.0,
            status="grouped",
            group_id="g_1",
        )
        r2 = TravelRequestModel(
            id="r_2",
            user_id="u_trav",
            origin_id="ap_BOM",
            destination_id="ap_GOI",
            departure_date=d(19),
            flexibility_days=3,
            passenger_count=2,
            max_budget=None,
            status="open",
            group_id=None,
        )
        db.add_all([r1, r2])
        db.commit()

        # Memberships for g_1
        m1 = GroupMemberModel(
            id="gm_1",
            group_id="g_1",
            travel_request_id="r_1",
            user_id="u_trav",
            display_name=to_safe_alias("Aarav Sharma"),
            passenger_count=3,
            joined_at=d(-5),
        )
        db.add(m1)
        db.commit()

    # Seed quotations
    if db.query(QuoteModel).count() == 0:
        initial_quotes = [
            ("q_6", "g_1", "IndiGo", 5180.0, 30, "simulated", "15 kg check-in, 7 kg cabin", "Illustrative group fare.", d(7), "published"),
            ("q_7", "g_1", "Air India", 5640.0, 20, "manual", "25 kg check-in, meal included", "Indicative group quote entered by admin.", d(10), "published"),
            ("q_1", "g_3", "IndiGo", 4850.0, 30, "simulated", "15 kg check-in, 7 kg cabin", "Group fare, name changes up to 7 days before departure.", d(6), "published"),
            ("q_2", "g_3", "Air India", 5320.0, 25, "manual", "25 kg check-in, 8 kg cabin, meal included", "Indicative group quote.", d(9), "published"),
            ("q_3", "g_3", "Akasa Air", 4590.0, 30, "simulated", "15 kg check-in, 7 kg cabin", "Illustrative fare.", d(-1), "expired"),
            ("q_4", "g_8", "Vistara", 6100.0, 24, "manual", "20 kg check-in, 7 kg cabin", "Indicative group quote entered by admin.", d(4), "published"),
            ("q_5", "g_8", "SpiceJet", 5450.0, 24, "simulated", "15 kg check-in", "Illustrative fare.", d(5), "draft"),
        ]
        for qid, gid, airline, price, seats, src, bag, terms, until, status in initial_quotes:
            db.add(QuoteModel(
                id=qid, group_id=gid, airline_name=airline, price_per_passenger=price,
                available_seats=seats, source_type=src, baggage_details=bag, terms=terms,
                valid_until=until, status=status
            ))
        db.commit()

    # Seed notifications
    if db.query(NotificationModel).count() == 0:
        initial_notifs = [
            ("n_1", "u_trav", "Group reached quote threshold", "BLR → DEL on your dates now has 14 seats filled. An admin can request airline quotes.", False, "/groups/g_1", d(-1)),
            ("n_2", "u_trav", "New match found", "Your BOM → GOI request matches a forming group.", False, "/discover", d(-2)),
            ("n_3", "u_trav", "Welcome to FlyTogether", "Publish a flight requirement to start finding co-travellers.", True, None, d(-9)),
            ("n_4", "u_admin", "2 groups awaiting quotes", "BLR → DEL and LKO → BOM crossed the seat threshold.", False, "/admin/groups", d(-1)),
        ]
        for nid, uid, title, msg, read, link, c_at in initial_notifs:
            db.add(NotificationModel(id=nid, user_id=uid, title=title, message=msg, read=read, link=link, created_at=c_at))
        db.commit()
