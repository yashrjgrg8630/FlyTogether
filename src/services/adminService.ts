import type { Analytics, FestivalDemand } from "@/types";
import { api, call } from "./api";
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
};
