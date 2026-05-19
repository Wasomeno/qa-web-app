import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAppProject } from "@/api/project";
import { usePageHeader } from "@/contexts/project-page-header-context";
import { SpecsPage } from "@/pages/specs/specs-page";

function ProjectSpecsRoute() {
  const { id } = Route.useParams();
  const { setHeader } = usePageHeader();
  const { data } = useQuery({
    queryKey: ["app-project", id],
    queryFn: () => getAppProject(id),
  });
  const project = data?.data;

  useEffect(() => {
    setHeader({
      title: "Specs",
      description: "Browse and edit specs in the specs repository",
    });
  }, [setHeader]);

  if (!project) return null;

  return (
    <SpecsPage
      projectId={id}
      branchProjectId={project.specsRepoName}
      projectName={project.name}
    />
  );
}

export const Route = createFileRoute("/projects/$id/specs")({
  component: ProjectSpecsRoute,
});
