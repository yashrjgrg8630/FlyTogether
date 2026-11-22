import type { Quote, QuoteCreatePayload, QuoteRequestPayload } from "@/types";
import { api, ApiError, call } from "./api";
import { groups, quotes, requireAdmin, uid } from "./mockDb";
import { adminQuoteSchema, quoteRequestSchema } from "@/utils/adminValidation";
import { quoteValidity } from "@/utils/quoteRules";

export const quoteService = {
  listAdmin: () =>
    call<Quote[]>(
      () => {
        requireAdmin();
        return quotes;
      },
      async () => (await api.get("/admin/quotes")).data,
    ),
  forGroup: (groupId: string) =>
    call<Quote[]>(
      () => quotes.filter((q) => q.group_id === groupId && q.status !== "draft"),
      async () => (await api.get(`/groups/${groupId}/quotes`)).data,
    ),
  requestQuotes: (p: QuoteRequestPayload) =>
    call<{ ok: true }>(
      () => {
        requireAdmin();
        if (!quoteRequestSchema.safeParse(p).success)
          throw new ApiError(422, "Choose a valid quote deadline");
        const g = groups.find((x) => x.id === p.group_id);
        if (!g) throw new ApiError(404, "Group not found");
        if (g.status !== "quotation_eligible")
          throw new ApiError(409, "Group has not reached the quote threshold");
        g.status = "quote_requested";
        g.quote_deadline = p.deadline;
        return { ok: true as const };
      },
      async () => (await api.post("/admin/quotes/request", p)).data,
    ),
  create: (p: QuoteCreatePayload) =>
    call<Quote>(
      () => {
        requireAdmin();
        const parsed = adminQuoteSchema.safeParse(p);
        if (!parsed.success)
          throw new ApiError(422, parsed.error.issues[0]?.message ?? "Check quote details");
        const group = groups.find((g) => g.id === p.group_id);
        if (!group) throw new ApiError(404, "Group not found");
        if (group.status === "closed") throw new ApiError(409, "This group is closed");
        const q: Quote = { ...parsed.data, id: uid("q"), status: "draft" };
        quotes.push(q);
        return q;
      },
      async () => (await api.post("/admin/quotes", p)).data,
    ),
  publish: (id: string) =>
    call<Quote>(
      () => {
        requireAdmin();
        const q = quotes.find((x) => x.id === id);
        if (!q) throw new ApiError(404, "Quote not found");
        if (q.status !== "draft") throw new ApiError(409, "Only draft quotations can be published");
        if (quoteValidity(q, Date.now()).expired)
          throw new ApiError(409, "This draft has expired; create a new quotation");
        const group = groups.find((g) => g.id === q.group_id);
        if (!group || group.status === "closed")
          throw new ApiError(409, "This group is unavailable or closed");
        q.status = "published";
        const g = groups.find((x) => x.id === q.group_id);
        if (g) g.status = "quoted";
        return q;
      },
      async () => (await api.patch(`/admin/quotes/${id}/publish`)).data,
    ),
};
