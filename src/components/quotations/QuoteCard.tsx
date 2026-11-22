import { Clock3, Luggage, Plane, Users, TrendingDown } from "lucide-react";
import { SourceBadge } from "./SourceBadge";
import type { Quote } from "@/types";
import { formatDate, formatINR } from "@/utils/format";
import { potentialSavings, quoteValidity } from "@/utils/quoteRules";
import { cn } from "@/lib/utils";

export function QuoteCard({
  quote,
  indicativeFare,
  now,
  best,
}: {
  quote: Quote;
  indicativeFare?: number | undefined;
  now: number;
  best?: boolean;
}) {
  const validity = quoteValidity(quote, now);
  const savings = potentialSavings(quote.price_per_passenger, indicativeFare, validity.expired);
  return (
    <article
      aria-label={`${quote.airline_name} quotation`}
      className={cn(
        "relative flex min-w-0 flex-col rounded-2xl border bg-card text-card-foreground shadow-soft transition-all duration-200",
        best && "border-primary/60 shadow-glow",
        validity.expired && "border-dashed bg-muted/40",
      )}
    >
      {best && (
        <span className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
          Best price
        </span>
      )}
      <header className="space-y-4 p-5 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Plane className="size-5 text-primary" />
          <SourceBadge source={quote.source_type} />
        </div>
        <h3 className="break-words text-xl font-bold">{quote.airline_name}</h3>
        <div>
          <p
            className={cn(
              "text-4xl font-semibold tracking-tight tabular-nums",
              validity.expired ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {formatINR(quote.price_per_passenger)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">per passenger</p>
        </div>
      </header>
      <dl className="flex-1 space-y-5 border-t px-5 py-5 text-sm">
        <div>
          <dt className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="size-4" />
            Available seats
          </dt>
          <dd className="font-semibold tabular-nums">{quote.available_seats} passenger seats</dd>
        </div>
        <div>
          <dt className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Luggage className="size-4" />
            Baggage
          </dt>
          <dd className="break-words">{quote.baggage_details || "Not specified"}</dd>
        </div>
        <div>
          <dt className="mb-1 text-xs text-muted-foreground">Terms</dt>
          <dd className="break-words leading-relaxed">{quote.terms || "Not specified"}</dd>
        </div>
      </dl>
      <div className="space-y-3 border-t p-5">
        <div className={cn("space-y-1", validity.expired ? "text-destructive" : "text-foreground")}>
          <p className="flex items-start gap-2 text-xs font-semibold tabular-nums">
            <Clock3 className="size-4 shrink-0" />
            {validity.countdown}
          </p>
          <p className="text-xs text-muted-foreground">
            Valid until {formatDate(quote.valid_until)}
            {quote.valid_until.length > 10
              ? ` · ${new Date(quote.valid_until).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}`
              : " · end of day (local time)"}
          </p>
        </div>
        <div className="min-h-16 rounded-xl border bg-secondary/60 p-3 text-xs">
          {validity.expired ? (
            <p className="text-muted-foreground">
              Expired quote · no longer available. Savings are not calculated.
            </p>
          ) : savings ? (
            <>
              <p className="flex items-center gap-1.5 font-semibold text-primary">
                <TrendingDown className="size-4 shrink-0" />
                Potential savings: {formatINR(savings.amount)} ({savings.percent}%)
              </p>
              <p className="mt-1 text-muted-foreground">
                per passenger vs your indicative fare
                {savings.amount === 0 ? " · no price advantage" : ""}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">
              Potential savings unavailable without an indicative fare.
            </p>
          )}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {quote.source_type === "simulated"
            ? "Illustrative demo data, not a real airline offer."
            : "Entered by an admin; subject to airline confirmation and availability."}
        </p>
      </div>
    </article>
  );
}
