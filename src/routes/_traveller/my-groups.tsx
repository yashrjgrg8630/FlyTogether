import { createFileRoute } from "@tanstack/react-router";
import { MyGroups } from "@/pages/MyGroups";
export const Route = createFileRoute("/_traveller/my-groups")({
  head: () => ({
    meta: [
      { title: "My groups · FlyTogether" },
      { name: "description", content: "My groups on FlyTogether." },
      { property: "og:title", content: "My groups · FlyTogether" },
      { property: "og:description", content: "My groups on FlyTogether." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <MyGroups />,
});
