from .base import BaseFlightProvider
from .duffel import DuffelFlightProvider

_default_provider = DuffelFlightProvider()

def get_flight_provider() -> BaseFlightProvider:
    """Returns the singleton flight provider instance."""
    return _default_provider
