import { describe, expect, it } from "vitest";
import { joinProblem, membershipError } from "./groupRules";
import type { Group, TravelRequest } from "@/types";
const airport = (code: string) => ({
  id: code,
  iata_code: code,
  airport_name: code,
  city: code,
  country: "India",
});
const group: Group = {
  id: "g",
  route: "BOM-GOI",
  origin: airport("BOM"),
  destination: airport("GOI"),
  target_date: "2026-12-03",
  window_start: "2026-12-01",
  window_end: "2026-12-05",
  seats_filled: 18,
  max_seats: 20,
  min_seats_for_quote: 10,
  status: "forming",
  created_at: "2026-11-14",
};
const request: TravelRequest = {
  id: "r",
  user_id: "u",
  origin_id: "BOM",
  destination_id: "GOI",
  departure_date: "2026-12-03",
  flexibility_days: 0,
  passenger_count: 2,
  status: "open",
  created_at: "2026-11-14",
};
describe("group membership", () => {
  it("blocks full groups", () =>
    expect(joinProblem({ ...group, seats_filled: 20 }, request)).not.toBeNull());
  it("allows exactly the remaining passenger seats", () =>
    expect(joinProblem(group, request)).toBeNull());
  it("blocks requests larger than remaining passenger capacity", () =>
    expect(joinProblem(group, { ...request, passenger_count: 3 })).not.toBeNull());
  it("blocks duplicate joins with an already grouped request", () =>
    expect(joinProblem(group, { ...request, status: "grouped" })).not.toBeNull());
  it("blocks cancelled requirements", () =>
    expect(joinProblem(group, { ...request, status: "cancelled" })).not.toBeNull());
  it("preserves 409 conflict details and asks for review", () =>
    expect(membershipError({ status: 409, message: "Group just filled up" })).toContain(
      "Group just filled up",
    ));
});
