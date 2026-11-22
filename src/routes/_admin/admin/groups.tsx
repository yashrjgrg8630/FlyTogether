import { createFileRoute } from "@tanstack/react-router";
import { ManageGroups } from "@/pages/ManageGroups";
export const Route = createFileRoute("/_admin/admin/groups")({
  head: () => ({
    meta: [
      { title: "Manage groups · FlyTogether" },
      {
        name: "description",
        content:
          "Filter travel groups by route, date and status, and request quotations for eligible groups.",
      },
      { property: "og:title", content: "Manage groups · FlyTogether" },
      {
        property: "og:description",
        content:
          "Review passenger seats and create quote requests for eligible FlyTogether groups.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ManageGroups,
});
