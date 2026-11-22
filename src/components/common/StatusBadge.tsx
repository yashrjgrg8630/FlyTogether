import { cn } from "@/lib/utils";
import type { GroupStatus, RequestStatus } from "@/types";
const MAP: Record<GroupStatus | RequestStatus, { label: string; cls: string }> = {
  forming: { label: "Forming", cls: "bg-secondary text-secondary-foreground" },
  quotation_eligible: { label: "Quote eligible", cls: "bg-accent text-accent-foreground" },
  quote_requested: { label: "Quote requested", cls: "bg-info-soft text-info" },
  quoted: { label: "Quotes ready", cls: "bg-success/15 text-success" },
  closed: { label: "Closed", cls: "bg-muted text-muted-foreground" },
  open: { label: "Open", cls: "bg-secondary text-secondary-foreground" },
  grouped: { label: "In a group", cls: "bg-success/15 text-success" },
  cancelled: { label: "Cancelled", cls: "bg-muted text-muted-foreground line-through" },
};
export function StatusBadge({
  status,
  className,
}: {
  status: GroupStatus | RequestStatus;
  className?: string;
}) {
  const m = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        m.cls,
        className,
      )}
    >
      {m.label}
    </span>
  );
}
