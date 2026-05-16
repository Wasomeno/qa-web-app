import { createFileRoute, useRouter } from "@tanstack/react-router";
import { IssueDetailPage } from "@/pages/issues/detail";

function ProjectIssueDetailRoute() {
  const { id, iid: iidStr } = Route.useParams();
  const router = useRouter();

  return (
    <IssueDetailPage
      projectId={id}
      issueId={Number(iidStr)}
      onBack={() => router.history.back()}
    />
  );
}

export const Route = createFileRoute("/projects/$id/issues/$iid")({
  component: ProjectIssueDetailRoute,
});
