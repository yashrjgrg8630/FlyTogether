import { describe, expect, it } from "vitest";
import { potentialSavings, quoteValidity } from "./quoteRules";

describe("potential savings", () => {
  it("compares the per-passenger quote against an indicative fare", () => {
    expect(potentialSavings(5180, 7000, false)).toEqual({ amount: 1820, percent: 26 });
  });
  it("does not calculate savings without a positive reference fare", () => {
    expect(potentialSavings(5180, undefined, false)).toBeNull();
    expect(potentialSavings(5180, 0, false)).toBeNull();
  });
  it("does not advertise savings for an expired quote", () => {
    expect(potentialSavings(4590, 7000, true)).toBeNull();
  });
  it("does not turn a more expensive quote into positive savings", () => {
    expect(potentialSavings(8000, 7000, false)).toEqual({ amount: 0, percent: 0 });
  });
});
describe("quote validity", () => {
  it("keeps a date-only quote valid until the end of its local date", () => {
    expect(
      quoteValidity(
        { valid_until: "2026-11-15", status: "published" },
        new Date("2026-11-15T12:00:00").getTime(),
      ).expired,
    ).toBe(false);
    expect(
      quoteValidity(
        { valid_until: "2026-11-15", status: "published" },
        new Date("2026-11-16T00:00:00").getTime(),
      ).expired,
    ).toBe(true);
  });
  it("expires at a timestamp's exact deadline", () => {
    const quote = { valid_until: "2026-11-15T10:00:00Z", status: "published" as const };
    expect(quoteValidity(quote, Date.parse("2026-11-15T09:59:59Z"))).toEqual({
      expired: false,
      countdown: "0d 0h 0m 1s remaining",
    });
    expect(quoteValidity(quote, Date.parse(quote.valid_until)).expired).toBe(true);
  });
  it("respects an explicitly expired status even before its deadline", () => {
    expect(
      quoteValidity({ valid_until: "2026-12-01", status: "expired" }, Date.parse("2026-11-15"))
        .expired,
    ).toBe(true);
  });
});
