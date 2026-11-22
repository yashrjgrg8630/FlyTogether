from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models import GroupModel, AirportModel

AIRLINE_DESKS = [
    {"airline": "IndiGo", "desk": "Group Desk", "email": "groups@goindigo.in"},
    {"airline": "Air India", "desk": "Group Booking Services", "email": "groupdesk@airindia.com"},
    {"airline": "SpiceJet", "desk": "Special Group Travel", "email": "groups@spicejet.com"},
    {"airline": "Akasa Air", "desk": "Group Sales", "email": "groupsales@akasaair.com"},
]

def generate_group_rfq(group: GroupModel) -> Dict[str, Any]:
    """
    Generates a formal, standardized Request For Quotation (RFQ) packet
    for an airline group booking desk.
    """
    origin = group.origin
    destination = group.destination
    ref_code = f"FT-RFQ-{group.id.upper()}"
    today_str = datetime.now(timezone.utc).strftime("%d %b %Y")

    subject = f"[{ref_code}] Group Quotation Request: {origin.iata_code} → {destination.iata_code} ({group.seats_filled} Passenger Seats)"

    body = f"""To: Airline Group Travel Desk

REQUEST FOR GROUP QUOTATION
Reference Code: {ref_code}
Date: {today_str}

Dear Airline Group Sales Team,

FlyTogether is requesting a group flight quotation on behalf of a verified group of registered travellers with pooled demand on your route.

1. ROUTE & ITINERARY
- Origin: {origin.city} ({origin.iata_code} - {origin.airport_name})
- Destination: {destination.city} ({destination.iata_code} - {destination.airport_name})
- Preferred Travel Date: {group.target_date}
- Acceptable Travel Window: {group.window_start} to {group.window_end}

2. PASSENGER CAPACITY
- Confirmed Passenger Seats Required: {group.seats_filled} seats
- Maximum Group Capacity: {group.max_seats} seats

3. SERVICE SPECIFICATIONS
- Class: Economy
- Standard Baggage: Check-in (15 kg+) + Cabin (7 kg)
- Quotation Validity Requested: Minimum 5 business days

4. TERMS & COMPLIANCE
- FlyTogether aggregates registered demand and presents authorized airline quotations to group co-travellers.
- FlyTogether does not purchase tickets or mark up airline fares.
- Travellers confirm bookings directly through the airline's authorized channels.

Please provide your net per-passenger fare, payment terms, and name-change conditions by replying with this reference code: {ref_code}.

Sincerely,
FlyTogether Group Operations Desk
Website: https://flytogether.antideploy.app
Disclaimers: FlyTogether aggregates demand. It does not sell tickets or reserve seats.
"""

    return {
        "reference_code": ref_code,
        "group_id": group.id,
        "route": f"{origin.iata_code}-{destination.iata_code}",
        "seats": group.seats_filled,
        "target_date": group.target_date,
        "subject": subject,
        "email_body": body.strip(),
        "airline_desks": AIRLINE_DESKS,
    }
