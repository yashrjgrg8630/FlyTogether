import { createFileRoute } from "@tanstack/react-router";
import { DiscoverGroups } from "@/pages/DiscoverGroups";
export const Route = createFileRoute("/_traveller/discover")({
  head: () => ({
    meta: [
      { title: "Discover groups · FlyTogether" },
      { name: "description", content: "Discover groups on FlyTogether." },
      { property: "og:title", content: "Discover groups · FlyTogether" },
      { property: "og:description", content: "Discover groups on FlyTogether." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiscoverGroups,
});
