import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ProjectSelect } from "@/components/project-select";
import { useProjectBranches } from "@/hooks/use-project-branches";
import { useLazyFileTree } from "@/hooks/use-lazy-file-tree";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  useSpecsFile,
  useSpecsCommits,
  useSpecsCommitDetail,
} from "@/hooks/use-specs";
import { FileTree } from "./components/file-tree";
import { DocumentViewer } from "./components/document-viewer";
import { CommitHistory } from "./components/commit-history";
import { BranchSelect } from "./components/branch-select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckSquare2, History, FolderTree, X, Menu, Sparkles } from "lucide-react";
import type { GitLabProject } from "@/types/project";
import type { FileTreeNode } from "@/api/specs";
import { FSDIssuePanel } from "./components/fsd-issue-panel";

type SidePanel = "none" | "history" | "fsdIssues";

/** Read/write per-project branch preference from localStorage */
function getStoredBranch(projectId: string): string | null {
  try {
    return localStorage.getItem(`specs-branch-${projectId}`);
  } catch {
    return null;
  }
}
function setStoredBranch(projectId: string, branch: string | null) {
  try {
    if (branch) localStorage.setItem(`specs-branch-${projectId}`, branch);
    else localStorage.removeItem(`specs-branch-${projectId}`);
  } catch {
    /* ignore */
  }
}

