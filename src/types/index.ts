export type Role = "traveller" | "admin";
export interface User {
  id: string;
  full_name: string;
  email: string;
  role: Role;
}
export interface AuthResponse {
  access_token: string;
  user: User;
}
export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}
export interface LoginPayload {
  email: string;
  password: string;
}

export interface Airport {
  id: string;
  iata_code: string;
  airport_name: string;
  city: string;
  country: string;
}

export type RequestStatus = "open" | "grouped" | "cancelled";
export interface TravelRequestPayload {
  origin_id: string;
  destination_id: string;
  departure_date: string;
  flexibility_days: number;
  passenger_count: number;
  max_budget?: number | null;
}
export interface TravelRequest extends TravelRequestPayload {
  id: string;
  user_id: string;
  status: RequestStatus;
  group_id?: string | null;
  origin?: Airport | undefined;
  destination?: Airport | undefined;
  created_at: string;
}

export type GroupStatus =
  "forming" | "quotation_eligible" | "quote_requested" | "quoted" | "closed";
export interface Match {
  group_id: string;
  route: string;
  target_date: string;
  window_start: string;
  window_end: string;
  passengers: number;
  available_capacity: number;
  match_score: number;
  date_compatible: boolean;
  status: GroupStatus;
  score_breakdown?: { date: string; budget: string; capacity: string };
}
export interface MatchingResponse {
  request_id: string;
  matches: Match[];
}

export interface Group {
  id: string;
  route: string;
  origin: Airport;
  destination: Airport;
  target_date: string;
  window_start: string;
  window_end: string;
  seats_filled: number;
  max_seats: number;
  min_seats_for_quote: number;
  status: GroupStatus;
  quote_deadline?: string | null;
  created_at: string;
}
export interface GroupMember {
  group_id: string;
  travel_request_id: string;
  user_id: string;
  display_name: string;
  passenger_count: number;
  joined_at: string;
}
export interface GroupFilters {
  origin?: string | undefined;
  destination?: string | undefined;
  status?: GroupStatus | undefined;
  date?: string | undefined;
}

export type QuoteSource = "simulated" | "manual";
export type QuoteStatus = "draft" | "published" | "expired";
export interface Quote {
  id: string;
  group_id: string;
  airline_name: string;
  price_per_passenger: number;
  available_seats: number;
  source_type: QuoteSource;
  baggage_details: string;
  terms: string;
  valid_until: string;
  status: QuoteStatus;
}
export interface QuoteRequestPayload {
  group_id: string;
  deadline: string;
}
export type QuoteCreatePayload = Omit<Quote, "id" | "status">;

export interface Analytics {
  total_users: number;
  total_requests: number;
  active_groups: number;
  groups_awaiting_quotes: number;
  popular_routes: { route: string; count: number }[];
  requests_over_time: { date: string; count: number }[];
}

export interface FestivalDemand {
  festivals: string[];
  rows: { route: string; counts: number[] }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

export interface AirlineDesk {
  airline: string;
  desk: string;
  email: string;
}

export interface GroupRFQ {
  reference_code: string;
  group_id: string;
  route: string;
  seats: number;
  target_date: string;
  subject: string;
  email_body: string;
  airline_desks: AirlineDesk[];
}
