import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAppProject } from "@/api/project";
import { usePageHeader } from "@/contexts/project-page-header-context";
import { TestScenariosPage } from "@/pages/test-scenarios";

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

  if (!isIndexRoute) return <Outlet />;

  if (!project) return null;

  return (
    <TestScenariosPage
      projectId={id}
      projectName={project.name}
      hideHeader
    />
  );
}

export const Route = createFileRoute("/projects/$id/test-scenarios")({
  component: ProjectTestScenariosRoute,
});
