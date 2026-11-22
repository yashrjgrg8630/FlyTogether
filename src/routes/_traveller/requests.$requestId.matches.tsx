import { createFileRoute } from "@tanstack/react-router";
import { RequestMatches } from "@/pages/RequestMatches";
export const Route = createFileRoute("/_traveller/requests/$requestId/matches")({
  head: () => ({
    meta: [
      { title: "Matching groups for your request · FlyTogether" },
      {
        name: "description",
        content: "Review flight groups ranked for your requirement and choose whether to join.",
      },
      { property: "og:title", content: "Matching groups for your request · FlyTogether" },
      {
        property: "og:description",
        content: "Review flight groups ranked for your requirement and choose whether to join.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequestMatchesRoute,
});
function RequestMatchesRoute() {
  const { requestId } = Route.useParams();
  return <RequestMatches requestId={requestId} />;
}
