import time
import uuid
from datetime import datetime, timezone
from typing import Optional, List
import httpx
from ..config import settings
from ..schemas import (
    FlightSearchPayload,
    FlightSearchResponse,
    FlightOffer,
    ProviderHealthResponse,
)
from .base import BaseFlightProvider

class CircuitBreaker:
    """In-memory circuit breaker to prevent cascading failures to third-party travel APIs."""

    def __init__(self, failure_threshold: int = 5, recovery_timeout: float = 60.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = 0.0
        self.state = "CLOSED"  # CLOSED, OPEN, HALF-OPEN

    def record_success(self):
        self.failure_count = 0
        self.state = "CLOSED"

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"

    def allow_request(self) -> bool:
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF-OPEN"
                return True
            return False
        # HALF-OPEN
        return True

class DuffelFlightProvider(BaseFlightProvider):
    """
    Duffel flight supplier integration adapter.
    
    STRICT SAFETY RULE:
    Live flight searches remain completely inactive until written commercial
    confirmation for search-only terms without order creation is secured.
    """

    def __init__(self):
        self.circuit_breaker = CircuitBreaker()
        self.provider_name = "Duffel Flights"

    @property
    def is_configured_and_permitted(self) -> bool:
        """Returns True only when Duffel live mode is explicitly enabled AND token is present."""
        return bool(settings.DUFFEL_LIVE_ENABLED and settings.DUFFEL_ACCESS_TOKEN)

    def search_flights(self, payload: FlightSearchPayload) -> FlightSearchResponse:
        search_id = f"srch_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:6]}"

        # Gate 1: Check permission flag and credentials
        if not self.is_configured_and_permitted:
            return FlightSearchResponse(
                search_id=search_id,
                origin=payload.origin,
                destination=payload.destination,
                departure_date=payload.departure_date,
                passengers=payload.passengers,
                offers=[],
                live_provider_active=False,
                retrieved_at=datetime.now(timezone.utc).isoformat(),
                notice="Live flight data is currently unavailable. Production searches disabled pending written commercial confirmation.",
            )

        # Gate 2: Circuit breaker check
        if not self.circuit_breaker.allow_request():
            return FlightSearchResponse(
                search_id=search_id,
                origin=payload.origin,
                destination=payload.destination,
                departure_date=payload.departure_date,
                passengers=payload.passengers,
                offers=[],
                live_provider_active=False,
                retrieved_at=datetime.now(timezone.utc).isoformat(),
                notice="Flight supplier is temporarily unavailable due to upstream rate limits or errors. Circuit breaker is open.",
            )

        # Gate 3: Live execution (only executes when fully cleared and configured)
        try:
            headers = {
                "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}",
                "Duffel-Version": settings.DUFFEL_API_VERSION,
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
            body = {
                "data": {
                    "slices": [
                        {
                            "origin": payload.origin,
                            "destination": payload.destination,
                            "departure_date": payload.departure_date,
                        }
                    ],
                    "passengers": [{"type": "adult"} for _ in range(payload.passengers)],
                    "cabin_class": payload.cabin or "economy",
                }
            }

            with httpx.Client(timeout=10.0) as client:
                resp = client.post(
                    f"{settings.DUFFEL_API_BASE_URL}/air/offer_requests",
                    headers=headers,
                    json=body,
                )
                if resp.status_code in [200, 201]:
                    self.circuit_breaker.record_success()
                    data = resp.json().get("data", {})
                    raw_offers = data.get("offers", [])
                    offers = self._map_offers(raw_offers)
                    return FlightSearchResponse(
                        search_id=search_id,
                        origin=payload.origin,
                        destination=payload.destination,
                        departure_date=payload.departure_date,
                        passengers=payload.passengers,
                        offers=offers,
                        live_provider_active=True,
                        retrieved_at=datetime.now(timezone.utc).isoformat(),
                    )
                else:
                    self.circuit_breaker.record_failure()
                    return FlightSearchResponse(
                        search_id=search_id,
                        origin=payload.origin,
                        destination=payload.destination,
                        departure_date=payload.departure_date,
                        passengers=payload.passengers,
                        offers=[],
                        live_provider_active=False,
                        retrieved_at=datetime.now(timezone.utc).isoformat(),
                        notice=f"Supplier returned status {resp.status_code}. No live offers retrieved.",
                    )
        except Exception as e:
            self.circuit_breaker.record_failure()
            return FlightSearchResponse(
                search_id=search_id,
                origin=payload.origin,
                destination=payload.destination,
                departure_date=payload.departure_date,
                passengers=payload.passengers,
                offers=[],
                live_provider_active=False,
                retrieved_at=datetime.now(timezone.utc).isoformat(),
                notice="Flight search error encountered while communicating with supplier.",
            )

    def get_offer(self, offer_id: str) -> Optional[FlightOffer]:
        if not self.is_configured_and_permitted:
            return None
        # In live mode with credentials, fetch from /air/offers/{offer_id}
        return None

    def check_health(self) -> ProviderHealthResponse:
        is_live = self.is_configured_and_permitted
        if not is_live:
            status = "blocked"
            msg = "Production searches disabled pending written search-only commercial confirmation."
        elif self.circuit_breaker.state == "OPEN":
            status = "degraded"
            msg = "Circuit breaker open: upstream supplier errors exceeded threshold."
        else:
            status = "operational"
            msg = None

        return ProviderHealthResponse(
            provider_name=self.provider_name,
            enabled=is_live,
            status=status,
            last_checked_at=datetime.now(timezone.utc).isoformat(),
            error_message=msg,
            rate_limit_remaining=None,
            rate_limit_reset_seconds=None,
        )

    def _map_offers(self, raw_offers: list) -> List[FlightOffer]:
        mapped = []
        now_iso = datetime.now(timezone.utc).isoformat()
        for ro in raw_offers:
            try:
                owner = ro.get("owner", {})
                slices = ro.get("slices", [])
                first_seg = slices[0]["segments"][0] if slices and slices[0].get("segments") else {}
                total_amt = float(ro.get("total_amount", 0.0))
                passengers = max(1, len(ro.get("passengers", [1])))
                price_per_pax = round(total_amt / passengers, 2)

                mapped.append(
                    FlightOffer(
                        id=f"off_{ro.get('id', uuid.uuid4().hex[:8])}",
                        supplier="duffel",
                        supplier_reference=ro.get("id", ""),
                        live_mode=True,
                        provenance="LIVE_SUPPLIER_DATA",
                        airline_name=owner.get("name", "Airline"),
                        airline_code=owner.get("iata_code", "XX"),
                        flight_number=first_seg.get("operating_carrier_flight_number", "FL100"),
                        price_per_passenger=price_per_pax,
                        total_amount=total_amt,
                        currency=ro.get("total_currency", "INR"),
                        available_seats=None,
                        baggage_details="Standard check-in and cabin baggage as per fare rules",
                        conditions="Individual scheduled flight fare; subject to airline terms and availability",
                        retrieved_at=now_iso,
                        expires_at=ro.get("expires_at", now_iso),
                        is_stale=False,
                    )
                )
            except Exception:
                continue
        return mapped
