import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { usePageHeader } from "@/contexts/project-page-header-context";
import { IssuesPage } from "@/pages/issues";

function ProjectIssuesRoute() {
  const { id } = Route.useParams();
  const { setHeader } = usePageHeader();

  useEffect(() => {
    setHeader({
      title: "Issues",
      description: "Track and triage bugs from the configured repository",
    });
  }, [setHeader]);

  return <IssuesPage appProjectId={id} hideHeader />;
}

export const Route = createFileRoute("/projects/$id/issues")({
  component: ProjectIssuesRoute,
});
