import { Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { GroupCard } from "@/components/groups/GroupCard";
import { QueryError } from "@/components/groups/QueryError";
import { matchingService, groupService, travelService } from "@/services";

export function RequestMatches({ requestId }: { requestId: string }) {
  const requests = useQuery({ queryKey: ["requests", "mine"], queryFn: travelService.listMine });
  const matches = useQuery({
    queryKey: ["matches", requestId],
    queryFn: () => matchingService.forRequest(requestId),
  });
  const ranked = [...(matches.data?.matches ?? [])].sort((a, b) => b.match_score - a.match_score);
  const groups = useQueries({
    queries: ranked.map((m) => ({
      queryKey: ["group", m.group_id],
      queryFn: () => groupService.get(m.group_id),
    })),
  });
  const request = requests.data?.find((r) => r.id === requestId);
  const retry = () => {
    requests.refetch();
    matches.refetch();
    groups.forEach((q) => q.refetch());
  };
  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 px-4 py-10">
      <Button variant="ghost" asChild className="px-0">
        <Link to="/dashboard">
          <ArrowLeft /> Dashboard
        </Link>
      </Button>
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
          Your requirement
        </p>
        <h1 className="text-4xl font-semibold">
          Matching groups for <span className="font-serif-accent">your</span> request
        </h1>
        {request && (
          <p className="text-sm text-muted-foreground">
            {request.origin?.city} → {request.destination?.city} · {request.departure_date} ·{" "}
            {request.passenger_count} passenger seats
          </p>
        )}
      </header>
      {requests.isError || matches.isError || groups.some((q) => q.isError) ? (
        <QueryError retry={retry} />
      ) : requests.isLoading || matches.isLoading || groups.some((q) => q.isLoading) ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : ranked.length ? (
        <>
          <p className="text-sm text-muted-foreground">
            {ranked.length} matching groups · highest score first
          </p>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ranked.map((m, i) => {
              const g = groups[i]?.data;
              return g ? (
                <GroupCard
                  key={m.group_id}
                  group={g}
                  match={m}
                  requests={requests.data ?? []}
                  requestId={requestId}
                />
              ) : null;
            })}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No matching groups yet"
          description="Your requirement is still open. Check other groups or adjust your dates on the dashboard."
          action={
            <Button variant="outline" asChild>
              <Link to="/discover">Discover groups</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
