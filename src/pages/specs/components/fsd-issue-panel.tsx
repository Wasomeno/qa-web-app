import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileType,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateFSDIssues,
  usePreviewFSDIssues,
} from "@/hooks/use-fsd-issues";
import { cn } from "@/lib/utils";
import type {
  CreateFSDIssueResult,
  FSDIssueDraft,
} from "@/api/fsd-issues";

interface FSDIssuePanelProps {
  projectId: string | number | undefined;
  selectedPaths: string[];
  branch: string;
  previewRequestId: number;
  onClearSelection: () => void;
  onCreateSuccess?: () => void;
  className?: string;
}

type DraftValidation = Record<number, { title?: string; description?: string }>;

function getResponseError(response: { success: boolean; error?: string }) {
  return response.error || "Request failed";
}

function normalizeDrafts(drafts: FSDIssueDraft[]) {
  return drafts.map((draft) => ({
    ...draft,
    labels: Array.from(
      new Set((draft.labels ?? []).map((label) => label.trim()).filter(Boolean)),
    ),
  }));
}

export function FSDIssuePanel({
  projectId,
  selectedPaths,
  branch,
  previewRequestId,
  onClearSelection,
  onCreateSuccess,
  className,
}: FSDIssuePanelProps) {
  const previewMutation = usePreviewFSDIssues(projectId);
  const createMutation = useCreateFSDIssues(projectId);
  const [drafts, setDrafts] = useState<FSDIssueDraft[]>([]);
  const [results, setResults] = useState<CreateFSDIssueResult[] | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [labelInputs, setLabelInputs] = useState<Record<number, string>>({});

  const selectedCount = selectedPaths.length;
  const hasDrafts = drafts.length > 0;
  const isPreviewing = previewMutation.isPending;
  const isCreating = createMutation.isPending;
  const createdCount = results?.filter((result) => result.status === "success").length ?? 0;
  const failedCount = results?.filter((result) => result.status === "failed").length ?? 0;

  const validation = useMemo<DraftValidation>(() => {
    return drafts.reduce<DraftValidation>((acc, draft, index) => {
      const title = draft.title.trim() ? undefined : "Title is required";
      const description = draft.description.trim()
        ? undefined
        : "Description is required";
      if (title || description) {
        acc[index] = { title, description };
      }
      return acc;
    }, {});
  }, [drafts]);
  const hasValidationErrors = Object.keys(validation).length > 0;

  const previewDrafts = async () => {
    if (!projectId || selectedPaths.length === 0 || isPreviewing) return;
    setPreviewError(null);
    setCreateError(null);
    setResults(null);
    const response = await previewMutation.mutateAsync({
      fsds: selectedPaths.map((path) => ({ path, ref: branch })),
    });

    if (!response.success || !response.data) {
      const error = getResponseError(response);
      setPreviewError(error);
      toast.error("Failed to generate issue drafts", { description: error });
      return;
    }

    setDrafts(normalizeDrafts(response.data.issues));
    toast.success(
      response.data.previewCount === 1
        ? "Generated 1 issue draft"
        : `Generated ${response.data.previewCount} issue drafts`,
    );
  };

  useEffect(() => {
    if (previewRequestId > 0) {
      const timer = window.setTimeout(() => {
        void previewDrafts();
      }, 0);
      return () => window.clearTimeout(timer);
    }
    // previewDrafts intentionally reads current selectedPaths/branch at trigger time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewRequestId]);

  const updateDraft = (
    index: number,
    patch: Partial<Pick<FSDIssueDraft, "title" | "description" | "labels">>,
  ) => {
    setDrafts((prev) =>
      prev.map((draft, i) => (i === index ? { ...draft, ...patch } : draft)),
    );
    setResults(null);
    setCreateError(null);
  };

  const removeDraft = (index: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
    setLabelInputs((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const numericKey = Number(key);
        if (numericKey < index) next[numericKey] = value;
        if (numericKey > index) next[numericKey - 1] = value;
      });
      return next;
    });
    setResults(null);
  };

  const addLabel = (index: number) => {
    const raw = labelInputs[index]?.trim();
    if (!raw) return;
    const additions = raw
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean);
    if (additions.length === 0) return;

    const labels = Array.from(new Set([...drafts[index].labels, ...additions]));
    updateDraft(index, { labels });
    setLabelInputs((prev) => ({ ...prev, [index]: "" }));
  };

  const removeLabel = (index: number, label: string) => {
    updateDraft(index, {
      labels: drafts[index].labels.filter((item) => item !== label),
    });
  };

  const createIssues = async () => {
    if (!projectId || drafts.length === 0 || hasValidationErrors || isCreating) return;
    setCreateError(null);
    const response = await createMutation.mutateAsync({ issues: drafts });
    if (!response.success || !response.data) {
      const error = getResponseError(response);
      setCreateError(error);
      toast.error("Failed to create issues", { description: error });
      return;
    }

    setResults(response.data.results);
    if (response.data.failedCount > 0) {
      toast.error(
        `Created ${response.data.createdCount}, failed ${response.data.failedCount}`,
      );
    } else {
      toast.success(
        response.data.createdCount === 1
          ? "Created 1 GitLab issue"
          : `Created ${response.data.createdCount} GitLab issues`,
      );
      setDrafts([]);
      setResults(null);
      setPreviewError(null);
      setCreateError(null);
      setLabelInputs({});
      onClearSelection();
      onCreateSuccess?.();
    }
  };

  const retryFailed = () => {
    if (!results) return;
    const failedSources = new Set(
      results
        .filter((result) => result.status === "failed")
        .map((result) => result.sourcePath),
    );
    setDrafts((prev) =>
      prev.filter((draft) => failedSources.has(draft.sourcePath)),
    );
    setResults(null);
    setCreateError(null);
  };

  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      <div className="border-b border-border/40 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                Issue Drafts
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Generate editable GitLab issues from selected FSDs.
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 rounded-md py-1">
            {selectedCount} selected
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <section className="border-b border-border/40 px-4 py-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-foreground/80">
              Source FSDs
            </span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {branch}
            </span>
          </div>
          {selectedPaths.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/60 px-3 py-4 text-center text-xs text-muted-foreground">
              Select markdown FSD files from the tree.
            </p>
          ) : (
            <div className="space-y-1.5">
              {selectedPaths.map((path) => (
                <div
                  key={path}
                  className="flex min-w-0 items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-2.5 py-2"
                >
                  <FileType className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 truncate font-mono text-[11px] text-foreground/75">
                    {path}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              onClick={previewDrafts}
              disabled={!selectedCount || isPreviewing || isCreating}
              className="h-8"
            >
              {isPreviewing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : hasDrafts ? (
                <RefreshCw className="h-3.5 w-3.5" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {hasDrafts ? "Regenerate" : "Preview drafts"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              disabled={isPreviewing || isCreating || selectedCount === 0}
              className="h-8 text-muted-foreground"
            >
              Clear
            </Button>
          </div>
          {previewError && (
            <InlineError className="mt-3" message={previewError} />
          )}
        </section>

        <section className="px-4 py-3">
          {isPreviewing ? (
            <DraftSkeleton />
          ) : drafts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 px-3 py-8 text-center">
              <Sparkles className="mx-auto h-5 w-5 text-muted-foreground/40" />
              <p className="mt-2 text-sm font-medium text-foreground/75">
                No drafts yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Preview generates one editable issue per selected FSD.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft, index) => (
                <DraftEditor
                  key={`${draft.sourcePath}-${index}`}
                  draft={draft}
                  index={index}
                  validation={validation[index]}
                  labelInput={labelInputs[index] ?? ""}
                  onLabelInputChange={(value) =>
                    setLabelInputs((prev) => ({ ...prev, [index]: value }))
                  }
                  onUpdate={updateDraft}
                  onRemove={removeDraft}
                  onAddLabel={addLabel}
                  onRemoveLabel={removeLabel}
                  disabled={isCreating}
                />
              ))}
            </div>
          )}
        </section>

        {(results || createError) && (
          <section className="border-t border-border/40 px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground/80">
                Creation results
              </span>
              {results && (
                <span className="text-[11px] text-muted-foreground">
                  {createdCount} created, {failedCount} failed
                </span>
              )}
            </div>
            {createError && <InlineError message={createError} />}
            {results && (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <ResultRow key={`${result.sourcePath}-${index}`} result={result} />
                ))}
              </div>
            )}
            {failedCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={retryFailed}
                className="mt-3 h-8"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry failed drafts
              </Button>
            )}
          </section>
        )}
      </div>

      <div className="border-t border-border/40 bg-muted/10 px-4 py-3">
        <Button
          className="h-9 w-full"
          onClick={createIssues}
          disabled={
            drafts.length === 0 || hasValidationErrors || isPreviewing || isCreating
          }
        >
          {isCreating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          {drafts.length === 1 ? "Create issue" : `Create ${drafts.length} issues`}
        </Button>
        {hasValidationErrors && drafts.length > 0 && (
          <p className="mt-2 text-center text-[11px] text-destructive">
            Resolve missing titles or descriptions before creating issues.
          </p>
        )}
      </div>
    </div>
  );
}

