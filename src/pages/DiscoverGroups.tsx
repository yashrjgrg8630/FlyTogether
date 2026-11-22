import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, RotateCcw } from "lucide-react";
import { AirportCombobox } from "@/components/travel/AirportCombobox";
import { GroupCard } from "@/components/groups/GroupCard";
import { QueryError } from "@/components/groups/QueryError";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { groupService, matchingService, travelService } from "@/services";
import type { Airport, GroupStatus } from "@/types";

const statuses: { value: GroupStatus; label: string }[] = [
  { value: "forming", label: "Forming" },
  { value: "quotation_eligible", label: "Quote eligible" },
  { value: "quote_requested", label: "Quote requested" },
  { value: "quoted", label: "Quotes ready" },
  { value: "closed", label: "Closed" },
];
export function DiscoverGroups() {
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<GroupStatus | undefined>();
  const [requestId, setRequestId] = useState("");
  const filters = {
    origin: origin?.iata_code,
    destination: destination?.iata_code,
    date: date || undefined,
    status,
  };
  const groups = useQuery({
    queryKey: ["groups", filters],
    queryFn: () => groupService.list(filters),
  });
  const requests = useQuery({ queryKey: ["requests", "mine"], queryFn: travelService.listMine });
  const matches = useQuery({
    queryKey: ["matches", requestId],
    queryFn: () => matchingService.forRequest(requestId),
    enabled: !!requestId,
  });
  const rows = [...(groups.data ?? [])].sort(
    (a, b) =>
      (matches.data?.matches.find((m) => m.group_id === b.id)?.match_score ?? -1) -
      (matches.data?.matches.find((m) => m.group_id === a.id)?.match_score ?? -1),
  );
  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 px-4 py-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
          Find your co-travellers
        </p>
        <h1 className="mt-1 text-4xl font-semibold">
          Discover <span className="font-serif-accent">groups</span>
        </h1>
      </div>
      <div className="grid items-end gap-4 border-y py-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="filter-origin">Origin</Label>
          <AirportCombobox
            id="filter-origin"
            value={origin}
            onChange={setOrigin}
            placeholder="Any origin"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-destination">Destination</Label>
          <AirportCombobox
            id="filter-destination"
            value={destination}
            onChange={setDestination}
            placeholder="Any destination"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-date">Travel date</Label>
          <Input
            id="filter-date"
            className="h-12"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={status ?? "all"}
            onValueChange={(v) => setStatus(statuses.find((s) => s.value === v)?.value)}
          >
            <SelectTrigger className="h-12" aria-label="Group status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Select
            value={requestId || "none"}
            onValueChange={(v) => setRequestId(v === "none" ? "" : v)}
            disabled={requests.isLoading}
          >
            <SelectTrigger aria-label="Rank groups for a requirement">
              <SelectValue placeholder="Rank for a requirement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All groups · no match ranking</SelectItem>
              {requests.data
                ?.filter((r) => r.status === "open")
                .map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.origin?.iata_code} → {r.destination?.iata_code} · {r.departure_date}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setOrigin(null);
            setDestination(null);
            setDate("");
            setStatus(undefined);
            setRequestId("");
          }}
        >
          <RotateCcw /> Reset filters
        </Button>
      </div>
      {groups.isError || requests.isError || matches.isError ? (
        <QueryError
          retry={() => {
            groups.refetch();
            requests.refetch();
            if (requestId) matches.refetch();
          }}
        />
      ) : groups.isLoading || requests.isLoading || (!!requestId && matches.isLoading) ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : rows.length ? (
        <>
          <p className="text-sm text-muted-foreground">
            {rows.length} groups{requestId ? " · highest match first" : ""}
          </p>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((g) => (
              <GroupCard
                key={g.id}
                group={g}
                requests={requests.data ?? []}
                requestId={requestId || undefined}
                match={matches.data?.matches.find((m) => m.group_id === g.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Search}
          title="No groups found"
          description="No groups match these route, date and status filters."
        />
      )}
    </div>
  );
}
