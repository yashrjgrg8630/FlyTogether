import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type { FestivalDemand } from "@/types";
import { cn } from "@/lib/utils";

function intensity(count: number) {
  return count < 40
    ? "bg-muted text-muted-foreground"
    : count < 80
      ? "bg-info-soft text-info"
      : count < 120
        ? "bg-accent text-accent-foreground"
        : "bg-primary text-primary-foreground";
}
export function FestivalDemandHeatmap({ data }: { data: FestivalDemand }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Illustrative festival demand · mock passenger seats, not a forecast
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-separate border-spacing-2 text-xs">
          <caption className="sr-only">Festival demand by route in passenger seats</caption>
          <thead>
            <tr>
              <th className="text-left">Route</th>
              {data.festivals.map((festival) => (
                <th key={festival} className="font-medium">
                  {festival}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.route}>
                <th className="text-left font-semibold">{row.route}</th>
                {row.counts.map((count, i) => (
                  <td key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "h-12 w-full rounded-md tabular-nums hover:opacity-80",
                            intensity(count),
                          )}
                          aria-label={`${row.route}, ${data.festivals[i]}: ${count} passenger seats`}
                        >
                          {count}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {row.route} · {data.festivals[i]} · {count} passenger seats
                      </TooltipContent>
                    </Tooltip>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        Passenger seats
        {[
          { label: "0–39", count: 20 },
          { label: "40–79", count: 60 },
          { label: "80–119", count: 100 },
          { label: "120+", count: 140 },
        ].map((level) => (
          <span key={level.label} className="flex items-center gap-2">
            <span className={cn("size-3 rounded-sm", intensity(level.count))} />
            {level.label}
          </span>
        ))}
      </div>
    </div>
  );
}
