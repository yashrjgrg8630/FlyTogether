import { Link } from "@tanstack/react-router";
import { CalendarDays, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteBadge } from "@/components/common/RouteBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { GroupProgress } from "./GroupProgress";
import { GroupActions } from "./GroupActions";
import { MatchScore } from "./MatchScore";
import { formatShortDate } from "@/utils/format";
import type { Group, Match, TravelRequest } from "@/types";

export function GroupCard({
  group,
  match,
  requests,
  requestId,
}: {
  group: Group;
  match?: Match | undefined;
  requests: TravelRequest[];
  requestId?: string | undefined;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="flex items-center gap-2 text-2xl font-semibold tabular-nums tracking-tight">
          {group.origin.iata_code}
          <span aria-label="to" className="text-primary">
            →
          </span>
          {group.destination.iata_code}
        </h3>
        {match ? <MatchScore match={match} /> : <StatusBadge status={group.status} />}
      </div>
      <p className="-mt-2 text-sm text-muted-foreground">
        {group.origin.city} to {group.destination.city}
      </p>
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays className="size-4 shrink-0" />
        {formatShortDate(group.window_start)} – {formatShortDate(group.window_end)}
      </p>
      {match && <StatusBadge status={group.status} className="self-start" />}
      <GroupProgress
        filled={group.seats_filled}
        max={group.max_seats}
        threshold={group.min_seats_for_quote}
      />
      <div className="mt-auto border-t pt-4">
        <GroupActions group={group} requests={requests} requestId={requestId} />
        <Button variant="link" className="mt-2 px-0" asChild>
          <Link to="/groups/$groupId" params={{ groupId: group.id }}>
            Group details <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </article>
  );
}
