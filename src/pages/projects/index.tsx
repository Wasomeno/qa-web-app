import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  FileText,
  FolderKanban,
  GitBranch,
  GitPullRequest,
  Loader2,
  Plus,
  SquareKanban,
  Trash2,
  Video,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import {
  createAppProject,
  deleteAppProject,
  getAppProject,
  listAppProjects,
} from "@/api/project";
import { AppProject, GitLabProject } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectSelect } from "@/components/project-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { IssuesPage } from "@/pages/issues";
import { BoardsPage } from "@/pages/boards";
import { TestScenariosPage } from "@/pages/test-scenarios";
import { RecordingsPage } from "@/pages/recordings";
import { FixSessionsListPage } from "@/pages/agent/fix-sessions-list";
import { SpecsPage } from "@/pages/specs/specs-page";

const tabs = [
  { id: "overview", label: "Overview", icon: FolderKanban },
  { id: "issues", label: "Issues", icon: GitPullRequest },
  { id: "boards", label: "Boards", icon: SquareKanban },
  { id: "specs", label: "Specs", icon: FileText },
  {
    id: "test-scenarios",
    label: "Test Scenarios",
    icon: ClipboardList,
  },
  { id: "recordings", label: "Recordings", icon: Video },
  {
    id: "fix-sessions",
    label: "Fix Sessions",
    icon: Wrench,
  },
  { id: "settings", label: "Settings", icon: GitBranch },
] as const;

type ProjectTab = (typeof tabs)[number]["id"];

