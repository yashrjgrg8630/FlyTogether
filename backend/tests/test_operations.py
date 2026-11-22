import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app

client = TestClient(app)

def get_admin_token():
    res = client.post("/api/v1/auth/login", json={"email": "admin@demo.com", "password": "demo1234"})
    assert res.status_code == 200
    return res.json()["access_token"]

def test_security_headers_present():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert res.headers.get("X-XSS-Protection") == "1; mode=block"

def test_admin_rfq_generation():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/admin/groups/g_1/rfq", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "reference_code" in data
    assert "subject" in data
    assert "email_body" in data
    assert len(data["airline_desks"]) >= 3
    assert any(d["airline"] == "IndiGo" for d in data["airline_desks"])
    assert "REQUEST FOR GROUP QUOTATION" in data["email_body"]

def test_admin_trigger_clustering_endpoint():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.post("/api/v1/admin/clustering/run?min_seats=15", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "groups_created" in data["data"]
