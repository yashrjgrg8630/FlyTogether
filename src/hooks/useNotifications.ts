import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationService } from "@/services";
import { useAuth } from "@/context/AuthContext";

export const notificationsKey = ["notifications"] as const;

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const q = useQuery({
    queryKey: notificationsKey,
    queryFn: notificationService.list,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
  const qc = useQueryClient();
  const onError = (e: Error) => toast.error(e.message || "Could not update notifications");
  const markRead = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKey }),
    onError,
  });
  const markAll = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKey }),
    onError,
  });
  const items = [...(q.data ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return { ...q, items, unread: items.filter((n) => !n.read).length, markRead, markAll };
}
