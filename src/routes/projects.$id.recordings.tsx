import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAppProject } from "@/api/project";
import { usePageHeader } from "@/contexts/project-page-header-context";
import { RecordingsPage } from "@/pages/recordings";

function ProjectRecordingsRoute() {
  const { id } = Route.useParams();
  const { setHeader } = usePageHeader();
  const { data } = useQuery({
    queryKey: ["app-project", id],
    queryFn: () => getAppProject(id),
  });
  const project = data?.data;

  useEffect(() => {
    setHeader({
      title: "Recordings",
      description: "Review browser recordings and saved blueprints",
    });
  }, [setHeader]);

  if (!project) return null;

  return (
    <RecordingsPage
      projectId={id}
      projectName={project.name}
      hideHeader
    />
  );
}

export const Route = createFileRoute("/projects/$id/recordings")({
  component: ProjectRecordingsRoute,
});
