import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/groups/QueryError";
import { EmptyState } from "@/components/common/EmptyState";
import { RouteBadge } from "@/components/common/RouteBadge";
import { PriceComparison } from "@/components/quotations/PriceComparison";
import { groupService, quoteService, travelService } from "@/services";
import { formatDate } from "@/utils/format";

export function Quotations() {
  const [selected, setSelected] = useState("");
  const groups = useQuery({ queryKey: ["groups", {}], queryFn: () => groupService.list() });
  const requests = useQuery({ queryKey: ["requests", "mine"], queryFn: travelService.listMine });
  const joinedIds = new Set(
    requests.data?.filter((r) => r.status === "grouped" && r.group_id).map((r) => r.group_id),
  );
  const rows = [...(groups.data ?? [])].sort(
    (a, b) => Number(joinedIds.has(b.id)) - Number(joinedIds.has(a.id)),
  );
  const group =
    rows.find((g) => g.id === selected) ??
    rows.find((g) => joinedIds.has(g.id)) ??
    rows.find((g) => g.status === "quoted") ??
    rows[0];
  const groupId = group?.id ?? "";
  const quotes = useQuery({
    queryKey: ["quotes", groupId],
    queryFn: () => quoteService.forGroup(groupId),
    enabled: !!groupId,
  });
  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 px-4 py-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
          Group fares at a glance
        </p>
        <h1 className="mt-1 text-4xl font-semibold">
          <span className="font-serif-accent">Quotations</span>
        </h1>
      </header>
      {groups.isError || requests.isError ? (
        <QueryError
          message="Couldn't load groups for comparison."
          retry={() => {
            groups.refetch();
            requests.refetch();
          }}
        />
      ) : groups.isLoading || requests.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : !group ? (
        <EmptyState
          icon={Tag}
          title="No groups available"
          description="There are no groups with quotations to compare yet."
        />
      ) : (
        <>
          <div className="max-w-lg space-y-2">
            <Label>Travel group</Label>
            <Select value={groupId} onValueChange={setSelected}>
              <SelectTrigger className="h-12" aria-label="Travel group">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rows.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.origin.iata_code} → {g.destination.iata_code} · {formatDate(g.target_date)}
                    {joinedIds.has(g.id) ? " · Joined" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <section className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <RouteBadge
                  origin={group.origin.iata_code}
                  destination={group.destination.iata_code}
                  size="lg"
                />
                <h2 className="text-xl font-semibold">
                  {group.origin.city} to {group.destination.city}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {formatDate(group.window_start)} – {formatDate(group.window_end)}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/groups/$groupId" params={{ groupId }}>
                  Group details
                  <ArrowUpRight />
                </Link>
              </Button>
            </div>
            {quotes.isError ? (
              <QueryError
                message="Couldn't load these quotations."
                retry={() => quotes.refetch()}
              />
            ) : quotes.isLoading ? (
              <div className="grid gap-5 md:grid-cols-2">
                {[1, 2].map((n) => (
                  <Skeleton key={n} className="h-96 rounded-2xl" />
                ))}
              </div>
            ) : (
              <PriceComparison key={groupId} quotes={quotes.data ?? []} />
            )}
          </section>
        </>
      )}
    </div>
  );
}