function formatDate(value?: string) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CreateProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [issueRepo, setIssueRepo] = useState<GitLabProject | null>(null);
  const [specsRepo, setSpecsRepo] = useState<GitLabProject | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      createAppProject({
        name: name.trim(),
        description: description.trim(),
        issueRepoId: issueRepo!.id,
        specsRepoId: specsRepo!.id,
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["app-projects"] });
      const created = response.data;
      toast.success("Project created");
      onOpenChange(false);
      setName("");
      setDescription("");
      setIssueRepo(null);
      setSpecsRepo(null);
      if (created?.id) {
        navigate({ to: "/projects/$id", params: { id: created.id } });
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create project");
    },
  });

  const canSubmit =
    name.trim() && issueRepo && specsRepo && !createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Group issues, boards, specs, scenarios, recordings, and fix sessions
            under one shared workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-2">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Release QA workspace"
              className="h-10"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this project cover?"
              className="min-h-24 resize-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2 min-w-0">
              <Label>Issues and boards repository</Label>
              <ProjectSelect
                value={issueRepo?.id ?? null}
                projectDetails={issueRepo}
                onSelect={(project) => setIssueRepo(project)}
                placeholder="Select GitLab repo"
              />
              <p className="text-xs text-gray-500">
                GitLab issues and issue boards will come from this repository.
              </p>
            </div>
            <div className="grid gap-2 min-w-0">
              <Label>Specs repository</Label>
              <ProjectSelect
                value={specsRepo?.id ?? null}
                projectDetails={specsRepo}
                onSelect={(project) => setSpecsRepo(project)}
                placeholder="Select GitLab repo"
              />
              <p className="text-xs text-gray-500">
                Specs, code context, and generated automation use this
                repository.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!canSubmit}
            className="bg-zinc-900 text-white hover:bg-zinc-800"
          >
            {createMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["app-projects"],
    queryFn: listAppProjects,
  });
  const projects = data?.data?.projects ?? [];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="border-b border-gray-100/80 bg-white/85 px-4 pb-6 pt-6 backdrop-blur-xl md:px-8 md:pt-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
              Workspace
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
              Projects
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Shared QA workspaces for GitLab issues, specs, scenarios,
              recordings, and fix sessions.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2 self-start md:self-auto bg-zinc-900 text-white hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" />
            Create project
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="mx-auto max-w-xl pt-16">
            <EmptyState
              icon={FolderKanban}
              title="Create your first project"
              description="Projects are public workspaces. Pick one GitLab repo for issues and boards, then one for specs."
              action={
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="bg-zinc-900 text-white hover:bg-zinc-800"
                >
                  Create project
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() =>
                  navigate({
                    to: "/projects/$id" as any,
                    params: { id: project.id } as any,
                  })
                }
                className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50/40 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 cursor-pointer text-left w-full"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-gray-900">
                      {project.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
                      {project.description || "No description yet."}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
                </div>

                <div className="mt-5 grid gap-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                    <span>Issues repo</span>
                    <span className="font-mono text-gray-700">
                      {project.issueRepoName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                    <span>Specs repo</span>
                    <span className="font-mono text-gray-700">
                      {project.specsRepoName}
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-400">
                  Updated {formatDate(project.updatedAt)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog open={isCreateOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function ProjectOverview({ project }: { project: AppProject }) {
  const navigate = useNavigate();
  const modules = [
    {
      label: "Issues",
      path: "issues",
      icon: GitPullRequest,
      text: "Triage bugs and feature requests from the configured GitLab repository.",
    },
    {
      label: "Boards",
      path: "boards",
      icon: SquareKanban,
      text: "Move issues across board columns and workflow labels.",
    },
    {
      label: "Specs",
      path: "specs",
      icon: FileText,
      text: "Browse and edit specs in the configured specs repository.",
    },
    {
      label: "Test Scenarios",
      path: "test-scenarios",
      icon: ClipboardList,
      text: "Sync Markdown scenarios from specs and choose automation per test case.",
    },
    {
      label: "Recordings",
      path: "recordings",
      icon: Video,
      text: "Review browser recordings and saved blueprints.",
    },
    {
      label: "Fix Sessions",
      path: "fix-sessions",
      icon: Wrench,
      text: "Track AI-assisted fixes for project issues.",
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900">
              {project.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {project.description ||
                "Add a description in settings to help teammates understand this workspace."}
            </p>
          </div>
          <div className="grid min-w-72 gap-2 text-sm">
            <div className="rounded-xl bg-gray-50 px-3 py-2">
              <span className="text-gray-500">Issues repo</span>
              <p className="mt-0.5 font-mono text-gray-800 break-words">
                {project.issueRepoName}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 px-3 py-2">
              <span className="text-gray-500">Specs repo</span>
              <p className="mt-0.5 font-mono text-gray-800 break-words">
                {project.specsRepoName}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <button
              key={module.path}
              onClick={() =>
                navigate({
                  to: "/projects/$id" as any,
                  params: { id: project.id } as any,
                  search: { tab: module.path } as any,
                })
              }
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-left transition-colors hover:border-gray-300 hover:bg-gray-50/40 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-zinc-100 p-2 text-zinc-700">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {module.label}
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    {module.text}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProjectSettings({ project }: { project: AppProject }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState("");

  const deleteMutation = useMutation({
    mutationFn: () => deleteAppProject(project.id),
    onSuccess: () => {
      toast.success("Project deleted");
      queryClient.invalidateQueries({ queryKey: ["app-projects"] });
      navigate({ to: "/projects" });
    },
    onError: (error: any) =>
      toast.error(error?.message || "Failed to delete project"),
  });

  return (
    <div className="max-w-3xl space-y-6 p-4 md:p-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Project details</h2>
        <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Name
            </dt>
            <dd className="mt-1 text-gray-900">{project.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Created
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(project.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Issues repo
            </dt>
            <dd className="mt-1 font-mono text-gray-900">
              {project.issueRepoName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Specs repo
            </dt>
            <dd className="mt-1 font-mono text-gray-900">
              {project.specsRepoName}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50/60 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-red-100 p-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-red-950">
              Delete project
            </h2>
            <p className="mt-2 text-sm leading-6 text-red-800">
              This permanently deletes the project and child data stored under
              it: test scenarios, recordings, and fix sessions. GitLab issues,
              boards, and specs repositories are not deleted.
            </p>
            <div className="mt-4 grid gap-2">
              <Label htmlFor="delete-confirm" className="text-red-950">
                Type {project.name} to confirm
              </Label>
              <Input
                id="delete-confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="max-w-md border-red-200 bg-white"
              />
            </div>
            <Button
              variant="destructive"
              className="mt-4 gap-2"
              disabled={confirm !== project.name || deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectDetailPage({
  projectId,
  activeTab,
  nestedContent,
}: {
  projectId: string;
  activeTab: ProjectTab;
  nestedContent?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["app-project", projectId],
    queryFn: () => getAppProject(projectId),
  });
  const project = data?.data;

  const currentTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTab) ?? tabs[0],
    [activeTab],
  );

  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="border-b bg-white px-8 py-8">
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

  const renderContent = () => {
    switch (currentTab.id) {
      case "issues":
        return (
          <IssuesPage
            appProjectId={project.id}
            hideHeader
          />
        );
      case "boards":
        return (
          <BoardsPage
            projectId={project.id}
            hideHeader
            onNavigateToIssue={(issue) =>
              navigate({
                to: "/projects/$id/issues/$iid",
                params: { id: project.id, iid: String(issue.iid) },
              })
            }
          />
        );
      case "specs":
        return (
          <SpecsPage
            projectId={project.id}
            branchProjectId={project.specsRepoName}
            projectName={project.name}
          />
        );
      case "test-scenarios":
        return (
          <TestScenariosPage
            projectId={project.id}
            projectName={project.name}
            hideHeader
          />
        );
      case "recordings":
        return (
          <RecordingsPage
            projectId={project.id}
            projectName={project.name}
            hideHeader
          />
        );
      case "fix-sessions":
        return <FixSessionsListPage projectId={project.id} hideHeader />;
      case "settings":
        return <ProjectSettings project={project} />;
      default:
        return <ProjectOverview project={project} />;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="border-b border-gray-100/80 bg-white/85 px-4 pt-6 backdrop-blur-xl md:px-8 md:pt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <Link
              to="/projects"
              className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400 hover:text-gray-600"
            >
              Projects
            </Link>
            <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
              {project.name}
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-gray-500">
              {project.description || "Shared QA workspace"}
            </p>
          </div>
          <div className="grid gap-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 md:min-w-64">
            <div className="flex justify-between gap-4">
              <span>Issues repo</span>
              <span className="font-mono text-gray-800">
                {project.issueRepoName}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Specs repo</span>
              <span className="font-mono text-gray-800">
                {project.specsRepoName}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-1 overflow-x-auto pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === currentTab.id;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  navigate({
                    to: "/projects/$id" as any,
                    params: { id: project.id } as any,
                    search: { tab: tab.id } as any,
                  })
                }
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {nestedContent ?? renderContent()}
      </div>
    </div>
  );
}
