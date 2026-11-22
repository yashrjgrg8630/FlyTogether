export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export type FlightProvenance =
  | "LIVE_SUPPLIER_DATA"
  | "MANUAL_AIRLINE_QUOTATION"
  | "STATIC_REFERENCE_DATA"
  | "SIMULATED_DEMO_DATA";

export interface FlightSearchPayload {
  origin: string; // 3-letter IATA code
  destination: string; // 3-letter IATA code
  departure_date: string; // YYYY-MM-DD
  return_date?: string | null; // Optional return date
  passengers: number; // 1-9 individual passenger search cap
  cabin: CabinClass;
}

export interface FlightSliceSegment {
  marketing_carrier: string;
  marketing_carrier_code: string;
  operating_carrier?: string | null;
  operating_carrier_code?: string | null;
  flight_number: string;
  origin_iata: string;
  destination_iata: string;
  departing_at: string;
  arriving_at: string;
  duration_minutes: number;
  stops: number;
}

export interface FlightOffer {
  id: string;
  supplier: "duffel" | "manual" | "reference" | "demo";
  supplier_reference: string;
  live_mode: boolean;
  provenance: FlightProvenance;
  airline_name: string;
  airline_code: string;
  flight_number: string;
  price_per_passenger: number;
  total_amount: number;
  currency: string;
  /** Nullable; never fabricated as remaining inventory unless supplier explicitly returns it. */
  available_seats: number | null;
  baggage_details: string;
  conditions: string;
  retrieved_at: string;
  expires_at: string;
  is_stale: boolean;
  segments: FlightSliceSegment[];
}

export interface FlightSearchResponse {
  search_id: string;
  origin: string;
  destination: string;
  departure_date: string;
  passengers: number;
  offers: FlightOffer[];
  live_provider_active: boolean;
  retrieved_at: string;
  notice?: string;
}

export interface ProviderHealth {
  provider_name: string;
  enabled: boolean;
  status: "operational" | "degraded" | "blocked" | "disabled";
  last_checked_at: string;
  error_message?: string | null;
  rate_limit_remaining?: number | null;
  rate_limit_reset_seconds?: number | null;
}
