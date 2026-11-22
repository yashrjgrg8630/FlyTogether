import type { Quote } from "@/types";

export function quoteValidity(quote: Pick<Quote, "valid_until" | "status">, now: number) {
  const end = new Date(
    quote.valid_until.length === 10 ? `${quote.valid_until}T23:59:59.999` : quote.valid_until,
  ).getTime();
  if (!Number.isFinite(end)) return { expired: true, countdown: "Validity unavailable" };
  const remaining = end - now;
  if (quote.status === "expired" || remaining <= 0) return { expired: true, countdown: "Expired" };
  const seconds = Math.floor(remaining / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return { expired: false, countdown: `${days}d ${hours}h ${minutes}m ${seconds % 60}s remaining` };
}

export function potentialSavings(
  price: number,
  indicativeFare: number | undefined,
  expired: boolean,
) {
  if (
    expired ||
    indicativeFare === undefined ||
    !Number.isFinite(indicativeFare) ||
    indicativeFare <= 0 ||
    !Number.isFinite(price) ||
    price < 0
  )
    return null;
  const amount = Math.max(0, indicativeFare - price);
  return { amount, percent: Math.round((amount / indicativeFare) * 100) };
}
