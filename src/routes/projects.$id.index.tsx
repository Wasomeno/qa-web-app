import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAppProject } from "@/api/project";
import { usePageHeader } from "@/contexts/project-page-header-context";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectOverview } from "@/pages/projects";

function ProjectIndexRoute() {
  const { id } = Route.useParams();
  const { setHeader } = usePageHeader();
  const { data, isLoading } = useQuery({
    queryKey: ["app-project", id],
    queryFn: () => getAppProject(id),
  });

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

  return <ProjectOverview project={data.data} />;
}

export const Route = createFileRoute("/projects/$id/")({
  component: ProjectIndexRoute,
});
