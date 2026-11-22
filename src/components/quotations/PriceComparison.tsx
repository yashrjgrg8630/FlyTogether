import { useEffect, useId, useState } from "react";
import { Info, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/EmptyState";
import { QuoteCard } from "./QuoteCard";
import type { Quote } from "@/types";
import { quoteValidity } from "@/utils/quoteRules";

export function PriceComparison({ quotes }: { quotes: Quote[] }) {
  const id = useId();
  const [fare, setFare] = useState("");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const parsed = fare.trim() ? Number(fare) : undefined;
  const invalid = parsed !== undefined && (!Number.isFinite(parsed) || parsed <= 0);
  const indicativeFare = invalid ? undefined : parsed;
  const visible = quotes.filter((q) => q.status !== "draft");
  const sorted = [...visible].sort(
    (a, b) =>
      Number(quoteValidity(a, now).expired) - Number(quoteValidity(b, now).expired) ||
      a.price_per_passenger - b.price_per_passenger,
  );
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border-y py-5">
        <div className="w-full max-w-sm space-y-2">
          <Label htmlFor={id}>Your indicative fare (₹ / passenger)</Label>
          <Input
            id={id}
            type="number"
            min="1"
            step="any"
            inputMode="decimal"
            placeholder="Not provided"
            value={fare}
            onChange={(e) => setFare(e.target.value)}
            aria-invalid={invalid}
            aria-describedby={`${id}-note`}
          />
          <p
            id={`${id}-note`}
            className={invalid ? "text-xs text-destructive" : "text-xs text-muted-foreground"}
          >
            {invalid
              ? "Enter a fare greater than zero."
              : "User-provided reference only; not a live airline fare."}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {visible.length} quotations ·{" "}
          {visible.filter((q) => !quoteValidity(q, now).expired).length} valid
        </p>
      </div>
      {sorted.length ? (
        <div className="grid items-stretch gap-5 pt-3 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((q, i) => (
            <QuoteCard
              key={q.id}
              quote={q}
              indicativeFare={indicativeFare}
              now={now}
              best={i === 0 && !quoteValidity(q, now).expired && sorted.length > 1}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Tag}
          title="No quotations yet"
          description="No published quotations are available for this group."
        />
      )}
      <div className="flex items-start gap-3 border-t pt-5 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-coral" />
        <div className="space-y-2">
          <p>
            Potential savings are estimates against your indicative fare, not guaranteed savings.
            Baggage, terms and final fares may differ.
          </p>
          <p className="font-semibold text-foreground">
            FlyTogether aggregates demand. It does not sell tickets or reserve seats.
          </p>
        </div>
      </div>
    </div>
  );
}
