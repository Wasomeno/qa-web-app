import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  FolderKanban,
  GitPullRequest,
  Info,
  Loader2,
  Plus,
  SquareKanban,
  Trash2,
  Video,
  Wrench,
  CheckCircle as CheckCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  createAppProject,
  deleteAppProject,
  getAppProject,
  getAppProjectActivity,
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

const DEFAULT_TEST_CONTEXT_TEMPLATE = `# Project Test Context

## Test Users
- Admin user:
  - email:
  - password:
  - role: admin
- Regular user:
  - email:
  - password:
  - role: user

## Authentication
- Login endpoint:
- Token/header format:

## Common Fixtures
- Existing entities that tests can rely on:
- How to create required data:

## Business Rules
- Important permissions, validations, and workflow rules:

## API Notes
- Base URL:
- Relevant endpoints and request/response details:

## E2E Selectors and UI Notes
- Stable selectors, labels, routes, and UI behavior:

## Known Edge Cases
- Cases the automation generator should explicitly cover:
`;

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
  const [testContextMarkdown, setTestContextMarkdown] = useState("");
  const [showTestContext, setShowTestContext] = useState(false);

  const createMutation = useMutation({
    mutationFn: () =>
      createAppProject({
        name: name.trim(),
        description: description.trim(),
        testContextMarkdown: testContextMarkdown.trim() || undefined,
        issueRepoId: issueRepo!.id,
        specsRepoId: specsRepo!.id,
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["app-projects"] });
      const data = response.data;
      const created = data?.project;
      toast.success("Project created");
      onOpenChange(false);
      setName("");
      setDescription("");
      setIssueRepo(null);
      setSpecsRepo(null);
      setTestContextMarkdown("");
      setShowTestContext(false);
      if (created?.id) {
        navigate({
          to: "/projects/$id",
          params: { id: created.id },
          search: data?.scenarioSyncStarted
            ? { scenarioSync: "started" }
            : undefined,
        });
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
              <p className="text-xs text-muted-foreground">
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
              <p className="text-xs text-muted-foreground">
                Specs, code context, and generated automation use this
                repository.
              </p>
            </div>
          </div>

          {/* Test Context (collapsible) */}
          <div className="rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setShowTestContext(!showTestContext)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-foreground/80 hover:bg-accent transition-colors rounded-xl"
            >
              {showTestContext ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <Info className="h-4 w-4 text-muted-foreground" />
              Test Context
              {testContextMarkdown.trim() ? (
                <span className="ml-auto text-xs text-emerald-600 font-normal">
                  Configured
                </span>
              ) : (
                <span className="ml-auto text-xs text-muted-foreground font-normal">
                  Optional
                </span>
              )}
            </button>
            {showTestContext && (
              <div className="border-t border-border px-4 pb-4 pt-3">
                <p className="mb-2 text-xs leading-5 text-muted-foreground">
                  Provide project-level context for AI test scenario generation:
                  test users, auth, fixtures, business rules, API details, UI
                  selectors, and known edge cases. If left empty, a default
                  template will be used.
                </p>
                <Textarea
                  value={testContextMarkdown}
                  onChange={(e) => setTestContextMarkdown(e.target.value)}
                  placeholder={DEFAULT_TEST_CONTEXT_TEMPLATE}
                  className="min-h-48 resize-y font-mono text-xs leading-5"
                />
                <div className="mt-1 text-right text-xs text-muted-foreground">
                  {new TextEncoder().encode(testContextMarkdown).length} / 204800 bytes
                </div>
              </div>
            )}
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
            className="bg-foreground text-background hover:bg-foreground/90"
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
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="border-b border-border/80 bg-background/85 px-4 pb-6 pt-6 backdrop-blur-xl md:px-8 md:pt-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Workspace
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Projects
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Shared QA workspaces for GitLab issues, specs, scenarios,
              recordings, and fix sessions.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2 self-start md:self-auto bg-foreground text-background hover:bg-foreground/90"
          >
            <Plus className="h-4 w-4" />
            Create project
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        {isLoading ? (
          <div className="min-w-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Issues Repo</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Specs Repo</th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Updated</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-4 pr-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="py-4 pr-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-4 pr-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-4 pl-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  Create project
                </Button>
              }
            />
          </div>
        ) : (
          <div className="min-w-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Issues Repo</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Specs Repo</th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Updated</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() =>
                      navigate({
                        to: "/projects/$id" as any,
                        params: { id: project.id } as any,
                      })
                    }
                    className="border-b border-border/50 cursor-pointer transition-colors hover:bg-accent/50 group"
                  >
                    <td className="py-4 pr-4">
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </div>
                      <div className="mt-0.5 max-w-md truncate text-sm text-muted-foreground">
                        {project.description || "No description yet."}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-muted-foreground">{project.issueRepoName}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-muted-foreground">{project.specsRepoName}</span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <span className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateProjectDialog open={isCreateOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

export function ProjectOverview({ project, scenarioSync }: { project: AppProject; scenarioSync?: 'started' }) {
  const navigate = useNavigate();
  const { data: activityData } = useQuery({
    queryKey: ["app-project-activity", project.id],
    queryFn: () => getAppProjectActivity(project.id),
    enabled: !!project.id,
  });

  const metrics = [
    {
      label: "Open Issues",
      value: "—",
      icon: GitPullRequest,
      href: "issues",
      color: "text-zinc-700",
      bg: "bg-zinc-100",
    },
    {
      label: "Boards",
      value: "—",
      icon: SquareKanban,
      href: "boards",
      color: "text-zinc-700",
      bg: "bg-zinc-100",
    },
    {
      label: scenarioSync === 'started' ? "Syncing scenarios…" : "Test Scenarios",
      value: scenarioSync === 'started' ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          <span className="text-lg font-normal text-muted-foreground">—</span>
        </span>
      ) : (
        "—"
      ),
      icon: scenarioSync === 'started' ? Loader2 : ClipboardList,
      href: "test-scenarios",
      color: scenarioSync === 'started' ? "text-amber-600" : "text-zinc-700",
      bg: scenarioSync === 'started' ? "bg-amber-100" : "bg-zinc-100",
    },
    {
      label: "Recordings",
      value: "—",
      icon: Video,
      href: "recordings",
      color: "text-zinc-700",
      bg: "bg-zinc-100",
    },
    {
      label: "Fix Sessions",
      value: "—",
      icon: Wrench,
      href: "fix-sessions",
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Project card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-foreground p-1.5 text-background">
                <FolderKanban className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {project.name}
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {project.description ||
                "Shared QA workspace for tracking issues, test scenarios, and recordings."}
            </p>
            <div className="mt-3 flex items-center gap-2">
              {project.testContextMarkdown ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  Test context configured
                </span>
              ) : (
                <button
                  onClick={() =>
                    navigate({
                      to: "/projects/$id" as any,
                      params: { id: project.id } as any,
                      search: { tab: "settings" } as any,
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border hover:text-foreground hover:ring-border transition-colors"
                >
                  No test context — add in Settings
                </button>
              )}
            </div>
          </div>
          <div className="grid min-w-64 gap-1.5 text-xs">
            <div className="flex justify-between gap-4 rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Issues repo</span>
              <span className="font-mono text-foreground/80">
                {project.issueRepoName}
              </span>
            </div>
            <div className="flex justify-between gap-4 rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Specs repo</span>
              <span className="font-mono text-foreground/80">
                {project.specsRepoName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <button
              key={metric.href}
              onClick={() =>
                navigate({
                  to: "/projects/$id" as any,
                  params: { id: project.id } as any,
                  search: { tab: metric.href } as any,
                })
              }
              className="rounded-2xl border border-border bg-card p-5 shadow-sm text-left transition-all hover:border-border hover:shadow-md cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className={cn("rounded-xl p-2.5", metric.bg)}>
                  <Icon className={cn("h-4 w-4", metric.color)} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                {metric.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {metric.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Quick links / activity placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Quick actions</h3>
          <div className="mt-4 space-y-2">
            <button
              onClick={() =>
                navigate({
                  to: "/projects/$id" as any,
                  params: { id: project.id } as any,
                  search: { tab: "issues" } as any,
                })
              }
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <GitPullRequest className="h-4 w-4 text-muted-foreground" />
              Browse open issues
            </button>
            <button
              onClick={() =>
                navigate({
                  to: "/projects/$id" as any,
                  params: { id: project.id } as any,
                  search: { tab: "recordings" } as any,
                })
              }
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Video className="h-4 w-4 text-muted-foreground" />
              Review recent recordings
            </button>
            <button
              onClick={() =>
                navigate({
                  to: "/projects/$id" as any,
                  params: { id: project.id } as any,
                  search: { tab: "test-scenarios" } as any,
                })
              }
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {scenarioSync === 'started' ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              ) : (
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              )}
              View test scenarios
              {scenarioSync === 'started' && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Syncing…
                </span>
              )}
            </button>
            <button
              onClick={() =>
                navigate({
                  to: "/projects/$id" as any,
                  params: { id: project.id } as any,
                  search: { tab: "fix-sessions" } as any,
                })
              }
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Wrench className="h-4 w-4 text-muted-foreground" />
              Check fix sessions
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
          <div className="mt-4 space-y-0">
            {activityData?.data?.activity && activityData.data.activity.length > 0 ? (
              activityData.data.activity.slice(0, 5).map((a) => {
                let icon: React.ReactNode;
                let colorClass: string;
                let label: string;

                switch (a.action) {
                  case 'scenario_sync_started':
                    icon = <Loader2 className="h-3 w-3 animate-spin" />;
                    colorClass = 'bg-amber-500';
                    label = 'Scenario import started';
                    break;
                  case 'scenario_sync_completed': {
                    const count = a.changes?.importedCount?.new;
                    label = count
                      ? `Scenario import completed (${count} imported)`
                      : 'Scenario import completed';
                    icon = <CheckCircle className="h-3 w-3" />;
                    colorClass = 'bg-emerald-500';
                    break;
                  }
                  case 'scenario_sync_failed': {
                    const err = String(a.changes?.error?.new ?? '');
                    label = err
                      ? `Scenario import failed: ${err.slice(0, 80)}${err.length > 80 ? '...' : ''}`
                      : 'Scenario import failed';
                    icon = <AlertTriangle className="h-3 w-3" />;
                    colorClass = 'bg-red-500';
                    break;
                  }
                  case 'created':
                    icon = <FolderKanban className="h-3 w-3" />;
                    colorClass = 'bg-sky-500';
                    label = `Project created`;
                    break;
                  default:
                    icon = <div className="h-3 w-3" />;
                    colorClass = 'bg-muted';
                    label = a.action;
                }

                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0"
                  >
                    <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", colorClass)}>
                      <span className="text-white">{icon}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {label}
                    </p>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground/60">
                      {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0">
                <div className="h-2 w-2 rounded-full bg-muted shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Project created{" "}
                  <span className="text-muted-foreground">
                    {formatDate(project.createdAt)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectSettings({ project }: { project: AppProject }) {
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
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Project details</h2>
        <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Name
            </dt>
            <dd className="mt-1 text-foreground">{project.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Created
            </dt>
            <dd className="mt-1 text-foreground">
              {formatDate(project.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Issues repo
            </dt>
            <dd className="mt-1 font-mono text-foreground">
              {project.issueRepoName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Specs repo
            </dt>
            <dd className="mt-1 font-mono text-foreground">
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
                className="max-w-md border-red-200 bg-card"
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
