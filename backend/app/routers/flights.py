from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import (
    FlightSearchPayload,
    FlightSearchResponse,
    FlightOffer,
    ProviderHealthResponse,
)
from ..models import UserModel
from ..auth import get_current_user, require_admin
from ..providers import get_flight_provider

router = APIRouter(tags=["flights"])

@router.post("/flights/search", response_model=FlightSearchResponse)
def search_flights(
    payload: FlightSearchPayload,
    current_user: UserModel = Depends(get_current_user),
):
    provider = get_flight_provider()
    return provider.search_flights(payload)

@router.get("/flights/offers/{id}", response_model=FlightOffer)
def get_flight_offer(
    id: str,
    current_user: UserModel = Depends(get_current_user),
):
    provider = get_flight_provider()
    offer = provider.get_offer(id)
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight offer not found or supplier expired.",
        )
    return offer

@router.get("/admin/providers/health", response_model=List[ProviderHealthResponse])
def get_provider_health(admin: UserModel = Depends(require_admin)):
    provider = get_flight_provider()
    return [provider.check_health()]
