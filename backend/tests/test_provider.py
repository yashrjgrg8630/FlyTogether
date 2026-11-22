import pytest
from app.providers.duffel import DuffelFlightProvider, CircuitBreaker
from app.schemas import FlightSearchPayload

def test_duffel_provider_gated_by_default():
    provider = DuffelFlightProvider()
    assert not provider.is_configured_and_permitted

    payload = FlightSearchPayload(
        origin="BLR",
        destination="DEL",
        departure_date="2027-01-10",
        passengers=2,
        cabin="economy",
    )
    res = provider.search_flights(payload)
    assert not res.live_provider_active
    assert len(res.offers) == 0
    assert "Live flight data is currently unavailable" in res.notice
    assert "Production searches disabled" in res.notice

def test_duffel_health_check_reports_blocked():
    provider = DuffelFlightProvider()
    health = provider.check_health()
    assert health.provider_name == "Duffel Flights"
    assert health.status == "blocked"
    assert not health.enabled
    assert "Production searches disabled" in health.error_message

def test_circuit_breaker_transition():
    cb = CircuitBreaker(failure_threshold=3, recovery_timeout=1.0)
    assert cb.state == "CLOSED"
    assert cb.allow_request()

    cb.record_failure()
    cb.record_failure()
    assert cb.state == "CLOSED"

    cb.record_failure()
    assert cb.state == "OPEN"
    assert not cb.allow_request()

    # After recovery
    import time
    time.sleep(1.1)
    assert cb.allow_request()
    assert cb.state == "HALF-OPEN"

    cb.record_success()
    assert cb.state == "CLOSED"
