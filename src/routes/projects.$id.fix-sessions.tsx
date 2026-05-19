import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { usePageHeader } from "@/contexts/project-page-header-context";
import { FixSessionsListPage } from "@/pages/agent/fix-sessions-list";

function ProjectFixSessionsRoute() {
  const { id } = Route.useParams();
  const { setHeader } = usePageHeader();

  useEffect(() => {
    setHeader({
      title: "Fix Sessions",
      description: "Track AI-assisted fixes for project issues",
    });
  }, [setHeader]);

  return <FixSessionsListPage projectId={id} hideHeader />;
}

export const Route = createFileRoute("/projects/$id/fix-sessions")({
  component: ProjectFixSessionsRoute,
});
