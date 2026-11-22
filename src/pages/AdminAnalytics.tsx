import { useQuery } from "@tanstack/react-query";
import { adminService, USE_MOCKS } from "@/services";
import { QueryError } from "@/components/groups/QueryError";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDemandChart } from "@/components/admin/DemandCharts";
import { FestivalDemandHeatmap } from "@/components/admin/FestivalDemandHeatmap";

export function AdminAnalytics() {
  const analytics = useQuery({ queryKey: ["admin", "analytics"], queryFn: adminService.analytics });
  const festival = useQuery({
    queryKey: ["admin", "festival-demand"],
    queryFn: adminService.festivalDemand,
  });
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
          Demand insights{USE_MOCKS ? " · Demo data" : ""}
        </p>
        <h1 className="mt-1 text-4xl font-semibold">
          <span className="font-serif-accent">Analytics</span>
        </h1>
      </header>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Route demand</h2>
        <p className="text-xs text-muted-foreground">
          Passenger seats across groups · most popular routes
        </p>
        {analytics.isError ? (
          <QueryError message="Couldn't load route demand." retry={() => analytics.refetch()} />
        ) : analytics.data ? (
          <RouteDemandChart data={analytics.data.popular_routes} />
        ) : (
          <Skeleton className="h-80" />
        )}
      </section>
      <section className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold">Festival demand</h2>
        {festival.isError ? (
          <QueryError message="Couldn't load festival demand." retry={() => festival.refetch()} />
        ) : festival.data ? (
          <FestivalDemandHeatmap data={festival.data} />
        ) : (
          <Skeleton className="h-80" />
        )}
      </section>
    </div>
  );
}
