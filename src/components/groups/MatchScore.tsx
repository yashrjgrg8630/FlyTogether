import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Match } from "@/types";

export function MatchScore({ match }: { match: Match }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          aria-label={`${match.match_score}% match — score breakdown`}
          className="shrink-0 text-xs tabular-nums"
        >
          {match.match_score}% match <Info className="size-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-72 space-y-2 p-3">
        <p>
          <strong>Date:</strong>{" "}
          {match.score_breakdown?.date ??
            (match.date_compatible
              ? "Within your flexible date window"
              : "Outside your flexible date window")}
        </p>
        <p>
          <strong>Budget:</strong>{" "}
          {match.score_breakdown?.budget ?? "Breakdown not provided by the matching service."}
        </p>
        <p>
          <strong>Capacity:</strong>{" "}
          {match.score_breakdown?.capacity ??
            `${match.available_capacity} passenger seats available`}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
