import type { Analytics, FestivalDemand, GroupRFQ } from "@/types";
import { api, call, ApiError } from "./api";
import { groups, requests, requireAdmin, users } from "./mockDb";

export const adminService = {
  festivalDemand: () =>
    call<FestivalDemand>(
      () => {
        requireAdmin();
        return {
          festivals: ["Holi", "Eid", "Onam", "Durga Puja", "Diwali", "Christmas"],
          rows: [
            { route: "BLR-DEL", counts: [94, 46, 28, 61, 142, 77] },
            { route: "BOM-GOI", counts: [51, 38, 22, 36, 86, 156] },
            { route: "DEL-BOM", counts: [88, 67, 19, 53, 128, 92] },
            { route: "COK-DEL", counts: [32, 49, 151, 24, 63, 104] },
            { route: "MAA-CCU", counts: [46, 56, 29, 164, 79, 58] },
            { route: "HYD-BLR", counts: [62, 89, 42, 33, 108, 71] },
          ],
        };
      },
      async () => (await api.get("/admin/analytics/festival-demand")).data,
    ),
  analytics: () =>
    call<Analytics>(
      () => {
        requireAdmin();
        const routes = new Map<string, number>();
        groups.forEach((g) => routes.set(g.route, (routes.get(g.route) ?? 0) + g.seats_filled));
        const days = Array.from({ length: 14 }, (_, i) => {
          const x = new Date();
          x.setDate(x.getDate() - (13 - i));
          return {
            date: x.toISOString().slice(0, 10),
            count: 8 + ((i * 7) % 11) + Math.round(i * 1.4),
          };
        });
        return {
          total_users: users.length + 1240,
          total_requests: requests.length + 3180,
          active_groups: groups.filter((g) => g.status !== "closed").length,
          groups_awaiting_quotes: groups.filter((g) => g.status === "quotation_eligible").length,
          popular_routes: [...routes]
            .map(([route, count]) => ({ route, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6),
          requests_over_time: days,
        };
      },
      async () => (await api.get("/admin/analytics")).data,
    ),
  getGroupRFQ: (groupId: string) =>
    call<GroupRFQ>(
      () => {
        requireAdmin();
        const g = groups.find((x) => x.id === groupId);
        if (!g) throw new ApiError(404, "Group not found");
        return {
          reference_code: `FT-RFQ-${g.id.toUpperCase()}`,
          group_id: g.id,
          route: g.route,
          seats: g.seats_filled,
          target_date: g.target_date,
          subject: `[FT-RFQ-${g.id.toUpperCase()}] Group Quotation Request: ${g.origin.iata_code} → ${g.destination.iata_code} (${g.seats_filled} Passenger Seats)`,
          email_body: `To: Airline Group Travel Desk\n\nRequest for group quote on route ${g.route} for ${g.seats_filled} passenger seats on ${g.target_date}.\nAcceptable window: ${g.window_start} to ${g.window_end}.\n\nFlyTogether aggregates demand. It does not sell tickets or reserve seats.`,
          airline_desks: [
            { airline: "IndiGo", desk: "Group Desk", email: "groups@goindigo.in" },
            { airline: "Air India", desk: "Group Booking Services", email: "groupdesk@airindia.com" },
            { airline: "SpiceJet", desk: "Special Group Travel", email: "groups@spicejet.com" },
            { airline: "Akasa Air", desk: "Group Sales", email: "groupsales@akasaair.com" },
          ],
        };
      },
      async () => (await api.get(`/admin/groups/${groupId}/rfq`)).data,
    ),
  triggerClustering: (minSeats = 10) =>
    call<{ status: string; message: string; data: unknown }>(
      () => {
        requireAdmin();
        return {
          status: "success",
          message: "Clustering run complete in demo mode.",
          data: { groups_created: 0, requests_grouped: 0, group_ids: [] },
        };
      },
      async () => (await api.post(`/admin/clustering/run?min_seats=${minSeats}`)).data,
    ),
};
