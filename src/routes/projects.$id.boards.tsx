import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { usePageHeader } from "@/contexts/project-page-header-context";
import { BoardsPage } from "@/pages/boards";

function ProjectBoardsRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { setHeader } = usePageHeader();

  useEffect(() => {
    setHeader({
      title: "Boards",
      description: "Move issues across board columns and workflow labels",
    });
  }, [setHeader]);

  return (
    <BoardsPage
      projectId={id}
      hideHeader
      onNavigateToIssue={(issue) =>
        navigate({
          to: "/projects/$id/issues/$iid",
          params: { id, iid: String(issue.iid) },
        })
      }
    />
  );
}

export const Route = createFileRoute("/projects/$id/boards")({
  component: ProjectBoardsRoute,
});
