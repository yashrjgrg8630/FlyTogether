import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Users, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { RouteBadge } from "@/components/common/RouteBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { GroupProgress } from "@/components/groups/GroupProgress";
import { GroupActions } from "@/components/groups/GroupActions";
import { QueryError } from "@/components/groups/QueryError";
import { PriceComparison } from "@/components/quotations/PriceComparison";
import { groupService, travelService } from "@/services";
import { formatDate } from "@/utils/format";

export function GroupDetails({ groupId }: { groupId: string }) {
  const group = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupService.get(groupId),
  });
  const members = useQuery({
    queryKey: ["members", groupId],
    queryFn: () => groupService.members(groupId),
  });
  const quotes = useQuery({
    queryKey: ["quotes", groupId],
    queryFn: () => groupService.quotes(groupId),
  });
  const requests = useQuery({ queryKey: ["requests", "mine"], queryFn: travelService.listMine });
  const g = group.data;
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10">
      <Button variant="ghost" asChild className="px-0">
        <Link to="/discover">
          <ArrowLeft /> Discover groups
        </Link>
      </Button>
      {group.isError || requests.isError ? (
        <QueryError
          message="Couldn't load this group or your requirements."
          retry={() => {
            group.refetch();
            requests.refetch();
          }}
        />
      ) : !g || requests.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <>
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <RouteBadge
                origin={g.origin.iata_code}
                destination={g.destination.iata_code}
                size="lg"
              />
              <StatusBadge status={g.status} />
            </div>
            <h1 className="text-4xl font-semibold">
              {g.origin.city} to {g.destination.city}
            </h1>
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4 shrink-0" />
              {formatDate(g.window_start)} – {formatDate(g.window_end)}
            </p>
          </header>
          <section className="grid gap-6 border-y py-6 sm:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Passenger seats</h2>
              <GroupProgress
                filled={g.seats_filled}
                max={g.max_seats}
                threshold={g.min_seats_for_quote}
              />
              <p className="text-xs text-muted-foreground">
                Quote threshold: {g.min_seats_for_quote} passenger seats ·{" "}
                {Math.max(0, g.min_seats_for_quote - g.seats_filled)} more needed
              </p>
            </div>
            <div className="sm:max-w-72">
              <GroupActions group={g} requests={requests.data ?? []} />
            </div>
          </section>
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Users className="size-5 text-coral" />
              Group members · {g.seats_filled} passenger seats
            </h2>
            {members.isError ? (
              <QueryError message="Couldn't load group members." retry={() => members.refetch()} />
            ) : members.isLoading ? (
              <Skeleton className="h-28" />
            ) : members.data?.length ? (
              <div className="divide-y border-y">
                {members.data.map((m) => (
                  <div
                    key={m.travel_request_id}
                    className="flex items-center justify-between gap-3 py-4"
                  >
                    <div>
                      <p className="font-medium">{m.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {formatDate(m.joined_at)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {m.passenger_count} seats
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No member details available yet.</p>
            )}
          </section>
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Tag className="size-5 text-coral" />
              Group quotations
            </h2>
            {quotes.isError ? (
              <QueryError message="Couldn't load quotations." retry={() => quotes.refetch()} />
            ) : quotes.isLoading ? (
              <Skeleton className="h-40" />
            ) : quotes.data?.length ? (
              <PriceComparison key={groupId} quotes={quotes.data} />
            ) : (
              <EmptyState
                icon={Tag}
                title="No quotations yet"
                description={
                  g.status === "quote_requested"
                    ? "Quotes have been requested and are awaiting an update."
                    : "Published quotations will appear here once available."
                }
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
