from abc import ABC, abstractmethod
from typing import List, Optional
from ..schemas import (
    FlightSearchPayload,
    FlightSearchResponse,
    FlightOffer,
    ProviderHealthResponse,
)

class BaseFlightProvider(ABC):
    """Abstract base class for external flight data suppliers."""

    @abstractmethod
    def search_flights(self, payload: FlightSearchPayload) -> FlightSearchResponse:
        """Search flight offers."""
        pass

    @abstractmethod
    def get_offer(self, offer_id: str) -> Optional[FlightOffer]:
        """Fetch a specific flight offer by supplier ID."""
        pass

    @abstractmethod
    def check_health(self) -> ProviderHealthResponse:
        """Check provider operational status and circuit breaker state."""
        pass