function DraftEditor({
  draft,
  index,
  validation,
  labelInput,
  onLabelInputChange,
  onUpdate,
  onRemove,
  onAddLabel,
  onRemoveLabel,
  disabled,
}: {
  draft: FSDIssueDraft;
  index: number;
  validation?: { title?: string; description?: string };
  labelInput: string;
  onLabelInputChange: (value: string) => void;
  onUpdate: (
    index: number,
    patch: Partial<Pick<FSDIssueDraft, "title" | "description" | "labels">>,
  ) => void;
  onRemove: (index: number) => void;
  onAddLabel: (index: number) => void;
  onRemoveLabel: (index: number, label: string) => void;
  disabled?: boolean;
}) {
  return (
    <article className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border/50 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {draft.sourcePath}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          disabled={disabled}
          className="h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-destructive"
          title="Remove draft"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-3 p-3">
        <div>
          <Input
            value={draft.title}
            onChange={(event) => onUpdate(index, { title: event.target.value })}
            disabled={disabled}
            className={cn(
              "h-9 text-sm font-medium",
              validation?.title && "border-destructive focus:ring-destructive/20",
            )}
            placeholder="Issue title"
          />
          {validation?.title && (
            <p className="mt-1 text-[11px] text-destructive">
              {validation.title}
            </p>
          )}
        </div>
        <div>
          <Textarea
            value={draft.description}
            onChange={(event) =>
              onUpdate(index, { description: event.target.value })
            }
            disabled={disabled}
            className={cn(
              "min-h-[180px] resize-y font-mono text-xs leading-relaxed",
              validation?.description &&
                "border-destructive focus:ring-destructive/20",
            )}
            placeholder="GitLab markdown description"
          />
          {validation?.description && (
            <p className="mt-1 text-[11px] text-destructive">
              {validation.description}
            </p>
          )}
        </div>
        <div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {draft.labels.length === 0 ? (
              <span className="text-[11px] text-muted-foreground">
                No labels
              </span>
            ) : (
              draft.labels.map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="gap-1 rounded-md py-1 pr-1 text-[11px]"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => onRemoveLabel(index, label)}
                    disabled={disabled}
                    className="rounded-sm p-0.5 text-muted-foreground hover:bg-background/60 hover:text-foreground disabled:pointer-events-none"
                    aria-label={`Remove ${label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={labelInput}
              onChange={(event) => onLabelInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onAddLabel(index);
                }
              }}
              disabled={disabled}
              placeholder="Add labels"
              className="h-8 text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddLabel(index)}
              disabled={disabled || !labelInput.trim()}
              className="h-8 px-2"
              title="Add label"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ResultRow({ result }: { result: CreateFSDIssueResult }) {
  const isSuccess = result.status === "success";
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        isSuccess
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-destructive/20 bg-destructive/5",
      )}
    >
      <div className="flex items-start gap-2">
        {isSuccess ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        ) : (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">
            {result.issue?.iid ? `#${result.issue.iid} ` : ""}
            {result.title}
          </p>
          {result.sourcePath && (
            <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
              {result.sourcePath}
            </p>
          )}
          {result.error && (
            <p className="mt-1 text-[11px] text-destructive">{result.error}</p>
          )}
        </div>
        {result.issue?.web_url && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 w-7 shrink-0 p-0"
            title="Open issue"
          >
            <a
              href={result.issue.web_url}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

function InlineError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function DraftSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1].map((item) => (
        <div key={item} className="rounded-lg border border-border bg-card p-3">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="mt-3 h-9 w-full" />
          <Skeleton className="mt-3 h-28 w-full" />
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-6 w-14 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
