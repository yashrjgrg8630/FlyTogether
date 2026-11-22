import { describe, expect, it } from "vitest";
import { travelRequestSchema } from "./validation";

const future = new Date(Date.now() + 10 * 864e5).toLocaleDateString("en-CA");
const base = {
  origin_id: "ap_BLR",
  destination_id: "ap_DEL",
  departure_date: future,
  flexibility_days: 2,
  passenger_count: 1,
};

describe("travel request rules", () => {
  it("accepts a valid request", () =>
    expect(travelRequestSchema.safeParse(base).success).toBe(true));
  it("rejects origin equal to destination", () =>
    expect(travelRequestSchema.safeParse({ ...base, destination_id: "ap_BLR" }).success).toBe(
      false,
    ));
  it("rejects 0 passengers", () =>
    expect(travelRequestSchema.safeParse({ ...base, passenger_count: 0 }).success).toBe(false));
  it("rejects flexibility above 7 days", () =>
    expect(travelRequestSchema.safeParse({ ...base, flexibility_days: 8 }).success).toBe(false));
  it("allows flexibility of 7 days", () =>
    expect(travelRequestSchema.safeParse({ ...base, flexibility_days: 7 }).success).toBe(true));
  it("rejects negative flexibility", () =>
    expect(travelRequestSchema.safeParse({ ...base, flexibility_days: -1 }).success).toBe(false));
});
