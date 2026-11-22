import { describe, expect, it } from "vitest";
import { flightService } from "./flightService";

describe("flight service", () => {
  it("honestly indicates live flight data unavailable when provider is unconfigured", async () => {
    const result = await flightService.search({
      origin: "BLR",
      destination: "DEL",
      departure_date: "2026-12-21",
      passengers: 2,
      cabin: "economy",
    });

    expect(result.live_provider_active).toBe(false);
    expect(result.offers).toHaveLength(0);
    expect(result.notice).toBe("Live flight data is currently unavailable.");
  });

  it("reports provider health diagnostics as blocked while commercial terms are pending", async () => {
    const health = await flightService.providerHealth();
    expect(health).toHaveLength(1);
    expect(health[0]?.provider_name).toBe("Duffel Flights");
    expect(health[0]?.status).toBe("blocked");
    expect(health[0]?.enabled).toBe(false);
  });
});
