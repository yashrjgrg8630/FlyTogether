export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export const formatDate = (iso: string) =>
  new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export const formatShortDate = (iso: string) =>
  new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
export const isExpired = (iso: string) => new Date(iso + "T23:59:59") < new Date();
export const seatPct = (filled: number, max: number) =>
  max <= 0 ? 0 : Math.min(100, Math.round((filled / max) * 100));

/** Safe display alias to never expose a traveller's private full name or personal identity. */
export const formatSafeAlias = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] || "Traveller";
  const last = parts[parts.length - 1];
  const initial = last && last[0] ? last[0].toUpperCase() : "";
  return `${parts[0] || "Traveller"} ${initial}.`;
};
