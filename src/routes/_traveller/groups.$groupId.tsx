import { createFileRoute } from "@tanstack/react-router";
import { GroupDetails } from "@/pages/GroupDetails";
export const Route = createFileRoute("/_traveller/groups/$groupId")({
  head: () => ({
    meta: [
      { title: "Group details · FlyTogether" },
      { name: "description", content: "Group details on FlyTogether." },
      { property: "og:title", content: "Group details · FlyTogether" },
      { property: "og:description", content: "Group details on FlyTogether." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GroupDetailsRoute,
});
function GroupDetailsRoute() {
  const { groupId } = Route.useParams();
  return <GroupDetails groupId={groupId} />;
}
