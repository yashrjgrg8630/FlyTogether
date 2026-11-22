import { createFileRoute } from "@tanstack/react-router";
import { Register } from "@/pages/Register";
export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account · FlyTogether" },
      { name: "description", content: "Create a FlyTogether account." },
      { property: "og:title", content: "Create account · FlyTogether" },
      { property: "og:description", content: "Create a FlyTogether account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Register />,
});
