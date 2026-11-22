import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Login } from "@/pages/Login";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in · FlyTogether" },
      { name: "description", content: "Sign in to FlyTogether." },
      { property: "og:title", content: "Sign in · FlyTogether" },
      { property: "og:description", content: "Sign in to FlyTogether." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginRoute,
});
function LoginRoute() {
  const { redirect } = Route.useSearch();
  return <Login {...(redirect ? { redirect } : {})} />;
}
