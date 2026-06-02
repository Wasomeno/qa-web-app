import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { getAppProject } from "@/api/project";
import { usePageHeader } from "@/contexts/project-page-header-context";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectOverview } from "@/pages/projects";

function ProjectIndexRoute() {
  const { id } = Route.useParams();
  const { scenarioSync } = Route.useSearch();
  const { setHeader } = usePageHeader();
  const { data, isLoading } = useQuery({
    queryKey: ["app-project", id],
    queryFn: () => getAppProject(id),
  });

  // Persist scenarioSync so it survives sidebar navigation to child routes
  useEffect(() => {
    if (scenarioSync === 'started') {
      sessionStorage.setItem(`project:${id}:sync_started`, Date.now().toString());
    }
  }, [id, scenarioSync]);

  useEffect(() => {
    setHeader({
      title: "Overview",
      description: "Project overview and quick actions",
    });
  }, [setHeader]);

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!data?.data) {
    return null;
  }

  return (
    <ProjectOverview
      project={data.data}
      scenarioSync={scenarioSync === 'started' ? 'started' : undefined}
    />
  );
}

const searchSchema = z.object({
  scenarioSync: z.literal('started').optional(),
});

export const Route = createFileRoute("/projects/$id/")({
  validateSearch: searchSchema,
  component: ProjectIndexRoute,
});
