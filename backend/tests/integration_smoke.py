"""Full integration smoke test — verifies every frontend service call works against the backend."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from app.main import app

c = TestClient(app)

# 1. Health
r = c.get("/health")
assert r.status_code == 200
print("1. Health:", r.json()["status"])

# 2. Login traveller
r = c.post("/api/v1/auth/login", json={"email": "traveller@demo.com", "password": "demo1234"})
assert r.status_code == 200
d = r.json()
assert "access_token" in d and "user" in d
assert d["user"]["email"] == "traveller@demo.com"
assert d["user"]["role"] == "traveller"
assert set(d["user"].keys()) == {"id", "full_name", "email", "role"}
token = d["access_token"]
h = {"Authorization": f"Bearer {token}"}
print("2. Login: OK, token len =", len(token))

# 3. /users/me
r = c.get("/api/v1/users/me", headers=h)
assert r.status_code == 200
me = r.json()
assert me["full_name"] == "Aarav Sharma"
print("3. Me:", me["full_name"])

# 4. Register (new user)
import time
smoke_email = f"test_{int(time.time()*1000)}@smoke.com"
r = c.post("/api/v1/auth/register", json={"full_name": "Test User", "email": smoke_email, "password": "test1234"})
assert r.status_code == 200
assert r.json()["user"]["email"] == smoke_email
# Duplicate register
r = c.post("/api/v1/auth/register", json={"full_name": "Test User", "email": smoke_email, "password": "test1234"})
assert r.status_code == 409
print("4. Register: OK + dup rejected")

# 5. Airports
r = c.get("/api/v1/airports?q=BLR")
assert r.status_code == 200 and len(r.json()) >= 1
blr = r.json()[0]
assert blr["iata_code"] == "BLR"
assert set(blr.keys()) == {"id", "iata_code", "airport_name", "city", "country"}
r = c.get("/api/v1/airports")
assert r.status_code == 200 and len(r.json()) == 25  # capped at 25
print("5. Airports: OK, 25 capped")

# 6. Travel requests - list mine
r = c.get("/api/v1/travel-requests/my", headers=h)
assert r.status_code == 200
reqs = r.json()
print("6. My requests:", len(reqs))
for req in reqs:
    assert "origin" in req  # nested object or null
    assert "created_at" in req

# 7. Create travel request
r = c.post("/api/v1/travel-requests", headers=h, json={
    "origin_id": "ap_MAA", "destination_id": "ap_CCU",
    "departure_date": "2027-01-15", "flexibility_days": 3,
    "passenger_count": 2, "max_budget": 7000
})
assert r.status_code == 200
new_req = r.json()
assert new_req["status"] == "open"
assert new_req["origin"]["iata_code"] == "MAA"
assert new_req["destination"]["iata_code"] == "CCU"
new_req_id = new_req["id"]
print("7. Create request:", new_req_id)

# Origin == destination rejected
r = c.post("/api/v1/travel-requests", headers=h, json={
    "origin_id": "ap_BLR", "destination_id": "ap_BLR",
    "departure_date": "2027-01-15", "flexibility_days": 2,
    "passenger_count": 1
})
assert r.status_code == 422

# 8. Update request
r = c.patch(f"/api/v1/travel-requests/{new_req_id}", headers=h, json={
    "origin_id": "ap_MAA", "destination_id": "ap_CCU",
    "departure_date": "2027-01-20", "flexibility_days": 4,
    "passenger_count": 3, "max_budget": 8000
})
assert r.status_code == 200
assert r.json()["passenger_count"] == 3
print("8. Update request: OK")

# 9. Delete (cancel) request
r = c.delete(f"/api/v1/travel-requests/{new_req_id}", headers=h)
assert r.status_code == 204
print("9. Cancel request: OK")

# 10. Groups list
r = c.get("/api/v1/groups")
assert r.status_code == 200
groups = r.json()
assert len(groups) == 10
for g in groups:
    assert isinstance(g["origin"], dict)
    assert isinstance(g["destination"], dict)
    assert "seats_filled" in g and "max_seats" in g
print("10. Groups: 10 total")

# Groups with filter
r = c.get("/api/v1/groups?origin=BLR&status=quoted")
assert r.status_code == 200
filtered = r.json()
assert all(g["origin"]["iata_code"] == "BLR" and g["status"] == "quoted" for g in filtered)
print("    Filtered (BLR+quoted):", len(filtered))

# 11. Group detail
r = c.get("/api/v1/groups/g_1")
assert r.status_code == 200
g1 = r.json()
assert g1["route"] == "BLR-DEL"
assert g1["origin"]["city"] == "Bengaluru"
print("11. Group g_1:", g1["route"])

# 12. Group members
r = c.get("/api/v1/groups/g_1/members")
assert r.status_code == 200
mems = r.json()
assert len(mems) >= 1
print("12. g_1 members:", len(mems), "->", [m["display_name"] for m in mems])

# 13. Group quotes (traveller view)
r = c.get("/api/v1/groups/g_1/quotes")
assert r.status_code == 200
gq = r.json()
for q in gq:
    assert q["status"] != "draft", f"Draft leaked: {q['id']}"
print("13. g_1 quotes:", len(gq), "(no drafts)")

# Check g_8 quotes — draft q_5 must NOT appear
r = c.get("/api/v1/groups/g_8/quotes")
assert r.status_code == 200
g8q = r.json()
assert all(q["id"] != "q_5" for q in g8q), "Draft q_5 leaked to traveller"
print("    g_8 quotes:", len(g8q), "(draft q_5 hidden)")

# 14. Matching
r = c.get("/api/v1/matching/r_2", headers=h)
assert r.status_code == 200
md = r.json()
assert md["request_id"] == "r_2"
assert len(md["matches"]) >= 1
m0 = md["matches"][0]
assert "score_breakdown" in m0
assert m0["score_breakdown"]["budget"] == "No budget set; no budget deduction."
print("14. Matching for r_2:", len(md["matches"]), "matches, top score =", m0["match_score"])

# 15. Group join/leave
r = c.post("/api/v1/groups/g_2/join", headers=h, json={"travel_request_id": "r_2"})
assert r.status_code == 200
assert r.json()["seats_filled"] == 8  # was 6, r_2 has 2 pax
print("15. Join g_2: seats now", r.json()["seats_filled"])

# Duplicate join
r = c.post("/api/v1/groups/g_2/join", headers=h, json={"travel_request_id": "r_2"})
assert r.status_code == 409
print("    Duplicate join: 409 OK")

# Leave
r = c.post("/api/v1/groups/g_2/leave", headers=h)
assert r.status_code == 204
r = c.get("/api/v1/groups/g_2")
assert r.json()["seats_filled"] == 6  # restored
print("    Leave g_2: seats restored to", r.json()["seats_filled"])

# 16. Notifications
r = c.get("/api/v1/notifications", headers=h)
assert r.status_code == 200
notifs = r.json()
assert len(notifs) >= 1
for n in notifs:
    assert set(n.keys()) >= {"id", "title", "message", "read", "created_at"}
print("16. Notifications:", len(notifs))

# Mark all read
r = c.patch("/api/v1/notifications/read-all", headers=h)
assert r.status_code == 200
assert "updated" in r.json()
print("    Mark all read:", r.json())

# 17. Admin login
r = c.post("/api/v1/auth/login", json={"email": "admin@demo.com", "password": "demo1234"})
assert r.status_code == 200
ah = {"Authorization": f"Bearer {r.json()['access_token']}"}

# 18. Admin analytics
r = c.get("/api/v1/admin/analytics", headers=ah)
assert r.status_code == 200
a = r.json()
assert set(a.keys()) == {"total_users", "total_requests", "active_groups", "groups_awaiting_quotes", "popular_routes", "requests_over_time"}
print("18. Analytics: users=", a["total_users"], "active_groups=", a["active_groups"])

# RBAC: traveller blocked
r = c.get("/api/v1/admin/analytics", headers=h)
assert r.status_code == 403
print("    RBAC traveller blocked: 403")

# 19. Festival demand
r = c.get("/api/v1/admin/analytics/festival-demand", headers=ah)
assert r.status_code == 200
fd = r.json()
assert len(fd["festivals"]) == 6
print("19. Festival demand:", len(fd["festivals"]), "festivals,", len(fd["rows"]), "routes")

# 20. Admin quotes list (includes drafts)
r = c.get("/api/v1/admin/quotes", headers=ah)
assert r.status_code == 200
aq = r.json()
has_draft = any(q["status"] == "draft" for q in aq)
assert has_draft, "Admin should see drafts"
print("20. Admin quotes:", len(aq), "(has drafts:", has_draft, ")")

# 21. Flight search (offline)
r = c.post("/api/v1/flights/search", headers=h, json={
    "origin": "BLR", "destination": "DEL",
    "departure_date": "2026-12-25", "passengers": 2, "cabin": "economy"
})
assert r.status_code == 200
fs = r.json()
assert fs["live_provider_active"] == False
assert "Live flight data is currently unavailable" in fs["notice"]
print("21. Flight search: live =", fs["live_provider_active"])

# 22. Provider health (admin)
r = c.get("/api/v1/admin/providers/health", headers=ah)
assert r.status_code == 200
ph = r.json()
assert ph[0]["provider_name"] == "Duffel Flights"
assert ph[0]["status"] == "blocked"
print("22. Provider health:", ph[0]["status"])

print()
print("=" * 50)
print("ALL 22 INTEGRATION CHECKS PASSED")
print("=" * 50)
