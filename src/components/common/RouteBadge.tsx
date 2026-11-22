import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
export function RouteBadge({
  origin,
  destination,
  className,
  size = "md",
}: {
  origin: string;
  destination: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const s = { sm: "text-xs px-2 py-0.5", md: "text-sm px-3 py-1", lg: "text-lg px-4 py-1.5" }[size];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-secondary font-display font-semibold tracking-wide text-secondary-foreground",
        s,
        className,
      )}
    >
      {origin}
      <ArrowRight className="size-[1em] text-coral" />
      {destination}
    </span>
  );
}
