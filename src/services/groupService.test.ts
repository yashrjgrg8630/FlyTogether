import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { groupService } from "./groupService";
import { matchingService } from "./matchingService";
import { groups, members, requests } from "./mockDb";
import { tokenStore } from "./api";

const savedGroups = structuredClone(groups);
const savedRequests = structuredClone(requests);
const savedMembers = structuredClone(members);
beforeEach(() => {
  tokenStore.set("mock.u_trav");
  vi.useFakeTimers();
});
afterEach(() => {
  groups.splice(0, groups.length, ...structuredClone(savedGroups));
  requests.splice(0, requests.length, ...structuredClone(savedRequests));
  members.splice(0, members.length, ...structuredClone(savedMembers));
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
describe("group service", () => {
  it("adds passenger seats only after a join and restores them on leave", async () => {
    const joined = await settle(groupService.join("g_2", "r_2"));
    expect(joined.value?.seats_filled).toBe(8);
    const m = members.find((x) => x.group_id === "g_2");
    expect(m?.passenger_count).toBe(2);
    expect(m?.display_name).toBe("Aarav S.");
    await settle(groupService.leave("g_2"));
    expect(groups.find((g) => g.id === "g_2")?.seats_filled).toBe(6);
    expect(requests.find((r) => r.id === "r_2")?.status).toBe("open");
  });
  it("rejects duplicate membership without adding seats twice", async () => {
    await settle(groupService.join("g_2", "r_2"));
    const result = await settle(groupService.join("g_2", "r_2"));
    expect(result.error).toMatchObject({ status: 409 });
    expect(groups.find((g) => g.id === "g_2")?.seats_filled).toBe(8);
  });
  it("returns 409 if capacity changed before a join finishes", async () => {
    const pending = groupService.join("g_2", "r_2");
    const g = groups.find((x) => x.id === "g_2");
    if (!g) throw new Error("Missing fixture");
    g.seats_filled = g.max_seats;
    const result = await settle(pending);
    expect(result.error).toMatchObject({ status: 409 });
    expect(requests.find((r) => r.id === "r_2")?.status).toBe("open");
  });
  it("filters groups by route, date window and status", async () => {
    const g = groups.find((x) => x.id === "g_2");
    if (!g) throw new Error("Missing fixture");
    const result = await settle(
      groupService.list({
        origin: "BOM",
        destination: "GOI",
        date: g.target_date,
        status: "forming",
      }),
    );
    expect(result.value?.map((x) => x.id)).toEqual(["g_2"]);
  });
  it("matching ranks by score without joining and exposes budget as unscored", async () => {
    const result = await settle(matchingService.forRequest("r_2"));
    expect(result.value?.matches[0]?.match_score).toBe(88);
    expect(result.value?.matches[0]?.score_breakdown?.budget).toBe(
      "No budget set; no budget deduction.",
    );
    expect(requests.find((r) => r.id === "r_2")?.status).toBe("open");
    expect(groups.find((g) => g.id === "g_2")?.seats_filled).toBe(6);
  });
});
