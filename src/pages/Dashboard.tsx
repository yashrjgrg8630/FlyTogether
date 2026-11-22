import { CountUp } from "@/components/motion/Motion";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  CalendarDays,
  ClipboardList,
  Pencil,
  Plane,
  Plus,
  RefreshCw,
  Sparkles,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/common/EmptyState";
import { RouteBadge } from "@/components/common/RouteBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { GroupProgress } from "@/components/groups/GroupProgress";
import { SourceBadge } from "@/components/quotations/SourceBadge";
import { RequestForm } from "@/components/travel/RequestForm";
import { useAuth } from "@/context/AuthContext";
import { groupService, matchingService, travelService, type ApiError } from "@/services";
import type { Group, Match, Quote, TravelRequest } from "@/types";
import { formatDate, formatINR, formatShortDate, isExpired } from "@/utils/format";

function Section({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: typeof Plane;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Icon className="size-5 text-coral" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <span className="flex items-center gap-2">
        <AlertCircle className="size-4 text-destructive" />
        {message}
      </span>
      <Button size="sm" variant="outline" onClick={onRetry}>
        <RefreshCw /> Retry
      </Button>
    </div>
  );
}
const Skel = ({ n = 2, h = "h-28" }: { n?: number; h?: string }) => (
  <div className="grid gap-3 md:grid-cols-2">
    {Array.from({ length: n }).map((_, i) => (
      <Skeleton key={i} className={`${h} rounded-2xl`} />
    ))}
  </div>
);

