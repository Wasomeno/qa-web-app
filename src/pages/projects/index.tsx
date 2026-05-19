import React, { useState } from "react";
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

export function ProjectOverview({ project }: { project: AppProject }) {
  const navigate = useNavigate();

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
      label: "Test Scenarios",
      value: "—",
      icon: ClipboardList,
      href: "test-scenarios",
      color: "text-zinc-700",
      bg: "bg-zinc-100",
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
      color: "text-zinc-700",
      bg: "bg-zinc-100",
    },
  ];

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Project card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-zinc-900 p-1.5 text-white">
                <FolderKanban className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {project.name}
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              {project.description ||
                "Shared QA workspace for tracking issues, test scenarios, and recordings."}
            </p>
          </div>
          <div className="grid min-w-64 gap-1.5 text-xs">
            <div className="flex justify-between gap-4 rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-gray-500">Issues repo</span>
              <span className="font-mono text-gray-800">
                {project.issueRepoName}
              </span>
            </div>
            <div className="flex justify-between gap-4 rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-gray-500">Specs repo</span>
              <span className="font-mono text-gray-800">
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
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-left transition-all hover:border-gray-300 hover:shadow-md cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className={cn("rounded-xl p-2.5", metric.bg)}>
                  <Icon className={cn("h-4 w-4", metric.color)} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">
                {metric.value}
              </p>
              <p className="mt-1 text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                {metric.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Quick links / activity placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Quick actions</h3>
          <div className="mt-4 space-y-2">
            <button
              onClick={() =>
                navigate({
                  to: "/projects/$id" as any,
                  params: { id: project.id } as any,
                  search: { tab: "issues" } as any,
                })
              }
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <GitPullRequest className="h-4 w-4 text-gray-400" />
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
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <Video className="h-4 w-4 text-gray-400" />
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
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <ClipboardList className="h-4 w-4 text-gray-400" />
              View test scenarios
            </button>
            <button
              onClick={() =>
                navigate({
                  to: "/projects/$id" as any,
                  params: { id: project.id } as any,
                  search: { tab: "fix-sessions" } as any,
                })
              }
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <Wrench className="h-4 w-4 text-gray-400" />
              Check fix sessions
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Recent activity</h3>
          <div className="mt-4 space-y-0">
            <div className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 last:border-0">
              <div className="h-2 w-2 rounded-full bg-gray-300 shrink-0" />
              <p className="text-sm text-gray-500">
                Project created{" "}
                <span className="text-gray-400">
                  {formatDate(project.createdAt)}
                </span>
              </p>
            </div>
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
