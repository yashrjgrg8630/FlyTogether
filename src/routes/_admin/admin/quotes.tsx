import { createFileRoute } from "@tanstack/react-router";
import { ManageQuotes } from "@/pages/ManageQuotes";
export const Route = createFileRoute("/_admin/admin/quotes")({
  head: () => ({
    meta: [
      { title: "Manage quotes · FlyTogether" },
      {
        name: "description",
        content:
          "Create simulated and manual quotation drafts, review terms, and publish to travellers.",
      },
      { property: "og:title", content: "Manage quotes · FlyTogether" },
      {
        property: "og:description",
        content: "Manage the draft-to-publish quotation workflow with transparent source labels.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ManageQuotes,
});
