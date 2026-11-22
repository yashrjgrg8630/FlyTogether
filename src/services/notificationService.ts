import type { Notification } from "@/types";
import { api, ApiError, call } from "./api";
import { currentUser, notifications } from "./mockDb";

export const notificationService = {
  list: () =>
    call<Notification[]>(
      () => {
        const u = currentUser();
        return notifications.filter((n) => n.user_id === u.id).map(({ user_id: _u, ...n }) => n);
      },
      async () => (await api.get("/notifications")).data,
    ),
  markRead: (id: string) =>
    call<Notification>(
      () => {
        const u = currentUser();
        const n = notifications.find((x) => x.id === id && x.user_id === u.id);
        if (!n) throw new ApiError(404, "Notification not found");
        n.read = true;
        const { user_id: _u, ...rest } = n;
        return rest;
      },
      async () => (await api.patch(`/notifications/${id}/read`)).data,
    ),
  markAllRead: () =>
    call<{ updated: number }>(
      () => {
        const u = currentUser();
        let updated = 0;
        notifications.forEach((n) => {
          if (n.user_id === u.id && !n.read) {
            n.read = true;
            updated++;
          }
        });
        return { updated };
      },
      async () => (await api.patch("/notifications/read-all")).data,
    ),
};
