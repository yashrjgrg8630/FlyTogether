import type { TravelRequest, TravelRequestPayload } from "@/types";
import { api, ApiError, call } from "./api";
import { currentUser, hydrateRequest, requests, today, uid } from "./mockDb";

function validate(p: Partial<TravelRequestPayload>) {
  if (p.origin_id && p.origin_id === p.destination_id)
    throw new ApiError(422, "Origin and destination must differ");
  if (p.passenger_count !== undefined && p.passenger_count < 1)
    throw new ApiError(422, "At least 1 passenger");
  if (p.flexibility_days !== undefined && (p.flexibility_days < 0 || p.flexibility_days > 7))
    throw new ApiError(422, "Flexibility must be 0–7 days");
}
const own = (id: string) => {
  const u = currentUser();
  const r = requests.find((x) => x.id === id && x.user_id === u.id);
  if (!r) throw new ApiError(404, "Request not found");
  return r;
};

export const travelService = {
  create: (p: TravelRequestPayload) =>
    call<TravelRequest>(
      () => {
        validate(p);
        const r: TravelRequest = {
          ...p,
          id: uid("r"),
          user_id: currentUser().id,
          status: "open",
          group_id: null,
          created_at: today(),
        };
        requests.unshift(r);
        return hydrateRequest(r);
      },
      async () => (await api.post("/travel-requests", p)).data,
    ),
  listMine: () =>
    call<TravelRequest[]>(
      () => {
        const u = currentUser();
        return requests.filter((r) => r.user_id === u.id).map(hydrateRequest);
      },
      async () => (await api.get("/travel-requests/my")).data,
    ),
  update: (id: string, p: Partial<TravelRequestPayload>) =>
    call<TravelRequest>(
      () => {
        const r = own(id);
        if (r.status === "grouped")
          throw new ApiError(409, "Leave the group before editing this request");
        validate({ ...r, ...p });
        Object.assign(r, p);
        return hydrateRequest(r);
      },
      async () => (await api.patch(`/travel-requests/${id}`, p)).data,
    ),
  remove: (id: string) =>
    call<void>(
      () => {
        const r = own(id);
        if (r.status === "grouped")
          throw new ApiError(409, "Leave the group before cancelling this request");
        r.status = "cancelled";
      },
      async () => {
        await api.delete(`/travel-requests/${id}`);
      },
    ),
};
