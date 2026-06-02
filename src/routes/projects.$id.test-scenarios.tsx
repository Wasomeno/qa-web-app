import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { getAppProject } from "@/api/project";
import { usePageHeader } from "@/contexts/project-page-header-context";
import { TestScenariosPage } from "@/pages/test-scenarios";
import { useProjectSync } from "@/pages/test-scenarios/hooks/use-project-sync";

function ProjectTestScenariosRoute() {
  const { id } = Route.useParams();
  const { scenarioSync } = Route.useSearch();
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

  // Read scenarioSync from search params or fall back to sessionStorage
  // (the overview route writes it when navigating from project creation)
  const syncingFromStorage = (() => {
    if (scenarioSync === 'started') return 'started' as const;
    const stored = sessionStorage.getItem(`project:${id}:sync_started`);
    if (stored) return 'started' as const;
    return undefined;
  })();

  if (!isIndexRoute) return <Outlet />;
  if (!project) return null;

  return (
    <TestScenariosPage
      projectId={id}
      projectName={project.name}
      hideHeader
      syncState={syncState}
      scenarioSync={syncingFromStorage}
    />
  );
}

const searchSchema = z.object({
  scenarioSync: z.literal('started').optional(),
});

export const Route = createFileRoute("/projects/$id/test-scenarios")({
  validateSearch: searchSchema,
  component: ProjectTestScenariosRoute,
});
