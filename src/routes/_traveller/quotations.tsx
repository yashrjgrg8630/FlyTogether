import { createFileRoute } from "@tanstack/react-router";
import { Quotations } from "@/pages/Quotations";
export const Route = createFileRoute("/_traveller/quotations")({
  head: () => ({
    meta: [
      { title: "Quotations · FlyTogether" },
      {
        name: "description",
        content:
          "Compare group quotations, baggage, terms and validity with clearly labelled potential savings on FlyTogether.",
      },
      { property: "og:title", content: "Quotations · FlyTogether" },
      {
        property: "og:description",
        content:
          "Compare indicative group fares and potential savings. FlyTogether does not sell tickets or reserve seats.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Quotations,
});
