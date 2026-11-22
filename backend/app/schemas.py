from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

class UserBase(BaseModel):
    id: str
    full_name: str
    email: str
    role: str

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

class AuthResponse(BaseModel):
    access_token: str
    user: UserResponse

class LoginPayload(BaseModel):
    email: str
    password: str

class RegisterPayload(BaseModel):
    full_name: str
    email: str
    password: str

class AirportResponse(BaseModel):
    id: str
    iata_code: str
    airport_name: str
    city: str
    country: str

    model_config = ConfigDict(from_attributes=True)

class TravelRequestPayload(BaseModel):
    origin_id: str
    destination_id: str
    departure_date: str
    flexibility_days: int = Field(ge=0, le=7)
    passenger_count: int = Field(ge=1, le=20)
    max_budget: Optional[float] = None

class TravelRequestResponse(BaseModel):
    id: str
    user_id: str
    origin_id: str
    destination_id: str
    departure_date: str
    flexibility_days: int
    passenger_count: int
    max_budget: Optional[float] = None
    status: str
    group_id: Optional[str] = None
    origin: Optional[AirportResponse] = None
    destination: Optional[AirportResponse] = None
    created_at: str

    model_config = ConfigDict(from_attributes=True)

class ScoreBreakdown(BaseModel):
    date: str
    budget: str
    capacity: str

class MatchItem(BaseModel):
    group_id: str
    route: str
    target_date: str
    window_start: str
    window_end: str
    passengers: int
    available_capacity: int
    match_score: int
    date_compatible: bool
    status: str
    score_breakdown: ScoreBreakdown

class MatchingResponse(BaseModel):
    request_id: str
    matches: List[MatchItem]

class GroupResponse(BaseModel):
    id: str
    route: str
    origin: AirportResponse
    destination: AirportResponse
    target_date: str
    window_start: str
    window_end: str
    seats_filled: int
    max_seats: int
    min_seats_for_quote: int
    status: str
    quote_deadline: Optional[str] = None
    created_at: str

    model_config = ConfigDict(from_attributes=True)

class GroupMemberResponse(BaseModel):
    group_id: str
    travel_request_id: str
    user_id: str
    display_name: str
    passenger_count: int
    joined_at: str

    model_config = ConfigDict(from_attributes=True)

class JoinGroupPayload(BaseModel):
    travel_request_id: str

class GroupCreatePayload(BaseModel):
    origin_id: str
    destination_id: str
    target_date: str
    window_start: str
    window_end: str
    max_seats: int = Field(default=30, ge=10, le=100)
    min_seats_for_quote: int = Field(default=10, ge=5, le=50)

class QuoteResponse(BaseModel):
    id: str
    group_id: str
    airline_name: str
    price_per_passenger: float
    available_seats: int
    source_type: str
    baggage_details: str
    terms: str
    valid_until: str
    status: str

    model_config = ConfigDict(from_attributes=True)

class QuoteCreatePayload(BaseModel):
    group_id: str
    airline_name: str
    price_per_passenger: float = Field(gt=0)
    available_seats: int = Field(ge=1)
    source_type: str = "manual"
    baggage_details: str
    terms: str
    valid_until: str

class QuoteRequestPayload(BaseModel):
    group_id: str
    deadline: str

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    read: bool
    created_at: str
    link: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PopularRoute(BaseModel):
    route: str
    count: int

class RequestOverTime(BaseModel):
    date: str
    count: int

class AnalyticsResponse(BaseModel):
    total_users: int
    total_requests: int
    active_groups: int
    groups_awaiting_quotes: int
    popular_routes: List[PopularRoute]
    requests_over_time: List[RequestOverTime]

class FestivalDemandRow(BaseModel):
    route: str
    counts: List[int]

class FestivalDemandResponse(BaseModel):
    festivals: List[str]
    rows: List[FestivalDemandRow]

class FlightSearchPayload(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    passengers: int = Field(ge=1, le=9)
    cabin: str = "economy"

class FlightOffer(BaseModel):
    id: str
    supplier: str
    supplier_reference: str
    live_mode: bool
    provenance: str
    airline_name: str
    airline_code: str
    flight_number: str
    price_per_passenger: float
    total_amount: float
    currency: str = "INR"
    available_seats: Optional[int] = None
    baggage_details: str
    conditions: str
    retrieved_at: str
    expires_at: str
    is_stale: bool

class FlightSearchResponse(BaseModel):
    search_id: str
    origin: str
    destination: str
    departure_date: str
    passengers: int
    offers: List[FlightOffer]
    live_provider_active: bool
    retrieved_at: str
    notice: Optional[str] = None

class ProviderHealthResponse(BaseModel):
    provider_name: str
    enabled: bool
    status: str
    last_checked_at: str
    error_message: Optional[str] = None
    rate_limit_remaining: Optional[int] = None
    rate_limit_reset_seconds: Optional[int] = None
