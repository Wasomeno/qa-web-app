import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, Terminal, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { testScenarioApi } from "@/api/test-scenario";

import { useNavigation } from "@/contexts/navigation-context";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectSelect } from "@/components/project-select";
import {
  StyledCheckbox,
  SelectAllCheckbox,
} from "@/components/ui/styled-checkbox";

import { SearchablePicker } from "../issues/components/searchable-picker";
import { ScenarioItem } from "./components/scenario-item";

const ScenarioSkeleton = () => (
  <div className="flex flex-col border border-zinc-100 rounded-xl overflow-hidden bg-white h-full">
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  </div>
);

export const TestScenariosPage: React.FC<{
  portalContainer?: HTMLElement | null;
  projectId?: string;
  projectName?: string;
  hideHeader?: boolean;
}> = ({ portalContainer, projectId, projectName, hideHeader = false }) => {
  const navigate = useNavigate();
  const { push } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleProjectSelect = (
    project: { id: number; name: string } | null,
  ) => {
    if (projectId) return;
    setSelectedProjectId(project?.id.toString() ?? null);
  };

  const activeProjectId = projectId || selectedProjectId;

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
      className="hover:bg-zinc-50 border text-zinc-900 rounded-full gap-2 px-4 h-10"
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

  // Queries
  const {
    data: scenariosResponse,
    refetch,
    isLoading: isScenariosLoading,
  } = useQuery({
    queryKey: ["test-scenarios", activeProjectId],
    queryFn: async () => {
      const result = await testScenarioApi.listScenarios(
        activeProjectId ?? undefined,
      );
      console.log("API Response for scenarios:", result);
      // Handle both array response and paginated response { data: [...] }
      if (
        result &&
        typeof result === "object" &&
        !Array.isArray(result) &&
        "data" in result
      ) {
        return (result as any).data || [];
      }
      return Array.isArray(result) ? result : [];
    },
    refetchInterval: 5000, // Poll every 5s for generation status updates
  });

  const scenarios = Array.isArray(scenariosResponse) ? scenariosResponse : [];

  // Projects are fetched by ProjectSelect component internally
  const isLoading = isScenariosLoading;

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

  const handleGenerate = (id: string, sectionIds: string[]) => {
    // Triggers generation for selected sections from the outer view
    testScenarioApi
      .generateTests(id, { sectionIds, projectId })
      .then(() => refetch());
  };

  const filteredItems = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    const items = Array.isArray(scenarios) ? scenarios : [];
    return items.filter((s) => {
      const title = s.title || "";
      const matchesSearch = title.toLowerCase().includes(searchLower);
      const matchesProject =
        !!projectId ||
        !activeProjectId ||
        s.projectId?.toString() === activeProjectId;
      return matchesSearch && matchesProject;
    });
  }, [scenarios, activeProjectId, projectId, searchQuery]);

  const allSelected =
    filteredItems.length > 0 && selectedIds.size === filteredItems.length;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < filteredItems.length;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden relative">
      {/* Header & Filters */}
      <div className="flex-none px-8 pt-10 pb-6 border-b border-gray-100/80 bg-white/80 backdrop-blur-xl z-10">
        {!hideHeader && (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                Test Scenarios
              </h1>
              <p className="text-sm text-gray-500 mt-1.5">
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
        <div className="flex items-center justify-between gap-2 mt-5">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search scenarios..."
                className="pl-9 w-64 h-10 bg-white border-theme-border rounded-xl focus-visible:ring-2 focus-visible:ring-zinc-900"
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
          </div>
          {hideHeader && (
            <div className="shrink-0">
              {renderSyncScenariosButton()}
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 min-h-0 relative">
        <div className="flex-1 flex flex-col min-w-0">
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ScenarioSkeleton key={i} />
                  ))}
                </div>
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="p-6">
                <section>
                  {filteredItems.length > 0 && (
                    <div className="mb-4">
                      <SelectAllCheckbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={toggleSelectAll}
                        label="Select all"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filteredItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        onClick={(e) => e.stopPropagation()}
                        className="relative"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.25 }}
                      >
                        <AnimatePresence>
                          {selectedIds.size > 0 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-4 right-4 z-20"
                            >
                              <StyledCheckbox
                                checked={selectedIds.has(item.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleSelection(item.id);
                                }}
                                size="md"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <ScenarioItem
                          scenario={item}
                          isSelected={false}
                          onClick={() => {
                            projectId
                              ? navigate({
                                  to: "/projects/$id/test-scenarios/$scenarioId" as any,
                                  params: {
                                    id: projectId,
                                    scenarioId: item.id,
                                  } as any,
                                })
                              : navigate({
                                  to: "/test-scenarios/$id",
                                  params: { id: item.id },
                                });
                          }}
                          onGenerate={(e) => {
                            e.stopPropagation();
                            projectId
                              ? navigate({
                                  to: "/projects/$id/test-scenarios/$scenarioId" as any,
                                  params: {
                                    id: projectId,
                                    scenarioId: item.id,
                                  } as any,
                                })
                              : navigate({
                                  to: "/test-scenarios/$id",
                                  params: { id: item.id },
                                });
                          }}
                          onDelete={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          isDeleting={deletingId === item.id}
                          deleteError={
                            deletingId === item.id ? deleteError : null
                          }
                        />
                      </motion.div>
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              <EmptyState
                icon={Terminal}
                title="No test scenarios found"
                description="Sync docs/test-scenarios from the selected specs repository."
                className="h-full min-h-[400px]"
              />
            )}
          </ScrollArea>
        </div>
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
            <div className="flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-xl border border-zinc-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] pointer-events-auto">
              <span className="text-sm font-medium text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-full tabular-nums">
                {selectedIds.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                className="h-9 px-4 border-zinc-300 hover:bg-zinc-50 rounded-full text-xs"
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

    </div>
  );
};
