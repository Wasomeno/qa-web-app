import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAppProject } from "@/api/project";
import { useProjectSidebar } from "@/contexts/project-sidebar-context";
import { PageHeaderProvider, usePageHeader } from "@/contexts/project-page-header-context";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const SECTION_META: Record<string, { label: string; description: string }> = {
  overview: { label: "Overview", description: "Project overview and quick actions" },
  issues: { label: "Issues", description: "Track and triage bugs from the configured repository" },
  boards: { label: "Boards", description: "Move issues across board columns and workflow labels" },
  specs: { label: "Specs", description: "Browse and edit specs in the specs repository" },
  "test-scenarios": { label: "Test Scenarios", description: "Review and manage AI-generated test scenarios" },
  recordings: { label: "Recordings", description: "Review browser recordings and saved blueprints" },
  "fix-sessions": { label: "Fix Sessions", description: "Track AI-assisted fixes for project issues" },
  settings: { label: "Settings", description: "Manage project configuration" },
};

function getSectionFromPath(pathname: string, projectBase: string): string | null {
  const rest = pathname.slice(projectBase.length).replace(/^\/+|\/+$/g, "");
  if (!rest) return "overview";

  const parts = rest.split("/");
  const known = ["issues", "boards", "specs", "test-scenarios", "recordings", "fix-sessions", "settings"];

  // Only show the project section header on section index pages.
  // Nested pages, such as /projects/:id/test-scenarios/:scenarioId,
  // should own their full-page detail layout.
  if (parts.length === 1 && known.includes(parts[0])) return parts[0];

  return null;
}

function ProjectHeader() {
  const location = useLocation();
  const { id } = Route.useParams();
  const { project: sidebarProject } = useProjectSidebar();
  const { header } = usePageHeader();

  const projectBase = `/projects/${id}`;
  const sectionKey = getSectionFromPath(location.pathname, projectBase);
  const meta = sectionKey ? SECTION_META[sectionKey] : null;

  // Show header on known top-level section pages (not nested routes like /issues/42)
  if (!meta || !sectionKey) return null;

  const displayTitle = header.title || meta.label;
  const displayDescription = header.description || meta.description;
  const showProjectLabel = sectionKey !== "overview";

  return (
    <div className="flex-none border-b border-gray-100/80 bg-white/80 backdrop-blur-xl z-10">
      <div className="px-4 md:px-8 pt-6 md:pt-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {showProjectLabel && (
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                {sidebarProject?.projectName || "Project"}
              </div>
            )}
            <h1
              className={cn(
                "font-semibold tracking-tight text-gray-900",
                showProjectLabel ? "mt-1 text-2xl md:text-3xl" : "text-2xl md:text-3xl",
              )}
            >
              {displayTitle}
            </h1>
            {displayDescription && (
              <p className="text-sm text-gray-500 mt-1">{displayDescription}</p>
            )}
          </div>
          {header.actions && (
            <div className="shrink-0 pt-1">{header.actions}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectLayoutInner() {
  const location = useLocation();
  const { id } = Route.useParams();
  const { setProject } = useProjectSidebar();

  const { data, isLoading } = useQuery({
    queryKey: ["app-project", id],
    queryFn: () => getAppProject(id),
  });
  const project = data?.data;

  // Set project context for sidebar
  useEffect(() => {
    if (project) {
      setProject({
        projectId: project.id,
        projectName: project.name,
        issueRepoName: project.issueRepoName,
        specsRepoName: project.specsRepoName,
      });
    }
    return () => setProject(null);
  }, [project, setProject]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="p-8">
          <Skeleton className="h-10 w-72" />
        </div>
        <div className="p-8">
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center bg-white p-8">
        <EmptyState
          icon={FolderKanban}
          title="Project not found"
          description="The project may have been deleted."
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <ProjectHeader />
      <div className="min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

function ProjectLayout() {
  return (
    <PageHeaderProvider>
      <ProjectLayoutInner />
    </PageHeaderProvider>
  );
}

export const Route = createFileRoute("/projects/$id")({
  component: ProjectLayout,
});
