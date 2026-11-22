import { describe, expect, it } from "vitest";
import { formatSafeAlias, formatINR, formatDate, formatShortDate, seatPct } from "./format";

describe("formatSafeAlias", () => {
  it("formats full names into safe public aliases", () => {
    expect(formatSafeAlias("Aarav Sharma")).toBe("Aarav S.");
    expect(formatSafeAlias("Priya Nair")).toBe("Priya N.");
    expect(formatSafeAlias("John Michael Doe")).toBe("John D.");
  });

  it("handles single-word names and edge cases safely", () => {
    expect(formatSafeAlias("Aarav")).toBe("Aarav");
    expect(formatSafeAlias("  ")).toBe("Traveller");
  });
});

describe("currency and date formatting", () => {
  it("formats Indian Rupees correctly without decimal noise", () => {
    expect(formatINR(5180)).toMatch(/₹\s*5,180/);
  });

  it("calculates seat percentage capped at 100", () => {
    expect(seatPct(14, 30)).toBe(47);
    expect(seatPct(35, 30)).toBe(100);
    expect(seatPct(0, 0)).toBe(0);
  });
});
