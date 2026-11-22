import { BellOff, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { QueryError } from "@/components/groups/QueryError";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";

export function Notifications() {
  const { items, unread, isLoading, isError, error, refetch, markRead, markAll } =
    useNotifications();
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-semibold">
            <span className="font-serif-accent">Notifications</span>
          </h1>
          <p className="mt-1 text-muted-foreground" aria-live="polite">
            {isLoading ? "Loading…" : unread ? `${unread} unread` : "All caught up"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => markAll.mutate()}
          disabled={!unread || markAll.isPending}
        >
          <CheckCheck /> Mark all read
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <QueryError
          retry={() => refetch()}
          message={error?.message || "Couldn't load notifications."}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="No notifications yet"
          description="We'll let you know when groups form on your routes or quotes are published."
        />
      ) : (
        <ul className="space-y-1 rounded-2xl border bg-card p-2 shadow-sm">
          {items.map((n) => (
            <li key={n.id}>
              <NotificationItem n={n} onRead={(id) => markRead.mutate(id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
