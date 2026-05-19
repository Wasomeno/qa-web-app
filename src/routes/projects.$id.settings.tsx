import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAppProject } from "@/api/project";
import { usePageHeader } from "@/contexts/project-page-header-context";
import { ProjectSettings } from "@/pages/projects";

function ProjectSettingsRoute() {
  const { id } = Route.useParams();
  const { setHeader } = usePageHeader();
  const { data } = useQuery({
    queryKey: ["app-project", id],
    queryFn: () => getAppProject(id),
  });
  const project = data?.data;

  useEffect(() => {
    setHeader({
      title: "Settings",
      description: "Manage project configuration",
    });
  }, [setHeader]);

  if (!project) return null;

  return <ProjectSettings project={project} />;
}

export const Route = createFileRoute("/projects/$id/settings")({
  component: ProjectSettingsRoute,
});
