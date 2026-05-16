import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { ProjectDetailPage } from "@/pages/projects";
import { z } from "zod";

const searchSchema = z.object({
  tab: z
    .enum([
      "overview",
      "issues",
      "boards",
      "specs",
      "test-scenarios",
      "recordings",
      "fix-sessions",
      "settings",
    ])
    .optional()
    .default("overview"),
});

function ProjectRoute() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  const location = useLocation();
  const projectPath = `/projects/${id}`;
  const isNestedProjectRoute =
    location.pathname !== projectPath && location.pathname !== `${projectPath}/`;
  const activeTab = location.pathname.startsWith(`${projectPath}/test-scenarios/`)
    ? "test-scenarios"
    : location.pathname.startsWith(`${projectPath}/issues/`)
      ? "issues"
      : tab;

  return (
    <ProjectDetailPage
      projectId={id}
      activeTab={activeTab}
      nestedContent={isNestedProjectRoute ? <Outlet /> : null}
    />
  );
}

export const Route = createFileRoute("/projects/$id")({
  component: ProjectRoute,
  validateSearch: searchSchema,
});
