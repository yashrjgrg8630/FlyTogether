import type { MatchingResponse } from "@/types";
import { api, ApiError, call } from "./api";
import { currentUser, groups, requests } from "./mockDb";

const dayDiff = (a: string, b: string) =>
  Math.abs((new Date(a).getTime() - new Date(b).getTime()) / 864e5);

export const matchingService = {
  /** Suggests groups only — never joins. */
  forRequest: (requestId: string) =>
    call<MatchingResponse>(
      () => {
        const u = currentUser();
        const r = requests.find((x) => x.id === requestId && x.user_id === u.id);
        if (!r) throw new ApiError(404, "Request not found");
        const matches = groups
          .filter(
            (g) =>
              g.origin.id === r.origin_id &&
              g.destination.id === r.destination_id &&
              g.status !== "closed",
          )
          .map((g) => {
            const diff = dayDiff(g.target_date, r.departure_date);
            const date_compatible = diff <= r.flexibility_days + 2;
            const available_capacity = g.max_seats - g.seats_filled;
            const score = Math.max(
              0,
              Math.round(100 - diff * 12 - (available_capacity < r.passenger_count ? 30 : 0)),
            );
            return {
              group_id: g.id,
              route: g.route,
              target_date: g.target_date,
              window_start: g.window_start,
              window_end: g.window_end,
              passengers: g.seats_filled,
              available_capacity,
              match_score: score,
              date_compatible,
              status: g.status,
              score_breakdown: {
                date: `${diff} day difference: ${diff * 12} points deducted from 100`,
                budget: r.max_budget
                  ? "Budget not scored: an available fare is not guaranteed."
                  : "No budget set; no budget deduction.",
                capacity:
                  available_capacity < r.passenger_count
                    ? "Not enough passenger seats: 30 points deducted"
                    : `${available_capacity} passenger seats available: no deduction`,
              },
            };
          })
          .sort((a, b) => b.match_score - a.match_score);
        return { request_id: requestId, matches };
      },
      async () => (await api.get(`/matching/${requestId}`)).data,
    ),
};
