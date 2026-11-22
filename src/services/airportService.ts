import type { Airport } from "@/types";
import { api, call } from "./api";
import { airports } from "./mockDb";

export const airportService = {
  search: (q = "") =>
    call<Airport[]>(
      () => {
        const s = q.trim().toLowerCase();
        return (
          s
            ? airports.filter((a) =>
                [a.iata_code, a.city, a.airport_name].some((v) => v.toLowerCase().includes(s)),
              )
            : airports
        ).slice(0, 25);
      },
      async () => (await api.get("/airports", { params: { q } })).data,
    ),
};
