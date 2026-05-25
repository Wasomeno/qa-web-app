import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BoardsPage } from '@/pages/boards';

function BoardsRoute() {
  const navigate = useNavigate();

  return (
    <BoardsPage
      onNavigateToIssue={(issue: any) => {
        navigate({
          to: '/projects/$id/issues/$iid',
          params: {
            id: String(issue.project_id),
            iid: String(issue.iid),
          },
        });
      }}
    />
  );
}

export const Route = createFileRoute('/boards')({
  component: BoardsRoute,
});
