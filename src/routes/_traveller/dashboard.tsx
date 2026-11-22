import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/pages/Dashboard";
export const Route = createFileRoute("/_traveller/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · FlyTogether" },
      { name: "description", content: "Dashboard on FlyTogether." },
      { property: "og:title", content: "Dashboard · FlyTogether" },
      { property: "og:description", content: "Dashboard on FlyTogether." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Dashboard />,
});