export function SpecsPage({
  projectId: scopedProjectId,
  branchProjectId,
  projectName,
}: {
  projectId?: string;
  branchProjectId?: string | number;
  projectName?: string;
} = {}) {
  // --- Persisted project selection ---
  const [selectedProjectId, setSelectedProjectId] = useLocalStorage<
    string | null
  >("specs-project-id", null);
  const [selectedProjectName, setSelectedProjectName] = useLocalStorage<
    string | null
  >("specs-project-name", null);

  // --- Branch selection (per-project, synced to localStorage) ---
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [branchSearch, setBranchSearch] = useState("");

  // Load stored branch when project changes
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (selectedProjectId) {
        setSelectedBranch(getStoredBranch(selectedProjectId));
      } else {
        setSelectedBranch(null);
      }
      setBranchSearch("");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedProjectId]);

  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [sidePanel, setSidePanel] = useState<SidePanel>("none");
  const [selectedCommitSha, setSelectedCommitSha] = useState<string | null>(
    null,
  );

  // --- Mobile sheet state ---
  const isMobile = useIsMobile();
  const [mobileFileTreeOpen, setMobileFileTreeOpen] = useState(false);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const [mobileFSDIssuesOpen, setMobileFSDIssuesOpen] = useState(false);
  const [fsdSelectionMode, setFsdSelectionMode] = useState(false);
  const [selectedFSDPaths, setSelectedFSDPaths] = useState<Set<string>>(
    () => new Set(),
  );
  const [previewRequestId, setPreviewRequestId] = useState(0);

  const projectId = scopedProjectId || selectedProjectId || undefined;
  const branchLookupProjectId = branchProjectId || projectId;
  const fsdGenerationEnabled = !!scopedProjectId;
  const displayProjectName = scopedProjectId
    ? projectName
    : selectedProjectName;

  // --- Fetch branches (search-aware) ---
  const { data: branches = [], isLoading: branchesLoading } =
    useProjectBranches(branchLookupProjectId, branchSearch || undefined);

  // Resolve the effective branch: selected → default → 'main'
  const defaultBranchName = branches.find((b) => b.default)?.name;
  const effectiveBranch = selectedBranch || defaultBranchName || "main";

  // --- Lazy file tree (loads root first, children on expand) ---
  const {
    tree,
    loading: treeLoading,
    loadingPaths,
    loadRoot,
    loadChildren,
    isLoaded,
    refresh: refreshTree,
  } = useLazyFileTree(projectId, effectiveBranch);

  // Load root when project or branch changes
  useEffect(() => {
    if (projectId) {
      loadRoot();
    }
  }, [projectId, effectiveBranch, loadRoot]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSelectedFSDPaths(new Set());
      setPreviewRequestId(0);
      setSidePanel((prev) => (prev === "fsdIssues" ? "none" : prev));
      setMobileFSDIssuesOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [projectId, effectiveBranch]);

  const handleProjectSelect = (project: GitLabProject | null) => {
    setSelectedProjectId(project?.id.toString() ?? null);
    setSelectedProjectName(project?.name ?? null);
    setSelectedBranch(null);
    setActiveFile(null);
    setSelectedCommitSha(null);
    setSelectedFSDPaths(new Set());
    setFsdSelectionMode(false);
  };

  const handleBranchSelect = useCallback(
    (branch: string) => {
      setSelectedBranch(branch);
      if (selectedProjectId) setStoredBranch(selectedProjectId, branch);
      setActiveFile(null);
      setSelectedCommitSha(null);
    },
    [selectedProjectId],
  );

  // --- File content query ---
  const { data: fileContent, isLoading: fileLoading } = useSpecsFile(
    projectId,
    activeFile,
    effectiveBranch,
  );

  // --- Commits ---
  const {
    data: commits = [],
    isLoading: commitsLoading,
    refetch: refetchCommits,
  } = useSpecsCommits(projectId, {
    path: activeFile || undefined,
    ref: effectiveBranch,
  });

  const { data: commitDetail, isLoading: commitDetailLoading } =
    useSpecsCommitDetail(projectId, selectedCommitSha);

  const handleFileSelect = useCallback((path: string) => {
    setActiveFile(path);
    setSelectedCommitSha(null);
  }, []);

  const handleFileSelectMobile = useCallback((path: string) => {
    setActiveFile(path);
    setSelectedCommitSha(null);
    setMobileFileTreeOpen(false);
  }, []);

  const handleRefresh = useCallback(() => {
    refreshTree();
    refetchCommits();
  }, [refreshTree, refetchCommits]);

  const toggleHistory = useCallback(() => {
    setSidePanel((prev) => (prev === "history" ? "none" : "history"));
  }, []);

  const selectedFSDPathList = React.useMemo(
    () => Array.from(selectedFSDPaths).sort((a, b) => a.localeCompare(b)),
    [selectedFSDPaths],
  );

  const isSelectableFSD = useCallback((node: FileTreeNode) => {
    return node.type === "blob" && /\.(md|markdown)$/i.test(node.name);
  }, []);

  const toggleFSDPath = useCallback((path: string) => {
    setSelectedFSDPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const clearFSDSelection = useCallback(() => {
    setSelectedFSDPaths(new Set());
  }, []);

  const resetFSDWorkflow = useCallback(() => {
    setSelectedFSDPaths(new Set());
    setFsdSelectionMode(false);
    setPreviewRequestId(0);
    setSidePanel((prev) => (prev === "fsdIssues" ? "none" : prev));
    setMobileFSDIssuesOpen(false);
  }, []);

  const handleStartFSDGeneration = useCallback(() => {
    if (!fsdGenerationEnabled || selectedFSDPaths.size === 0) return;
    setSidePanel("fsdIssues");
    setMobileFSDIssuesOpen(true);
    setPreviewRequestId((prev) => prev + 1);
  }, [fsdGenerationEnabled, selectedFSDPaths.size]);

  const handleSelectCommit = useCallback((sha: string) => {
    setSelectedCommitSha(sha);
  }, []);

  // --- Empty state: no project selected ---
  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center gap-5"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-500/10 to-stone-500/10 flex items-center justify-center border border-border/30">
            <FolderTree className="h-9 w-9 text-muted-foreground/40" />
          </div>
          <div className="text-center space-y-1.5">
            <h2 className="text-lg font-semibold text-foreground/80">
              Project Specs
            </h2>
            <p className="text-sm text-muted-foreground/50 max-w-[260px]">
              Select a project to browse and edit specification files
            </p>
          </div>
          {scopedProjectId ? (
            <div className="rounded-xl border border-border/50 bg-muted/40 px-4 py-2 text-sm font-medium text-foreground/80">
              {projectName || "Current project"}
            </div>
          ) : (
            <ProjectSelect
              value={selectedProjectId}
              onSelect={handleProjectSelect}
              placeholder="Choose a project..."
            />
          )}
        </motion.div>
      </div>
    );
  }

  const activeFileName = activeFile?.split("/").pop();
  const selectedFSDCount = selectedFSDPaths.size;

  // Shared file tree sidebar content
  const fileTreeSidebarContent = (
    <>
      <div className="flex flex-col gap-2 px-3 py-3 border-b border-border/40 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <FolderTree className="h-4 w-4 text-muted-foreground/60 shrink-0" />
            <span className="text-[13px] font-semibold text-foreground/80">
              Specs
            </span>
          </div>
          {scopedProjectId ? (
            <span className="truncate rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              {projectName || "Project"}
            </span>
          ) : (
            <ProjectSelect
              value={selectedProjectId}
              onSelect={handleProjectSelect}
              size="compact"
              placeholder="Project"
              className="max-w-[120px]"
            />
          )}
        </div>
        <BranchSelect
          branches={branches}
          value={effectiveBranch}
          onSelect={handleBranchSelect}
          onSearch={setBranchSearch}
          loading={branchesLoading}
          size="compact"
          className="w-full"
        />
        {fsdGenerationEnabled && (
          <div className="rounded-lg border border-border/60 bg-background p-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={fsdSelectionMode ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFsdSelectionMode((prev) => !prev)}
                className="h-8 flex-1 justify-start px-2.5 text-xs"
              >
                <CheckSquare2 className="h-3.5 w-3.5" />
                Select FSDs
              </Button>
            </div>
            {fsdSelectionMode && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-muted-foreground">
                    {selectedFSDCount === 0
                      ? "Markdown files only"
                      : `${selectedFSDCount} selected`}
                  </span>
                  {selectedFSDCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFSDSelection}
                      className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleStartFSDGeneration}
                  disabled={selectedFSDCount === 0}
                  className="h-8 w-full justify-center px-2 text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate issue drafts
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <FileTree
        nodes={tree}
        activePath={activeFile}
        onSelect={isMobile ? handleFileSelectMobile : handleFileSelect}
        onExpand={loadChildren}
        loadingPaths={loadingPaths}
        isLoaded={isLoaded}
        loading={treeLoading}
        onRefresh={handleRefresh}
        className="flex-1"
        selectionMode={fsdSelectionMode}
        selectedPaths={selectedFSDPaths}
        onToggleSelect={toggleFSDPath}
        isSelectableFile={isSelectableFSD}
      />
    </>
  );

  const fsdIssuePanelContent = (
    <FSDIssuePanel
      key={`${projectId}-${effectiveBranch}`}
      projectId={projectId}
      selectedPaths={selectedFSDPathList}
      branch={effectiveBranch}
      previewRequestId={previewRequestId}
      onClearSelection={clearFSDSelection}
      onCreateSuccess={resetFSDWorkflow}
      className="h-full"
    />
  );

  return (
    <div className="flex h-full bg-background">
      {/* ── Desktop File Tree Sidebar ── */}
      <div className="hidden md:flex w-[300px] shrink-0 border-r border-border/40 flex-col bg-muted/10">
        {fileTreeSidebarContent}
      </div>

      {/* ── Mobile File Tree Sheet ── */}
      <Sheet open={mobileFileTreeOpen} onOpenChange={setMobileFileTreeOpen}>
        <SheetContent
          side="left"
          className="p-0 w-4/5 max-w-[300px] flex flex-col"
        >
          {fileTreeSidebarContent}
        </SheetContent>
      </Sheet>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="flex md:hidden items-center justify-between pl-14 pr-3 py-2 border-b border-border/40 bg-muted/10 shrink-0 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileFileTreeOpen(true)}
            className="h-8 px-2 shrink-0"
          >
            <Menu className="h-4 w-4 mr-1.5" />
            Files
          </Button>
          <div className="flex items-center gap-1 min-w-0 text-[13px]">
            <span className="text-muted-foreground/50 font-medium truncate">
              {displayProjectName}
            </span>
            <span className="text-muted-foreground/30 shrink-0">/</span>
            <span className="text-xs text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded font-mono shrink-0">
              {effectiveBranch}
            </span>
            {activeFile && (
              <>
                <span className="text-muted-foreground/30 shrink-0">/</span>
                <span className="font-semibold text-foreground/80 truncate">
                  {activeFileName}
                </span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileHistoryOpen(true)}
            className={cn(
              "h-8 px-2 shrink-0",
              mobileHistoryOpen && "bg-muted text-foreground/80",
            )}
          >
            <History className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop Breadcrumb + Actions bar */}
        <div className="hidden md:flex items-center justify-between px-5 py-2 border-b border-border/40 bg-muted/10 shrink-0">
          <div className="flex items-center gap-1.5 text-[13px] min-w-0">
            <span className="text-muted-foreground/50 font-medium">
              {displayProjectName}
            </span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-xs text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded font-mono">
              {effectiveBranch}
            </span>
            {activeFile && (
              <>
                <span className="text-muted-foreground/30">/</span>
                <span className="font-semibold text-foreground/80 truncate">
                  {activeFileName}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={sidePanel === "history" ? "secondary" : "ghost"}
              size="sm"
              onClick={toggleHistory}
              className={cn(
                "h-7 px-2.5 text-xs gap-1.5",
                sidePanel === "history"
                  ? "bg-muted text-foreground/80 hover:bg-muted/80"
                  : "text-muted-foreground",
              )}
            >
              {sidePanel === "history" ? (
                <X className="h-3.5 w-3.5" />
              ) : (
                <History className="h-3.5 w-3.5" />
              )}
              History
            </Button>
          </div>
        </div>

        {/* Document + Side Panel */}
        <div className="flex-1 flex min-h-0">
          {/* Document Viewer */}
          <div className="flex-1 min-w-0">
            <DocumentViewer
              content={fileContent?.content ?? null}
              filePath={activeFile}
              loading={fileLoading}
              className="h-full"
            />
          </div>

          {/* Desktop Side Panel */}
          <div className="hidden md:block h-full">
            <AnimatePresence initial={false}>
              {sidePanel === "history" && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="shrink-0 border-l border-border/40 overflow-hidden h-full"
                >
                  <CommitHistory
                    commits={commits}
                    loading={commitsLoading}
                    onRefresh={refetchCommits}
                    onSelectCommit={handleSelectCommit}
                    selectedCommit={commitDetail}
                    loadingDetail={commitDetailLoading}
                    className="h-full"
                  />
                </motion.div>
              )}
              {sidePanel === "fsdIssues" && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 420, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="shrink-0 border-l border-border/40 overflow-hidden h-full"
                >
                  {fsdIssuePanelContent}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Mobile History Sheet ── */}
      <Sheet open={mobileHistoryOpen} onOpenChange={setMobileHistoryOpen}>
        <SheetContent
          side="right"
          className="p-0 w-full sm:max-w-md flex flex-col"
        >
          <CommitHistory
            commits={commits}
            loading={commitsLoading}
            onRefresh={refetchCommits}
            onSelectCommit={handleSelectCommit}
            selectedCommit={commitDetail}
            loadingDetail={commitDetailLoading}
            className="h-full"
          />
        </SheetContent>
      </Sheet>

      <Sheet open={mobileFSDIssuesOpen} onOpenChange={setMobileFSDIssuesOpen}>
        <SheetContent
          side="right"
          className="p-0 w-full sm:max-w-md flex flex-col"
        >
          {fsdIssuePanelContent}
        </SheetContent>
      </Sheet>
    </div>
  );
}
