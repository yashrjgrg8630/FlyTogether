import { CountUp } from "@/components/motion/Motion";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  Users,
  Plane,
  Tag,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { adminService, groupService, flightService, USE_MOCKS } from "@/services";
import { QueryError } from "@/components/groups/QueryError";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RouteDemandChart, RequestsOverTimeChart } from "@/components/admin/DemandCharts";
import { QuoteRequestDialog } from "@/components/admin/QuoteRequestDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/utils/format";

export function AdminDashboard() {
  const analytics = useQuery({ queryKey: ["admin", "analytics"], queryFn: adminService.analytics });
  const groups = useQuery({ queryKey: ["groups", {}], queryFn: () => groupService.list() });
  const providers = useQuery({
    queryKey: ["admin", "providers"],
    queryFn: flightService.providerHealth,
  });
  const data = analytics.data;
  const waiting =
    groups.data?.filter(
      (g) => g.status === "quotation_eligible" || g.status === "quote_requested",
    ) ?? [];
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
          Admin workspace{USE_MOCKS ? " · Demo data" : ""}
        </p>
        <h1 className="mt-1 text-4xl font-semibold">
          Admin <span className="font-serif-accent">dashboard</span>
        </h1>
      </header>
      {analytics.isError || groups.isError ? (
        <QueryError
          message="Couldn't load the admin overview."
          retry={() => {
            analytics.refetch();
            groups.refetch();
          }}
        />
      ) : !data || groups.isLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Travellers & admins", value: data.total_users, icon: Users },
              { label: "Travel requests", value: data.total_requests, icon: ClipboardList },
              { label: "Active groups", value: data.active_groups, icon: Plane },
              { label: "Ready for quote request", value: data.groups_awaiting_quotes, icon: Tag },
            ].map((stat) => (
              <article
                key={stat.label}
                className="space-y-3 rounded-2xl border bg-card p-5 shadow-soft"
              >
                <stat.icon className="size-5 text-muted-foreground" />
                <p className="text-4xl font-semibold tracking-tight">
                  <CountUp value={stat.value} />
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </article>
            ))}
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <section className="min-w-0 space-y-4">
              <h2 className="text-xl font-semibold">Popular routes</h2>
              <p className="text-xs text-muted-foreground">Passenger seats across groups</p>
              <RouteDemandChart data={data.popular_routes} />
            </section>
            <section className="min-w-0 space-y-4">
              <h2 className="text-xl font-semibold">Requests over time</h2>
              <p className="text-xs text-muted-foreground">Last 14 days</p>
              <RequestsOverTimeChart data={data.requests_over_time} />
            </section>
          </div>
          <section className="space-y-4 border-t pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Groups awaiting quotes</h2>
              <Button variant="ghost" asChild>
                <Link to="/admin/groups">
                  Manage groups
                  <ArrowUpRight />
                </Link>
              </Button>
            </div>
            {waiting.length ? (
              <div className="divide-y">
                {waiting.map((g) => (
                  <div
                    key={g.id}
                    className="flex flex-wrap items-center justify-between gap-4 py-4"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {g.origin.iata_code} → {g.destination.iata_code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(g.target_date)} · {g.seats_filled} passenger seats
                        {g.quote_deadline ? ` · deadline ${formatDate(g.quote_deadline)}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={g.status} />
                      {g.status === "quotation_eligible" && <QuoteRequestDialog group={g} />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No groups awaiting quotes.</p>
            )}
          </section>
          <section className="space-y-4 border-t pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Data sources & provider status</h2>
              <span className="text-xs text-muted-foreground">Server-side credentials & audit</span>
            </div>
            {providers.isLoading ? (
              <Skeleton className="h-24 rounded-2xl" />
            ) : providers.isError ? (
              <p className="text-xs text-destructive">Could not check provider status.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {providers.data?.map((p) => (
                  <div
                    key={p.provider_name}
                    className="flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-soft"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-primary" />
                        <span className="font-semibold">{p.provider_name}</span>
                      </div>
                      <span className="inline-flex rounded-full bg-destructive/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-destructive">
                        {p.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {p.error_message || "Operational"}
                    </p>
                    <p className="mt-3 text-[11px] text-subtle">
                      Last check: {new Date(p.last_checked_at).toLocaleTimeString("en-IN")} ·
                      Credentials server-only
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
