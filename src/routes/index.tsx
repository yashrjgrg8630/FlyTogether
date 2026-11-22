import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/pages/Home";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Group flight quotes, together · FlyTogether" },
      {
        name: "description",
        content: "Pool flight demand with travellers on your route and compare group quotations.",
      },
      { property: "og:title", content: "Group flight quotes, together · FlyTogether" },
      {
        property: "og:description",
        content: "Pool flight demand with travellers on your route and compare group quotations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Home />,
});
