import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAppProject } from "@/api/project";
import { usePageHeader } from "@/contexts/project-page-header-context";
import { TestScenariosPage } from "@/pages/test-scenarios";
import { useProjectSync } from "@/pages/test-scenarios/hooks/use-project-sync";

function ProjectTestScenariosRoute() {
  const { id } = Route.useParams();
  const location = useLocation();
  const { setHeader } = usePageHeader();
  const { data } = useQuery({
    queryKey: ["app-project", id],
    queryFn: () => getAppProject(id),
  });
  const project = data?.data;
  const indexPath = `/projects/${id}/test-scenarios`;
  const isIndexRoute = location.pathname.replace(/\/$/, "") === indexPath;

  useEffect(() => {
    setHeader({
      title: "Test Scenarios",
      description: "Review and manage AI-generated test scenarios",
    });
  }, [setHeader]);

  // Track project sync progress via SSE
  const syncState = useProjectSync({
    projectId: id,
    enabled: isIndexRoute,
  });

  if (!isIndexRoute) return <Outlet />;
  if (!project) return null;

  const projectId = useMemo(() => id, [id]);

  return (
    <TestScenariosPage
      projectId={projectId}
      projectName={project.name}
      hideHeader
      syncState={syncState}
    />
  );
}

export const Route = createFileRoute("/projects/$id/test-scenarios")({
  component: ProjectTestScenariosRoute,
});
