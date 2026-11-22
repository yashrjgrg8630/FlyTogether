import { createFileRoute } from "@tanstack/react-router";
import { CreateRequest } from "@/pages/CreateRequest";
export const Route = createFileRoute("/_traveller/create-request")({
  head: () => ({
    meta: [
      { title: "New request · FlyTogether" },
      { name: "description", content: "New request on FlyTogether." },
      { property: "og:title", content: "New request · FlyTogether" },
      { property: "og:description", content: "New request on FlyTogether." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CreateRequest />,
});
