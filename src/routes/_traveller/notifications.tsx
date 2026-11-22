import { createFileRoute } from "@tanstack/react-router";
import { Notifications } from "@/pages/Notifications";
export const Route = createFileRoute("/_traveller/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · FlyTogether" },
      { name: "description", content: "Notifications on FlyTogether." },
      { property: "og:title", content: "Notifications · FlyTogether" },
      { property: "og:description", content: "Notifications on FlyTogether." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Notifications />,
});
