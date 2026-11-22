import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { quoteService } from "./quoteService";
import { adminService } from "./adminService";
import { groups, quotes } from "./mockDb";
import { tokenStore } from "./api";
import { adminQuoteSchema } from "@/utils/adminValidation";
const savedGroups = structuredClone(groups),
  savedQuotes = structuredClone(quotes);
const payload = {
  group_id: "g_10",
  airline_name: "Test Airline",
  price_per_passenger: 5200,
  available_seats: 20,
  valid_until: "2099-12-01",
  baggage_details: "15 kg",
  terms: "Indicative",
  source_type: "manual" as const,
};
beforeEach(() => {
  tokenStore.set("mock.u_admin");
  vi.useFakeTimers();
});
afterEach(() => {
  groups.splice(0, groups.length, ...structuredClone(savedGroups));
  quotes.splice(0, quotes.length, ...structuredClone(savedQuotes));
  tokenStore.clear();
  vi.useRealTimers();
});
async function settle<T>(promise: Promise<T>) {
  const result = promise.then(
    (value) => ({ value, error: null }),
    (error: unknown) => ({ value: null, error }),
  );
  await vi.runAllTimersAsync();
  return result;
}
describe("admin workflow", () => {
  it("creates a request only for quotation_eligible groups", async () => {
    expect(
      (await settle(quoteService.requestQuotes({ group_id: "g_10", deadline: "2099-12-01" })))
        .value,
    ).toEqual({ ok: true });
    expect(groups.find((g) => g.id === "g_10")?.status).toBe("quote_requested");
    expect(
      (await settle(quoteService.requestQuotes({ group_id: "g_2", deadline: "2099-12-01" }))).error,
    ).toMatchObject({ status: 409 });
  });
  it("hides drafts from travellers until publication", async () => {
    const created = (await settle(quoteService.create(payload))).value;
    if (!created) throw new Error("Draft not created");
    expect(created.status).toBe("draft");
    expect((await settle(quoteService.forGroup("g_10"))).value?.map((q) => q.id)).not.toContain(
      created.id,
    );
    expect((await settle(quoteService.publish(created.id))).value?.status).toBe("published");
    expect((await settle(quoteService.forGroup("g_10"))).value?.map((q) => q.id)).toContain(
      created.id,
    );
    expect(groups.find((g) => g.id === "g_10")?.status).toBe("quoted");
  });
  it("accepts simulated and manual quote sources", () => {
    expect(adminQuoteSchema.safeParse(payload).success).toBe(true);
    expect(adminQuoteSchema.safeParse({ ...payload, source_type: "simulated" }).success).toBe(true);
    expect(adminQuoteSchema.safeParse({ ...payload, source_type: "verified" }).success).toBe(false);
  });
  it("requires positive prices and whole passenger seats", () => {
    expect(adminQuoteSchema.safeParse({ ...payload, price_per_passenger: 0 }).success).toBe(false);
    expect(adminQuoteSchema.safeParse({ ...payload, available_seats: 1.5 }).success).toBe(false);
    expect(adminQuoteSchema.safeParse({ ...payload, available_seats: 0 }).success).toBe(false);
  });
  it("rejects publishing expired drafts", async () => {
    quotes.push({ ...payload, id: "expired-draft", valid_until: "2000-01-01", status: "draft" });
    expect((await settle(quoteService.publish("expired-draft"))).error).toMatchObject({
      status: 409,
    });
  });
  it("rejects past validity dates and quote deadlines", async () => {
    expect(adminQuoteSchema.safeParse({ ...payload, valid_until: "2000-01-01" }).success).toBe(
      false,
    );
    expect(
      (await settle(quoteService.requestQuotes({ group_id: "g_10", deadline: "2000-01-01" })))
        .error,
    ).toMatchObject({ status: 422 });
  });
  it("denies all admin services and writes to travellers", async () => {
    tokenStore.set("mock.u_trav");
    for (const call of [
      () => adminService.analytics(),
      () => adminService.festivalDemand(),
      () => quoteService.listAdmin(),
      () => quoteService.create(payload),
      () => quoteService.publish("q_5"),
      () => quoteService.requestQuotes({ group_id: "g_10", deadline: "2099-12-01" }),
    ]) {
      expect((await settle<unknown>(call())).error).toMatchObject({ status: 403 });
    }
  });
});
