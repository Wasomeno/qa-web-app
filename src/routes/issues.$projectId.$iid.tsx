import { createFileRoute, useRouter } from '@tanstack/react-router';
import { IssueDetailPage } from '@/pages/issues/detail';

function IssuesDetailRoute() {
  const { projectId: projectIdStr, iid: iidStr } = Route.useParams();
  const router = useRouter();
  const projectId = Number(projectIdStr);
  const iid = Number(iidStr);

  return (
    <IssueDetailPage
      projectId={projectId}
      issueId={iid}
      onBack={() => router.history.back()}
    />
  );
}

export const Route = createFileRoute('/issues/$projectId/$iid')({
  component: IssuesDetailRoute,
});
