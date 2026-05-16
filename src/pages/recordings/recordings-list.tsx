import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Search, Loader2, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  listRecordings,
  bulkDeleteRecordings,
  deleteRecording,
  updateRecording,
} from "@/api/recording";
import {
  generatePlaywrightTest,
  generateTestFilename,
  generateBlueprintFilename,
} from "@/lib/test-generator";
import { downloadTextFile, downloadJsonFile } from "@/lib/download";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigation } from "@/contexts/navigation-context";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { storageService } from "@/services/storage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TestBlueprint } from "@/types/recording";
import { RecordingItem } from "./components/recording-item";
import { ProjectSelect } from "@/components/project-select";
import {
  SelectAllCheckbox,
  StyledCheckbox,
} from "@/components/ui/styled-checkbox";

const RecordingSkeleton = () => {
  return (
    <div className="flex flex-col border border-zinc-100 rounded-xl overflow-hidden bg-white h-full">
      {/* Thumbnail Skeleton */}
      <Skeleton className="w-full h-[240px] rounded-none" />
      <div className="p-3 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-zinc-50 mt-auto">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export const RecordingsPage: React.FC<{
  portalContainer?: HTMLElement | null;
  projectId?: string;
  projectName?: string;
  hideHeader?: boolean;
}> = ({ portalContainer, projectId, projectName, hideHeader = false }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const { push } = useNavigation();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useLocalStorage<
    string | null
  >("recordings-project-id", null);

  const handleProjectSelect = (
    project: { id: number; name: string } | null,
  ) => {
    if (projectId) return;
    setSelectedProjectId(project?.id.toString() ?? null);
  };

  const activeProjectId = projectId || selectedProjectId;

  const {
    data: blueprints = [],
    refetch: refetchBlueprints,
    isLoading: isBlueprintsLoading,
  } = useQuery({
    queryKey: ["recordings-blueprints", activeProjectId],
    queryFn: async () => {
      const params: any = {
        sort_by: "created_at",
        order: "desc",
      };

      if (projectId) {
        params.appProjectId = projectId;
      } else if (activeProjectId) {
        params.project_id = activeProjectId;
      }

      const result = await listRecordings(params);
      console.log("API Response for recordings:", result);
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
  });

  const isLoading = isBlueprintsLoading;

  const { data: lastBlueprint, refetch: refetchLastBlueprint } = useQuery({
    queryKey: ["last-blueprint"],
    queryFn: async () => {
      const data = await storageService.get("lastBlueprint");
      return data || null;
    },
    refetchOnMount: "always",
  });

  const handleSaveLastBlueprint = async () => {
    try {
      const latestBlueprint = await storageService.get("lastBlueprint");
      if (!latestBlueprint) {
        toast.error("No recording to save. Please record a test first.");
        return;
      }

      const { saveRecording } = await import("@/api/recording");
      await saveRecording(latestBlueprint, projectId);

      queryClient.setQueryData(["last-blueprint"], null);
      refetchLastBlueprint();
      refetchBlueprints();
      toast.success("Test recording saved successfully");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to save test recording");
    }
  };

  const handleRunTest = (blueprint: TestBlueprint) => {
    toast.info("Playback feature requires a test runner service");
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);

    try {
      await deleteRecording(id, projectId);
      toast.success("Test recording deleted successfully");
      refetchBlueprints();
    } catch (e: any) {
      console.error(e);
      const errorMessage = e?.message || "Failed to delete test recording";
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
      await bulkDeleteRecordings(Array.from(selectedIds), projectId);
      toast.success(
        `${selectedIds.size} test recording(s) deleted successfully`,
      );
      setSelectedIds(new Set());
      refetchBlueprints();
    } catch (e: any) {
      console.error("Failed to bulk delete recordings:", e);
      const errorMessage = e?.message || "Failed to delete test recordings";
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

  const handleRename = async (id: string, newName: string) => {
    try {
      await updateRecording(id, { name: newName } as any, projectId);
      toast.success("Recording renamed");
      refetchBlueprints();
    } catch (error) {
      toast.error("Failed to rename recording");
      console.error("Failed to rename:", error);
    }
  };

  const handleExportPlaywright = (blueprint: TestBlueprint) => {
    const code = generatePlaywrightTest(blueprint);
    const filename = generateTestFilename(blueprint);
    downloadTextFile(code, filename);
  };

  const handleExportJson = (blueprint: TestBlueprint) => {
    const filename = generateBlueprintFilename(blueprint);
    downloadJsonFile(blueprint, filename);
  };

  const handleRunInAgent = (blueprint: TestBlueprint) => {
    push("agent", {
      initialMessage: `I want to run the automation test "${blueprint.name}" (ID: ${blueprint.id}). Please execute it and let me know the result.`,
    });
  };

  const handleShareCopyScript = (blueprint: TestBlueprint) => {
    const code = generatePlaywrightTest(blueprint);
    navigator.clipboard.writeText(code);
    toast.success("Test script copied to clipboard");
  };

  const handleCopyVideoLink = (blueprint: TestBlueprint) => {
    if (blueprint.video_url) {
      navigator.clipboard.writeText(blueprint.video_url);
      toast.success("Video link copied to clipboard");
    } else {
      toast.error("No video available for this recording");
    }
  };

  const handleViewDetails = (id: string) => {
    navigate({ to: "/recordings/$id", params: { id } });
  };

  const handleStartRecording = () => {
    toast.info("Recording feature requires browser extension");
  };

  const filteredItems = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    const items = Array.isArray(blueprints) ? blueprints : [];
    return items.filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(searchLower);
      const matchesProject =
        !!projectId ||
        !activeProjectId ||
        b.project_id?.toString() === activeProjectId;
      return matchesSearch && matchesProject;
    });
  }, [blueprints, activeProjectId, projectId, searchQuery]);

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
                Recordings
              </h1>
              <p className="text-sm text-gray-500 mt-1.5">
                {projectName
                  ? `Manage captured test flows for ${projectName}`
                  : "Manage and run your captured test flows"}
              </p>
            </div>
          </div>
        )}

        <div className={`flex items-center justify-between gap-2 ${hideHeader ? "" : "mt-5"}`}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search recordings..."
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
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-6">
                {/* Processing Section */}
                {lastBlueprint && (
                  <section className="mb-8 p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                        {lastBlueprint.status === "processing" ? (
                          <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
                        ) : (
                          <Terminal className="w-5 h-5 text-zinc-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900">
                          {lastBlueprint.status === "processing"
                            ? "Processing Test Script..."
                            : "New Test Script Ready"}
                        </h3>
                        <p className="text-sm text-zinc-600">
                          {lastBlueprint.status === "processing"
                            ? "We are generating your test steps using AI..."
                            : "You have a recently captured flow. Save it to your library."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lastBlueprint.status === "ready" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white"
                            onClick={() => handleRunTest(lastBlueprint)}
                          >
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            className="bg-zinc-900 hover:bg-black text-white border-none"
                            onClick={handleSaveLastBlueprint}
                          >
                            Save
                          </Button>
                        </>
                      )}
                    </div>
                  </section>
                )}

                {/* Recordings Section */}
                <section>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <RecordingSkeleton key={i} />
                    ))}
                  </div>
                </section>
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="p-6">
                {/* Processing Section */}
                {lastBlueprint && (
                  <section className="mb-8 p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                        {lastBlueprint.status === "processing" ? (
                          <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
                        ) : (
                          <Terminal className="w-5 h-5 text-zinc-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900">
                          {lastBlueprint.status === "processing"
                            ? "Processing Test Script..."
                            : "New Test Script Ready"}
                        </h3>
                        <p className="text-sm text-zinc-600">
                          {lastBlueprint.status === "processing"
                            ? "We are generating your test steps using AI..."
                            : "You have a recently captured flow. Save it to your library."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lastBlueprint.status === "ready" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white"
                            onClick={() => handleRunTest(lastBlueprint)}
                          >
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            className="bg-zinc-900 hover:bg-black text-white border-none"
                            onClick={handleSaveLastBlueprint}
                          >
                            Save
                          </Button>
                        </>
                      )}
                    </div>
                  </section>
                )}

                {/* Recordings Section */}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
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
                        <RecordingItem
                          recording={item}
                          viewMode="grid"
                          onClick={() => handleViewDetails(item.id)}
                          onRun={(e) => {
                            e.stopPropagation();
                            handleRunTest(item);
                          }}
                          onDelete={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          onRename={handleRename}
                          onExportPlaywright={(e) => {
                            e.stopPropagation();
                            handleExportPlaywright(item);
                          }}
                          onExportJson={(e) => {
                            e.stopPropagation();
                            handleExportJson(item);
                          }}
                          onRunInAgent={(e) => {
                            e.stopPropagation();
                            handleRunInAgent(item);
                          }}
                          onCopyScript={(e) => {
                            e.stopPropagation();
                            handleShareCopyScript(item);
                          }}
                          onCopyVideoLink={(e) => {
                            e.stopPropagation();
                            handleCopyVideoLink(item);
                          }}
                          portalContainer={portalContainer}
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
                title="No test recordings found"
                description="Start a new recording to capture your browser interactions."
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
