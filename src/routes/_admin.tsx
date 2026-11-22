import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminRoute } from "@/components/common/RouteGuards";
export const Route = createFileRoute("/_admin")({
  ssr: false,
  component: () => (
    <AdminRoute>
      <Outlet />
    </AdminRoute>
  ),
});
