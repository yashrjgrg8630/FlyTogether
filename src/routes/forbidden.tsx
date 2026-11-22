import { createFileRoute } from "@tanstack/react-router";
import { Forbidden } from "@/pages/Forbidden";
export const Route = createFileRoute("/forbidden")({
  head: () => ({
    meta: [
      { title: "Access denied · FlyTogether" },
      { name: "description", content: "You don't have permission to view this page." },
      { property: "og:title", content: "Access denied · FlyTogether" },
      { property: "og:description", content: "You don't have permission to view this page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Forbidden />,
});
