import type { Group, GroupFilters, GroupMember, Quote } from "@/types";
import { api, ApiError, call } from "./api";
import { currentUser, groups, members, quotes, requests, today } from "./mockDb";
import { joinProblem } from "@/utils/groupRules";
import { formatSafeAlias } from "@/utils/format";

const find = (id: string) => {
  const g = groups.find((x) => x.id === id);
  if (!g) throw new ApiError(404, "Group not found");
  return g;
};

export const groupService = {
  list: (f: GroupFilters = {}) =>
    call<Group[]>(
      () =>
        groups.filter(
          (g) =>
            (!f.origin || g.origin.iata_code === f.origin.toUpperCase()) &&
            (!f.destination || g.destination.iata_code === f.destination.toUpperCase()) &&
            (!f.status || g.status === f.status) &&
            (!f.date || (g.window_start <= f.date && g.window_end >= f.date)),
        ),
      async () => (await api.get("/groups", { params: f })).data,
    ),
  get: (id: string) =>
    call<Group>(
      () => find(id),
      async () => (await api.get(`/groups/${id}`)).data,
    ),
  members: (id: string) =>
    call<GroupMember[]>(
      () => members.filter((m) => m.group_id === id),
      async () => (await api.get(`/groups/${id}/members`)).data,
    ),
  join: (id: string, travel_request_id: string) =>
    call<Group>(
      () => {
        const u = currentUser();
        const g = find(id);
        const r = requests.find((x) => x.id === travel_request_id && x.user_id === u.id);
        if (!r) throw new ApiError(404, "Travel request not found");
        if (members.some((m) => m.group_id === id && m.user_id === u.id))
          throw new ApiError(409, "You have already joined this group");
        const problem = joinProblem(g, r);
        if (problem) throw new ApiError(409, problem);
        g.seats_filled += r.passenger_count;
        if (g.status === "forming" && g.seats_filled >= g.min_seats_for_quote)
          g.status = "quotation_eligible";
        r.status = "grouped";
        r.group_id = g.id;
        members.push({
          group_id: g.id,
          travel_request_id: r.id,
          user_id: u.id,
          display_name: formatSafeAlias(u.full_name),
          passenger_count: r.passenger_count,
          joined_at: today(),
        });
        return g;
      },
      async () => (await api.post(`/groups/${id}/join`, { travel_request_id })).data,
    ),
  leave: (id: string) =>
    call<void>(
      () => {
        const u = currentUser();
        const g = find(id);
        const idx = members.findIndex((m) => m.group_id === id && m.user_id === u.id);
        if (idx < 0) throw new ApiError(409, "You are not in this group");
        const m = members[idx];
        if (!m) throw new ApiError(409, "Membership changed. Please refresh.");
        members.splice(idx, 1);
        g.seats_filled -= m.passenger_count;
        if (g.status === "quotation_eligible" && g.seats_filled < g.min_seats_for_quote)
          g.status = "forming";
        const r = requests.find((x) => x.id === m.travel_request_id);
        if (r) {
          r.status = "open";
          r.group_id = null;
        }
      },
      async () => {
        await api.post(`/groups/${id}/leave`);
      },
    ),
  quotes: (id: string) =>
    call<Quote[]>(
      () => quotes.filter((q) => q.group_id === id && q.status !== "draft"),
      async () => (await api.get(`/groups/${id}/quotes`)).data,
    ),
};
