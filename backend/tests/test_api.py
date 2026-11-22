import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Allow running from either the backend/ dir or the project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app
from app.database import Base, get_db
from app.seed import seed_database

# Use an in-memory SQLite database with StaticPool for test suite isolation
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    with TestingSessionLocal() as db:
        seed_database(db)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def get_auth_token(email="traveller@demo.com", password="demo1234"):
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200
    return res.json()["access_token"]

def get_admin_token():
    return get_auth_token("admin@demo.com", "demo1234")

# Test 1: Health check
def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"
    assert "FlyTogether aggregates demand" in res.json()["disclaimer"]

# Test 2: Auth and me
def test_auth_login_and_me():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/users/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "traveller@demo.com"
    assert me_res.json()["role"] == "traveller"

# Test 3: Airports search
def test_airports_search():
    res = client.get("/api/v1/airports?q=BLR")
    assert res.status_code == 200
    airports = res.json()
    assert len(airports) >= 1
    assert airports[0]["iata_code"] == "BLR"

# Test 4: Travel request create, update, delete
def test_travel_request_lifecycle():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Create
    create_res = client.post(
        "/api/v1/travel-requests",
        headers=headers,
        json={
            "origin_id": "ap_BLR",
            "destination_id": "ap_DEL",
            "departure_date": "2026-12-25",
            "flexibility_days": 2,
            "passenger_count": 2,
            "max_budget": 5000.0,
        },
    )
    assert create_res.status_code == 200
    req_id = create_res.json()["id"]
    assert create_res.json()["status"] == "open"

    # Reject identical origin/destination
    bad_res = client.post(
        "/api/v1/travel-requests",
        headers=headers,
        json={
            "origin_id": "ap_BLR",
            "destination_id": "ap_BLR",
            "departure_date": "2026-12-25",
            "flexibility_days": 2,
            "passenger_count": 2,
        },
    )
    assert bad_res.status_code == 422

    # Update
    patch_res = client.patch(
        f"/api/v1/travel-requests/{req_id}",
        headers=headers,
        json={
            "origin_id": "ap_BLR",
            "destination_id": "ap_DEL",
            "departure_date": "2026-12-26",
            "flexibility_days": 3,
            "passenger_count": 3,
            "max_budget": 6000.0,
        },
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["passenger_count"] == 3

    # Delete (cancel)
    del_res = client.delete(f"/api/v1/travel-requests/{req_id}", headers=headers)
    assert del_res.status_code == 204

# Test 5: Matching engine score calculation
def test_matching_engine():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/matching/r_2", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["request_id"] == "r_2"
    assert len(data["matches"]) >= 1
    first_match = data["matches"][0]
    assert first_match["score_breakdown"]["budget"] == "No budget set; no budget deduction."

# Test 6: Group join and leave concurrency & capacity rules
def test_group_join_and_leave():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Join group g_2 with open request r_2
    join_res = client.post(
        "/api/v1/groups/g_2/join",
        headers=headers,
        json={"travel_request_id": "r_2"},
    )
    assert join_res.status_code == 200
    assert join_res.json()["seats_filled"] == 8

    # Safe display alias check
    members_res = client.get("/api/v1/groups/g_2/members")
    assert members_res.status_code == 200
    member = next(m for m in members_res.json() if m["travel_request_id"] == "r_2")
    assert member["display_name"] == "Aarav S."

    # Duplicate join returns 409
    dup_res = client.post(
        "/api/v1/groups/g_2/join",
        headers=headers,
        json={"travel_request_id": "r_2"},
    )
    assert dup_res.status_code == 409

    # Leave group restores seats
    leave_res = client.post("/api/v1/groups/g_2/leave", headers=headers)
    assert leave_res.status_code == 204

    # Verify seats restored
    g2_res = client.get("/api/v1/groups/g_2")
    assert g2_res.json()["seats_filled"] == 6

# Test 7: Admin RBAC protection
def test_admin_rbac_protection():
    traveller_token = get_auth_token()
    headers = {"Authorization": f"Bearer {traveller_token}"}

    # Traveller blocked from admin analytics (403)
    res1 = client.get("/api/v1/admin/analytics", headers=headers)
    assert res1.status_code == 403

    # Traveller blocked from admin quote creation (403)
    res2 = client.post(
        "/api/v1/admin/quotes",
        headers=headers,
        json={
            "group_id": "g_1",
            "airline_name": "Test",
            "price_per_passenger": 5000,
            "available_seats": 20,
            "source_type": "manual",
            "baggage_details": "15kg",
            "terms": "terms",
            "valid_until": "2027-01-01",
        },
    )
    assert res2.status_code == 403

    # Admin allowed
    admin_token = get_admin_token()
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    admin_res = client.get("/api/v1/admin/analytics", headers=admin_headers)
    assert admin_res.status_code == 200

# Test 8: Notifications read-all route precedence
def test_notifications_route_precedence():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.patch("/api/v1/notifications/read-all", headers=headers)
    assert res.status_code == 200
    assert "updated" in res.json()

# Test 9: Live flight search returns honest offline notice when provider disabled
def test_flight_search_offline_notice():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.post(
        "/api/v1/flights/search",
        headers=headers,
        json={
            "origin": "BLR",
            "destination": "DEL",
            "departure_date": "2026-12-25",
            "passengers": 2,
            "cabin": "economy",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["live_provider_active"] == False
    assert "Live flight data is currently unavailable" in data["notice"]
    assert len(data["offers"]) == 0

# Test 10: Group creation by admin with RBAC protection
def test_admin_create_group():
    admin_token = get_admin_token()
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.post(
        "/api/v1/groups",
        headers=headers,
        json={
            "origin_id": "ap_BLR",
            "destination_id": "ap_GOI",
            "target_date": "2027-02-10",
            "window_start": "2027-02-08",
            "window_end": "2027-02-12",
            "max_seats": 25,
            "min_seats_for_quote": 10,
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["route"] == "BLR-GOI"
    assert data["status"] == "forming"
    assert data["seats_filled"] == 0

    # Non-admin forbidden
    traveller_token = get_auth_token()
    trav_headers = {"Authorization": f"Bearer {traveller_token}"}
    res_trav = client.post(
        "/api/v1/groups",
        headers=trav_headers,
        json={
            "origin_id": "ap_BLR",
            "destination_id": "ap_GOI",
            "target_date": "2027-02-10",
            "window_start": "2027-02-08",
            "window_end": "2027-02-12",
        },
    )
    assert res_trav.status_code == 403
