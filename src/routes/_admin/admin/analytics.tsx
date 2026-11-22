import { createFileRoute } from "@tanstack/react-router";
import { AdminAnalytics } from "@/pages/AdminAnalytics";
export const Route = createFileRoute("/_admin/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · FlyTogether" },
      {
        name: "description",
        content: "Explore route demand and illustrative festival passenger-seat patterns.",
      },
      { property: "og:title", content: "Analytics · FlyTogether" },
      {
        property: "og:description",
        content:
          "Compare route demand and festival demand in the FlyTogether admin analytics workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminAnalytics,
});
