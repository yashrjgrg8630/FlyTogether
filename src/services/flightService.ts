import type {
  FlightSearchPayload,
  FlightSearchResponse,
  FlightOffer,
  ProviderHealth,
} from "@/types/flights";
import { api, ApiError, call } from "./api";

/**
 * Provider-independent flight service interface.
 * When live supplier integration is gated or unconfigured, it fails transparently
 * with "Live flight data is currently unavailable." rather than inventing fake airline prices.
 */
export const flightService = {
  /**
   * Search flights across authorized provider adapters.
   * Real endpoint: POST /flights/search
   */
  search: (payload: FlightSearchPayload) =>
    call<FlightSearchResponse>(
      () => {
        // Mock / Offline response: Live searches are disabled until commercial confirmation
        // Honest unavailable state per business and safety rules.
        return {
          search_id: `srch_mock_${Date.now().toString(36)}`,
          origin: payload.origin,
          destination: payload.destination,
          departure_date: payload.departure_date,
          passengers: payload.passengers,
          offers: [],
          live_provider_active: false,
          retrieved_at: new Date().toISOString(),
          notice: "Live flight data is currently unavailable.",
        };
      },
      async () => (await api.post("/flights/search", payload)).data,
    ),

  /**
   * Revalidate an existing offer by ID.
   * Real endpoint: GET /flights/offers/{id}
   */
  getOffer: (offerId: string) =>
    call<FlightOffer>(
      () => {
        throw new ApiError(404, "Flight offer not found or supplier expired.");
      },
      async () => (await api.get(`/flights/offers/${offerId}`)).data,
    ),

  /**
   * Admin-only provider status and rate-limit diagnostics.
   * Real endpoint: GET /admin/providers/health
   */
  providerHealth: () =>
    call<ProviderHealth[]>(
      () => [
        {
          provider_name: "Duffel Flights",
          enabled: false,
          status: "blocked",
          last_checked_at: new Date().toISOString(),
          error_message:
            "Production searches disabled pending written search-only commercial confirmation.",
          rate_limit_remaining: null,
          rate_limit_reset_seconds: null,
        },
      ],
      async () => (await api.get("/admin/providers/health")).data,
    ),
};