function RequestCard({
  r,
  onEdit,
  onCancel,
}: {
  r: TravelRequest;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const locked = r.status === "grouped";
  const reason = "Leave the group first to change this request";
  const action = (btn: React.ReactNode) =>
    locked ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>{btn}</span>
        </TooltipTrigger>
        <TooltipContent>{reason}</TooltipContent>
      </Tooltip>
    ) : (
      btn
    );
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <RouteBadge
          origin={r.origin?.iata_code ?? "?"}
          destination={r.destination?.iata_code ?? "?"}
        />
        <StatusBadge status={r.status} />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Departure</dt>
          <dd className="font-semibold tabular-nums">{formatShortDate(r.departure_date)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Flexibility</dt>
          <dd className="font-semibold tabular-nums">± {r.flexibility_days}d</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Seats</dt>
          <dd className="font-semibold tabular-nums">{r.passenger_count}</dd>
        </div>
      </dl>
      {r.max_budget ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Budget up to {formatINR(r.max_budget)} / passenger
        </p>
      ) : null}
      {r.status !== "cancelled" && (
        <div className="mt-4 flex gap-2 border-t pt-4">
          {action(
            <Button size="sm" variant="outline" disabled={locked} onClick={onEdit}>
              <Pencil /> Edit
            </Button>,
          )}
          {action(
            <Button
              size="sm"
              variant="ghost"
              disabled={locked}
              onClick={onCancel}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 /> Cancel
            </Button>,
          )}
          {locked && r.group_id && (
            <Button size="sm" variant="link" asChild className="ml-auto">
              <Link to="/groups/$groupId" params={{ groupId: r.group_id }}>
                View group
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<TravelRequest | null>(null);
  const [cancelling, setCancelling] = useState<TravelRequest | null>(null);

  const reqQ = useQuery({ queryKey: ["requests", "mine"], queryFn: travelService.listMine });
  const requests = reqQ.data ?? [];
  const active = requests.filter((r) => r.status !== "cancelled");
  const open = requests.filter((r) => r.status === "open");
  const groupIds = [
    ...new Set(
      requests.filter((r) => r.status === "grouped" && r.group_id).map((r) => r.group_id!),
    ),
  ];

  const groupQs = useQueries({
    queries: groupIds.map((id) => ({
      queryKey: ["group", id],
      queryFn: () => groupService.get(id),
    })),
  });
  const quoteQs = useQueries({
    queries: groupIds.map((id) => ({
      queryKey: ["quotes", id],
      queryFn: () => groupService.quotes(id),
    })),
  });
  const matchQs = useQueries({
    queries: open.map((r) => ({
      queryKey: ["matches", r.id],
      queryFn: () => matchingService.forRequest(r.id),
    })),
  });

  const groups = groupQs.map((q) => q.data).filter(Boolean) as Group[];
  const quotes = (quoteQs.flatMap((q) => q.data ?? []) as Quote[])
    .sort((a, b) => b.valid_until.localeCompare(a.valid_until))
    .slice(0, 4);
  const joinedIds = new Set(groupIds);
  const matches = matchQs
    .flatMap((q, i) => (q.data?.matches ?? []).map((m) => ({ m, req: open[i]! })))
    .filter(({ m }) => !joinedIds.has(m.group_id))
    .sort((a, b) => b.m.match_score - a.m.match_score)
    .slice(0, 4);

  const refreshAll = () => qc.invalidateQueries();
  const doCancel = async () => {
    if (!cancelling) return;
    try {
      await travelService.remove(cancelling.id);
      toast.success("Request cancelled");
      await qc.invalidateQueries({ queryKey: ["requests"] });
    } catch (e) {
      toast.error((e as ApiError).message, { action: { label: "Retry", onClick: doCancel } });
    } finally {
      setCancelling(null);
    }
  };

  const groupLoading = reqQ.isLoading || groupQs.some((q) => q.isLoading);
  const quoteLoading = reqQ.isLoading || quoteQs.some((q) => q.isLoading);
  const matchLoading = reqQ.isLoading || matchQs.some((q) => q.isLoading);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">Dashboard</p>
          <h1 className="text-4xl font-semibold">
            Hi {user?.full_name.split(" ")[0]}, where{" "}
            <span className="font-serif-accent">next?</span>
          </h1>
        </div>
        <Button variant="hero" size="xl" asChild>
          <Link to="/create-request">
            <Plus /> New requirement
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Active requests", v: active.length, i: ClipboardList },
          { l: "Groups joined", v: groupIds.length, i: Users },
          {
            l: "Quotes to compare",
            v: quotes.filter((q) => !isExpired(q.valid_until)).length,
            i: Tag,
          },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border bg-card p-4 shadow-soft">
            <s.i className="size-4 text-muted-foreground" />
            <div className="mt-2 text-3xl font-semibold tabular-nums">
              {reqQ.isLoading ? "–" : <CountUp value={s.v} />}
            </div>
            <div className="text-xs text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      <Section title="My requests" icon={ClipboardList}>
        {reqQ.isLoading ? (
          <Skel n={2} h="h-44" />
        ) : reqQ.isError ? (
          <ErrorBox message="Couldn't load your requests" onRetry={() => reqQ.refetch()} />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Plane}
            title="No requirements yet"
            description="Publish your route and dates to start finding co-travellers."
            action={
              <Button variant="hero" asChild>
                <Link to="/create-request">Publish a requirement</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {requests.map((r) => (
              <RequestCard
                key={r.id}
                r={r}
                onEdit={() => setEditing(r)}
                onCancel={() => setCancelling(r)}
              />
            ))}
          </div>
        )}
      </Section>

      <div className="grid gap-12 lg:grid-cols-2">
        <Section
          title="Joined groups"
          icon={Users}
          action={
            groupIds.length > 0 && (
              <Button variant="link" size="sm" asChild>
                <Link to="/my-groups">See all</Link>
              </Button>
            )
          }
        >
          {groupLoading ? (
            <Skel n={1} />
          ) : groupQs.some((q) => q.isError) ? (
            <ErrorBox message="Couldn't load your groups" onRetry={refreshAll} />
          ) : groups.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Not in a group yet"
              description="Join a recommended group below — nothing happens until you confirm."
            />
          ) : (
            <div className="space-y-3">
              {groups.map((g) => (
                <Link
                  key={g.id}
                  to="/groups/$groupId"
                  params={{ groupId: g.id }}
                  className="block rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <RouteBadge origin={g.origin.iata_code} destination={g.destination.iata_code} />
                    <StatusBadge status={g.status} />
                  </div>
                  <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    {formatShortDate(g.window_start)} – {formatShortDate(g.window_end)}
                  </p>
                  <GroupProgress
                    filled={g.seats_filled}
                    max={g.max_seats}
                    threshold={g.min_seats_for_quote}
                  />
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section
          title="Latest quotation updates"
          icon={Tag}
          action={
            quotes.length > 0 && (
              <Button variant="link" size="sm" asChild>
                <Link to="/quotations">Compare</Link>
              </Button>
            )
          }
        >
          {quoteLoading ? (
            <Skel n={1} />
          ) : quoteQs.some((q) => q.isError) ? (
            <ErrorBox message="Couldn't load quotations" onRetry={refreshAll} />
          ) : quotes.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="No quotations yet"
              description="Quotes appear once your group reaches the seat threshold and an admin requests them."
            />
          ) : (
            <div className="space-y-3">
              {quotes.map((q) => {
                const expired = isExpired(q.valid_until) || q.status === "expired";
                return (
                  <div
                    key={q.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-soft"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="font-semibold">{q.airline_name}</div>
                      <div className="flex flex-wrap gap-1.5">
                        <SourceBadge source={q.source_type} />
                        {expired && (
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold uppercase text-muted-foreground">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Valid until {formatDate(q.valid_until)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold tabular-nums">
                        {formatINR(q.price_per_passenger)}
                      </div>
                      <div className="text-xs text-muted-foreground">per passenger</div>
                    </div>
                  </div>
                );
              })}
              {quotes.some((q) => q.source_type === "simulated") && (
                <p className="text-xs text-muted-foreground">
                  Simulated prices are illustrative, not a real airline offer.
                </p>
              )}
            </div>
          )}
        </Section>
      </div>

      <Section
        title="Recommended matches"
        icon={Sparkles}
        action={
          <Button variant="link" size="sm" asChild>
            <Link to="/discover">Discover more</Link>
          </Button>
        }
      >
        {matchLoading ? (
          <Skel n={2} />
        ) : matchQs.some((q) => q.isError) ? (
          <ErrorBox message="Couldn't load matches" onRetry={refreshAll} />
        ) : matches.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No matches right now"
            description={
              open.length
                ? "No forming groups fit your open requests yet. Try widening your date flexibility."
                : "Matches appear for requests that aren't in a group yet."
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {matches.map(({ m, req }) => (
              <MatchCard key={`${req.id}-${m.group_id}`} m={m} req={req} />
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Suggestions only — you're never added to a group without confirming.
        </p>
      </Section>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit requirement</DialogTitle>
            <DialogDescription>Changes may update which groups match you.</DialogDescription>
          </DialogHeader>
          {editing && (
            <RequestForm
              submitLabel="Save changes"
              onCancel={() => setEditing(null)}
              initial={{
                origin: editing.origin ?? null,
                destination: editing.destination ?? null,
                values: {
                  origin_id: editing.origin_id,
                  destination_id: editing.destination_id,
                  departure_date: editing.departure_date,
                  flexibility_days: editing.flexibility_days,
                  passenger_count: editing.passenger_count,
                  max_budget: editing.max_budget ?? null,
                },
              }}
              onSubmit={async (p) => {
                try {
                  await travelService.update(editing.id, p);
                  toast.success("Request updated");
                  setEditing(null);
                  await qc.invalidateQueries();
                } catch (e) {
                  toast.error((e as ApiError).message || "Could not save changes");
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!cancelling} onOpenChange={(o) => !o && setCancelling(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this requirement?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelling?.origin?.iata_code} → {cancelling?.destination?.iata_code} on{" "}
              {cancelling && formatDate(cancelling.departure_date)} will stop receiving matches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={doCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MatchCard({ m, req }: { m: Match; req: TravelRequest }) {
  const [o, d] = m.route.split("-");
  const fits = m.available_capacity >= req.passenger_count;
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <RouteBadge origin={o ?? ""} destination={d ?? ""} />
        <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
          {m.match_score}% match
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Window {formatShortDate(m.window_start)} – {formatShortDate(m.window_end)} · for your{" "}
        {req.passenger_count}-seat request
      </p>
      <div className="mt-3">
        <GroupProgress filled={m.passengers} max={m.passengers + m.available_capacity} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {!fits
            ? "Not enough seats left"
            : !m.date_compatible
              ? "Outside your date window"
              : "Fits your dates and seats"}
        </span>
        <Button size="sm" variant="coral" asChild>
          <Link to="/groups/$groupId" params={{ groupId: m.group_id }}>
            View group
          </Link>
        </Button>
      </div>
    </div>
  );
}
