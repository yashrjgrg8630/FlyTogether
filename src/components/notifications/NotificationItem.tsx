import { useNavigate } from "@tanstack/react-router";
import type { Notification } from "@/types";
import { cn } from "@/lib/utils";

const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${Math.max(m, 1)}m ago`;
  if (m < 1440) return `${Math.round(m / 60)}h ago`;
  return `${Math.round(m / 1440)}d ago`;
};

export function NotificationItem({
  n,
  onRead,
  compact,
}: {
  n: Notification;
  onRead: (id: string) => void;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const open = () => {
    if (!n.read) onRead(n.id);
    if (n.link) navigate({ to: n.link });
  };
  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "flex w-full gap-3 rounded-xl text-left transition-colors hover:bg-muted focus-visible:bg-muted",
        compact ? "p-3" : "p-4",
        !n.read && "bg-secondary/60",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          n.read ? "bg-transparent" : "bg-coral",
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className={cn("text-sm", n.read ? "font-medium" : "font-semibold")}>{n.title}</span>
          <time dateTime={n.created_at} className="shrink-0 text-xs text-muted-foreground">
            {ago(n.created_at)}
          </time>
        </span>
        <span
          className={cn("mt-0.5 block text-sm text-muted-foreground", compact && "line-clamp-2")}
        >
          {n.message}
        </span>
        {!n.read && <span className="sr-only">Unread</span>}
      </span>
    </button>
  );
}
