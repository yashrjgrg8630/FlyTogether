import { Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { QueryError } from "@/components/groups/QueryError";
import { GroupCard } from "@/components/groups/GroupCard";
import { groupService, travelService } from "@/services";

export function MyGroups() {
  const reqs = useQuery({ queryKey: ["requests", "mine"], queryFn: travelService.listMine });
  const requests = reqs.data ?? [];
  const ids = [
    ...new Set(
      requests
        .filter((r) => r.group_id && r.status !== "cancelled")
        .map((r) => r.group_id as string),
    ),
  ];
  const groups = useQueries({
    queries: ids.map((id) => ({ queryKey: ["group", id], queryFn: () => groupService.get(id) })),
  });
  const loading = reqs.isLoading || groups.some((g) => g.isLoading);
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <h1 className="text-4xl font-semibold">
        My <span className="font-serif-accent">groups</span>
      </h1>
      <p className="mt-1 mb-6 text-muted-foreground">Groups your flight requests have joined.</p>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : reqs.isError ? (
        <QueryError retry={() => reqs.refetch()} message="Couldn't load your groups." />
      ) : ids.length === 0 ? (
        <EmptyState
          icon={Users}
          title="You haven't joined a group yet"
          description="Discover groups flying your route, or publish a request to get matched."
          action={
            <Button asChild variant="coral">
              <Link to="/discover">Discover groups</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, i) =>
            g.data ? <GroupCard key={ids[i]} group={g.data} requests={requests} /> : null,
          )}
        </div>
      )}
    </div>
  );
}
