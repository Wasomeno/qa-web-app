import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Wrench,
  ArrowRight,
  Loader2,
  GitBranch,
  FolderGit2,
} from "lucide-react";
import { Issue } from "@/api/issue";
import { useStartFixIssue } from "@/pages/agent/hooks/use-fix-sessions";
import { getProjectBranches } from "@/api/project";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@/contexts/navigation-context";
import { BranchSelect } from "@/pages/specs/components/branch-select";
import { ProjectSelect } from "@/components/project-select";
import { GitLabProject } from "@/types/project";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/utils/useDebounce";
import { toast } from "sonner";

interface FixIssueModalProps {
  issue: Issue;
  isOpen: boolean;
  onClose: () => void;
  portalContainer?: HTMLElement | null;
  appProjectId?: string;
}

export const FixIssueModal: React.FC<FixIssueModalProps> = ({
  issue,
  isOpen,
  onClose,
  portalContainer,
  appProjectId,
}) => {
  const [selectedProject, setSelectedProject] = useState<GitLabProject | null>(
    null,
  );
  const [targetBranch, setTargetBranch] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");
  const debouncedBranchSearch = useDebounce(branchSearch, 300);
  const startFixMutation = useStartFixIssue();
  const { push } = useNavigation();

  // Resolved when ProjectSelect fetches/finds the full project — gives us default_branch for free
  const [resolvedDefaultBranch, setResolvedDefaultBranch] = useState<string | undefined>();

  const effectiveDefaultBranch =
    selectedProject?.default_branch || resolvedDefaultBranch;

  // Still waiting if the project object has no default_branch and ProjectSelect hasn't resolved it yet
  const isWaitingForDefault =
    !selectedProject?.default_branch && !resolvedDefaultBranch;

  // Fetch branches for selected project
  const { data: branchesData, isLoading: isLoadingBranches } = useQuery({
    queryKey: ["project-branches", selectedProject?.id, debouncedBranchSearch],
    queryFn: async () => {
      if (!selectedProject?.id) return [];
      const response = await getProjectBranches(
        selectedProject.id,
        debouncedBranchSearch || undefined,
      );
      return response.data?.branches || [];
    },
    enabled: isOpen && !!selectedProject?.id,
    staleTime: 30000,
  });

  const branches = branchesData || [];

  // Set default branch once both branches and project default_branch are resolved
  useEffect(() => {
    if (branches.length > 0 && !targetBranch && !isWaitingForDefault) {
      if (effectiveDefaultBranch) {
        const found = branches.find((b) => b.name === effectiveDefaultBranch);
        setTargetBranch(found?.name ?? effectiveDefaultBranch);
      } else {
        // Fallback if project details didn't return default_branch
        const defaultBranch = branches.find((b) => b.default);
        setTargetBranch(defaultBranch?.name || branches[0]?.name || "main");
      }
    }
  }, [branches, targetBranch, effectiveDefaultBranch, isWaitingForDefault]);

  const handleStartFix = async () => {
    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }

    if (!targetBranch) {
      toast.error("Please select a target branch");
      return;
    }

    setIsSubmitting(true);

    try {
      await startFixMutation.mutateAsync({
        projectId: issue.project_id,
        issueIid: issue.iid,
        appProjectId,
        repoProjectId: selectedProject.id,
        targetBranch: targetBranch,
      });

      toast.success("Fix agent started in background", {
        description: "You can track progress in the Fix Agent Sessions page",
        action: {
          label: "View Sessions",
          onClick: () => {
            onClose();
            push("fix-sessions");
          },
        },
      });

      onClose();
    } catch (error: any) {
      toast.error("Failed to start fix agent", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, isSubmitting]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedProject(null);
      setTargetBranch("");
      setBranchSearch("");
      setResolvedDefaultBranch(undefined);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000000]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[1000001] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                duration: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-md overflow-hidden pointer-events-auto mx-4"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-muted rounded-xl">
                    <Wrench className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      Fix Issue with Agent
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Configure and start the fix process
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className={cn(
                    "p-2 hover:bg-accent rounded-lg transition-colors",
                    isSubmitting && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Issue Info */}
                <div className="p-4 bg-muted rounded-xl border border-border">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded border border-border">
                      #{issue.iid}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {issue.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {issue.project_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Project Selector */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <FolderGit2 className="w-3.5 h-3.5" />
                    Repository Project
                  </label>
                  <ProjectSelect
                    value={selectedProject?.id || null}
                    onSelect={(project) => {
                      setSelectedProject(project);
                      setTargetBranch("");
                      setBranchSearch("");
                      setResolvedDefaultBranch(undefined);
                    }}
                    onProjectResolved={(project) =>
                      setResolvedDefaultBranch(project.default_branch)
                    }
                    mode="single"
                    size="default"
                    placeholder="Select repository..."
                    portalContainer={portalContainer}
                    stopPropagation
                  />
                  <p className="text-xs text-muted-foreground">
                    The project where the fix will be applied
                  </p>
                </div>

                {/* Branch Selector */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <GitBranch className="w-3.5 h-3.5" />
                    Target Branch
                  </label>

                  {!selectedProject ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-muted rounded-lg border border-border">
                      <span className="text-sm text-muted-foreground">
                        Select a project first
                      </span>
                    </div>
                  ) : (
                    <BranchSelect
                      branches={branches}
                      value={targetBranch}
                      onSelect={setTargetBranch}
                      onSearch={setBranchSearch}
                      loading={isLoadingBranches}
                      className="w-full min-w-0 justify-between text-left font-normal bg-background border border-border rounded-xl h-10 px-3 hover:bg-accent hover:text-foreground transition-all"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    The branch to create the fix from
                  </p>
                </div>

                {/* Info Message */}
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg border border-border">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      i
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The fix agent will run in the background. You can monitor
                    its progress in the{" "}
                    <button
                      onClick={() => {
                        onClose();
                        push("fix-sessions");
                      }}
                      className="text-foreground hover:text-foreground font-medium underline"
                    >
                      Fix Agent Sessions
                    </button>{" "}
                    page.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-muted border-t border-border flex items-center justify-end gap-3">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className={cn(
                    "px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors",
                    isSubmitting && "opacity-50 cursor-not-allowed",
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartFix}
                  disabled={
                    isSubmitting ||
                    !targetBranch ||
                    !selectedProject ||
                    isLoadingBranches
                  }
                  className={cn(
                    "flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm",
                    (isSubmitting ||
                      !targetBranch ||
                      !selectedProject ||
                      isLoadingBranches) &&
                      "opacity-50 cursor-not-allowed",
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      Start Fix Agent
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
