import { cn } from "@/lib/utils";
import type { QuoteSource } from "@/types";

export type ProvenanceSource =
  | QuoteSource
  | "LIVE_SUPPLIER_DATA"
  | "MANUAL_AIRLINE_QUOTATION"
  | "STATIC_REFERENCE_DATA"
  | "SIMULATED_DEMO_DATA";

/** Never claim airline verification — only authorized provenance badges. */
export function SourceBadge({
  source,
  className,
}: {
  source: ProvenanceSource;
  className?: string;
}) {
  if (source === "LIVE_SUPPLIER_DATA") {
    return (
      <span
        className={cn(
          "inline-flex rounded-full bg-success/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-success",
          className,
        )}
      >
        LIVE SUPPLIER DATA
      </span>
    );
  }

  if (source === "STATIC_REFERENCE_DATA") {
    return (
      <span
        className={cn(
          "inline-flex rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground",
          className,
        )}
      >
        STATIC REFERENCE DATA
      </span>
    );
  }

  if (source === "simulated" || source === "SIMULATED_DEMO_DATA") {
    return (
      <span
        className={cn(
          "inline-flex rounded-full bg-warning-soft px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-warning",
          className,
        )}
      >
        SIMULATED – demo data
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-info-soft px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-info",
        className,
      )}
    >
      MANUAL – entered by admin
    </span>
  );
}
