import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/pages/AdminDashboard";
export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({
    meta: [
      { title: "Admin overview · FlyTogether" },
      {
        name: "description",
        content: "Monitor traveller demand, popular routes, and groups awaiting quotations.",
      },
      { property: "og:title", content: "Admin overview · FlyTogether" },
      {
        property: "og:description",
        content: "Track demand and manage quote-ready groups in the FlyTogether admin workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminDashboard,
});
