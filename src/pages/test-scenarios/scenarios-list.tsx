import React, { useState, useMemo, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Search, RefreshCw, Terminal, Trash2, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

import { testScenarioApi } from "@/api/test-scenario";
import { getProjectTestContext, updateProjectTestContext } from "@/api/project";
import { useDebounce } from "@/utils/useDebounce";

import { useLocalStorage } from "@/hooks/use-local-storage";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectSelect } from "@/components/project-select";
import { StyledCheckbox } from "@/components/ui/styled-checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";

const SCENARIOS_PER_PAGE = 10;

export const TestScenariosPage: React.FC<{
  portalContainer?: HTMLElement | null;
  projectId?: string;
  projectName?: string;
  hideHeader?: boolean;
}> = ({ portalContainer, projectId, projectName, hideHeader = false }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [page, setPage] = useState(1);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Track individual deletion states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);

  // Use local project state for this page
  const [selectedProjectId, setSelectedProjectId] = useLocalStorage<
    string | null
  >("test-scenarios-project-id", null);

  const [testContextOpen, setTestContextOpen] = useState(false);
  const [testContextEditing, setTestContextEditing] = useState(false);
  const [testContextEditValue, setTestContextEditValue] = useState("");

  const handleProjectSelect = (
    project: { id: number; name: string } | null,
  ) => {
    if (projectId) return;
    setSelectedProjectId(project?.id.toString() ?? null);
  };

  const activeProjectId = projectId || selectedProjectId;

  const queryClient = useQueryClient();

  const testContextQuery = useQuery({
    queryKey: ["project-test-context", activeProjectId],
    queryFn: () => getProjectTestContext(activeProjectId!),
    enabled: !!activeProjectId && testContextOpen,
  });

  const saveTestContextMutation = useMutation({
    mutationFn: (markdown: string) =>
      updateProjectTestContext(activeProjectId!, markdown),
    onSuccess: () => {
      toast.success("Test context saved");
      setTestContextEditing(false);
      queryClient.invalidateQueries({
        queryKey: ["project-test-context", activeProjectId],
      });
    },
    onError: (error: any) =>
      toast.error(error?.message || "Failed to save test context"),
  });

  const resetToTemplate = () => {
    const template = testContextQuery.data?.data?.template ?? "";
    if (template) {
      setTestContextEditValue(template);
      setTestContextEditing(true);
    }
  };

  const handleSync = async () => {
    if (!activeProjectId) {
      toast.error("Select a project before syncing scenarios");
      return;
    }
    setIsSyncing(true);
    try {
      const result = await testScenarioApi.syncScenarios(activeProjectId);
      await refetch();
      toast.success(`Synced ${result.count} scenario${result.count === 1 ? "" : "s"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sync scenarios");
    } finally {
      setIsSyncing(false);
    }
  };

  const renderSyncScenariosButton = () => (
    <Button
      variant="ghost"
      className="hover:bg-accent border text-foreground rounded-full gap-2 px-4 h-10"
      onClick={(e) => {
        e.stopPropagation();
        handleSync();
      }}
      disabled={isSyncing || !activeProjectId}
      title={
        activeProjectId
          ? "Sync docs/test-scenarios from the project specs repository"
          : "Select a project before syncing scenarios"
      }
    >
      {isSyncing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      Sync from specs
    </Button>
  );

  // Paginated query
  const {
    data,
    refetch,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["test-scenarios", activeProjectId, debouncedSearch, page],
    queryFn: async () => {
      const result = await testScenarioApi.listScenarios(
        activeProjectId ?? undefined,
        debouncedSearch || undefined,
        page,
        SCENARIOS_PER_PAGE,
      );
      return result;
    },
    refetchInterval: 5000, // Poll every 5s for generation status updates
    placeholderData: (prev) => prev, // Keep previous data while fetching next page
  });

  const scenarios = data?.scenarios ?? [];
  const total = data?.total;
  const totalPages = total ? Math.ceil(total / SCENARIOS_PER_PAGE) : 0;

  // Handlers
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);

    try {
      await testScenarioApi.deleteScenario(id, projectId);
      toast.success("Test scenario deleted successfully");
      refetch();
    } catch (e: any) {
      console.error(e);
      const errorMessage = e?.message || "Failed to delete test scenario";
      setDeleteError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);

    try {
      await testScenarioApi.bulkDeleteScenarios(
        Array.from(selectedIds),
        projectId,
      );
      toast.success(
        `${selectedIds.size} test scenario(s) deleted successfully`,
      );
      setSelectedIds(new Set());
      refetch();
    } catch (e: any) {
      console.error("Failed to bulk delete scenarios:", e);
      const errorMessage = e?.message || "Failed to delete test scenarios";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((item) => item.id)));
    }
  };

  const filteredItems = useMemo(() => {
    const items = Array.isArray(scenarios) ? scenarios : [];
    return items.filter((s) => {
      const matchesProject =
        !!projectId ||
        !activeProjectId ||
        s.projectId?.toString() === activeProjectId;
      return matchesProject;
    });
  }, [scenarios, activeProjectId, projectId]);

  const allSelected =
    filteredItems.length > 0 && selectedIds.size === filteredItems.length;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < filteredItems.length;

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header & Filters */}
      <div
        className={cn(
          "flex-none border-b border-border/80 bg-background/80 backdrop-blur-xl z-10",
          hideHeader ? "px-4 py-4 md:px-8" : "px-8 pt-10 pb-6",
        )}
      >
        {!hideHeader && (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Test Scenarios
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                {projectName
                  ? `Review scenarios for ${projectName}`
                  : "Review and manage AI-generated test scenarios"}
              </p>
            </div>
            <div className="shrink-0 pt-1">
              <AnimatePresence mode="wait">
                {selectedIds.size === 0 && (
                  <motion.div
                    key="import-btn"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    {renderSyncScenariosButton()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
        <div className={cn("flex items-center justify-between gap-2", !hideHeader && "mt-5")}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search scenarios..."
                className="pl-9 w-64 h-10 bg-background border-border rounded-xl focus-visible:ring-2 focus-visible:ring-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {!projectId && (
              <ProjectSelect
                value={selectedProjectId}
                onSelect={handleProjectSelect}
                mode="single"
                portalContainer={portalContainer}
                placeholder="All Projects"
                extraOptions={{ allProjects: true }}
              />
            )}
            {activeProjectId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTestContextOpen(true)}
                className="h-10 gap-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                title="View project test context"
              >
                <FileText className="w-3.5 h-3.5" />
                Test Context
              </Button>
            )}
          </div>
          {hideHeader && (
            <div className="shrink-0">
              {renderSyncScenariosButton()}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="px-6 pt-6 min-w-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 w-10"></th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="pb-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Cases</th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Updated</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-3.5 pr-2"><Skeleton className="h-4 w-4 rounded" /></td>
                    <td className="py-3.5 pr-4"><Skeleton className="h-4 w-64" /></td>
                    <td className="py-3.5 pr-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="py-3.5 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                    <td className="py-3.5 pl-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="px-6 pt-6 min-w-0 relative">
            {isFetching && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-border overflow-hidden rounded-full">
                <div className="h-full bg-foreground rounded-full animate-pulse" style={{ width: "30%" }} />
              </div>
            )}
            <div className={cn(isFetching && "opacity-60 transition-opacity duration-200")}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 w-10">
                    <StyledCheckbox
                      checked={allSelected}
                      onChange={() => toggleSelectAll()}
                      size="sm"
                    />
                  </th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="pb-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Cases</th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const procStatus = item.processingStatus ?? 'idle';
                  const autoStatus = item.automationStatus ?? 'not_generated';

                  let pillLabel: string;
                  let pillClasses: string;

                  if (procStatus === 'generating') {
                    pillLabel = 'Generating';
                    pillClasses = 'bg-amber-50 text-amber-700 border-amber-100';
                  } else if (autoStatus === 'running') {
                    pillLabel = 'Running tests';
                    pillClasses = 'bg-blue-50 text-blue-700 border-blue-100';
                  } else if (procStatus === 'generation_failed') {
                    pillLabel = 'Generation failed';
                    pillClasses = 'bg-red-50 text-red-700 border-red-100';
                  } else if (autoStatus === 'failed') {
                    pillLabel = 'Run failed';
                    pillClasses = 'bg-red-50 text-red-700 border-red-100';
                  } else if (autoStatus === 'passed') {
                    pillLabel = 'Passed';
                    pillClasses = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                  } else if (autoStatus === 'partial') {
                    pillLabel = 'Partially automated';
                    pillClasses = 'bg-amber-50 text-amber-700 border-amber-100';
                  } else if (autoStatus === 'idle') {
                    pillLabel = 'Automated';
                    pillClasses = 'bg-muted text-muted-foreground border-muted';
                  } else {
                    pillLabel = 'Not generated';
                    pillClasses = 'bg-muted text-muted-foreground border-muted';
                  }

                  const testCaseCount =
                    (item.automationStats ?? item.stats)?.totalTestCases ??
                    item.sections?.reduce((acc, s) => acc + (s.testCases?.length ?? 0), 0) ??
                    0;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        projectId
                          ? navigate({
                              to: "/projects/$id/test-scenarios/$scenarioId" as any,
                              params: { id: projectId, scenarioId: item.id } as any,
                            })
                          : navigate({
                              to: "/test-scenarios/$id",
                              params: { id: item.id },
                            });
                      }}
                      className="border-b border-border/50 cursor-pointer transition-colors hover:bg-accent/50 group"
                    >
                      <td className="py-2.5 pr-2" onClick={(e) => e.stopPropagation()}>
                        <StyledCheckbox
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          size="sm"
                        />
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="mt-0.5 max-w-lg truncate text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        )}
                        {item.sourceDisplay && (
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <FileText className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.sourceDisplay}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", pillClasses)}>
                          {pillLabel}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {testCaseCount}
                        </span>
                      </td>
                      <td className="py-2.5 pl-4 text-right">
                        <span className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination footer */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between px-1 py-4 border-t border-border/50">
                <div className="text-xs text-muted-foreground">
                  {total ? `${(page - 1) * SCENARIOS_PER_PAGE + 1}–${Math.min(page * SCENARIOS_PER_PAGE, total)} of ${total}` : ""}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || isFetching}
                    className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (page <= 4) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = page - 3 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={cn(
                            "w-7 h-7 text-xs rounded-md transition-colors",
                            pageNum === page
                              ? "bg-foreground text-background font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || isFetching}
                    className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        ) : (
          <EmptyState
            icon={Terminal}
            title="No test scenarios found"
            description="Sync docs/test-scenarios from the selected specs repository."
            className="h-full min-h-[400px]"
          />
        )}
      </div>

      {/* Sticky Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="absolute bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
          >
            <div className="flex items-center gap-3 px-5 py-3 bg-background/80 backdrop-blur-xl border border-border rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] pointer-events-auto">
              <span className="text-sm font-medium text-foreground bg-muted px-3 py-1.5 rounded-full tabular-nums">
                {selectedIds.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                className="h-9 px-4 border-border hover:bg-accent rounded-full text-xs"
              >
                Clear
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="h-9 px-4 bg-red-600 hover:bg-red-700 border-none rounded-full shadow-lg shadow-red-600/20 text-xs"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span className="ml-1.5">Delete</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Context Dialog */}
      <Dialog open={testContextOpen} onOpenChange={setTestContextOpen}>
        <DialogContent className="max-w-2xl h-[520px] flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4 pr-8">
              <div>
                <DialogTitle>Project Test Context</DialogTitle>
                <DialogDescription>
                  Project-level knowledge base used when generating API and E2E
                  automation tests.
                </DialogDescription>
              </div>
              <div className="flex shrink-0 gap-2 pt-1">
                {!testContextEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTestContextEditValue(
                        testContextQuery.data?.data?.markdown ?? "",
                      );
                      setTestContextEditing(true);
                    }}
                  >
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetToTemplate}
                    >
                      Reset to template
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTestContextEditing(false);
                        setTestContextEditValue("");
                      }}
                      disabled={saveTestContextMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-foreground text-background hover:bg-foreground/90"
                      onClick={() =>
                        saveTestContextMutation.mutate(testContextEditValue)
                      }
                      disabled={saveTestContextMutation.isPending}
                    >
                      {saveTestContextMutation.isPending ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : null}
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 flex flex-col min-h-0">
            {testContextQuery.isLoading ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Textarea
                value={
                  testContextEditing
                    ? testContextEditValue
                    : (testContextQuery.data?.data?.markdown ?? "")
                }
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setTestContextEditValue(e.target.value);
                  if (!testContextEditing) setTestContextEditing(true);
                }}
                readOnly={!testContextEditing}
                placeholder="No test context configured yet."
                className={cn(
                  "flex-1 resize-y font-mono text-xs leading-5 min-h-0",
                  !testContextEditing && "cursor-default opacity-80",
                )}
              />
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3 mt-3">
            <span>
              {testContextQuery.data?.data?.markdown
                ? "Markdown"
                : "Empty"}
            </span>
            <span>
              {new TextEncoder().encode(
                testContextEditing
                  ? testContextEditValue
                  : (testContextQuery.data?.data?.markdown ?? ""),
              ).length}{" "}
              / {testContextQuery.data?.data?.maxBytes ?? 204800} bytes
            </span>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};
