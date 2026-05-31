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
import { getProjectBranches, GitLabBranch } from "@/api/project";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@/contexts/navigation-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectSelect } from "@/components/project-select";
import { GitLabProject } from "@/types/project";
import { cn } from "@/lib/utils";
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
  const startFixMutation = useStartFixIssue();
  const { push } = useNavigation();

  // Initialize with the issue's project
  useEffect(() => {
    if (isOpen && !selectedProject) {
      setSelectedProject({
        id: issue.project_id,
        name: issue.project_name,
        path_with_namespace: issue.project_name,
      } as GitLabProject);
    }
  }, [isOpen, issue, selectedProject]);

  // Fetch branches for selected project
  const { data: branchesData, isLoading: isLoadingBranches } = useQuery({
    queryKey: ["project-branches", selectedProject?.id],
    queryFn: async () => {
      if (!selectedProject?.id) return [];
      const response = await getProjectBranches(selectedProject.id);
      return response.data?.branches || [];
    },
    enabled: isOpen && !!selectedProject?.id,
    staleTime: 30000, // Cache for 30 seconds
  });

  const branches = branchesData || [];

  // Set default branch when branches are loaded
  useEffect(() => {
    if (branches.length > 0 && !targetBranch) {
      const defaultBranch = branches.find((b) => b.default);
      setTargetBranch(defaultBranch?.name || branches[0]?.name || "main");
    }
  }, [branches, targetBranch]);

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
            push("agent-sessions" as any, { tab: "fix" });
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
                      setTargetBranch(""); // Reset branch when project changes
                    }}
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
                  ) : isLoadingBranches ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-muted rounded-lg border border-border">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Loading branches...
                      </span>
                    </div>
                  ) : (
                    <Select
                      value={targetBranch}
                      onValueChange={setTargetBranch}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Select target branch" />
                      </SelectTrigger>
                      <SelectContent container={portalContainer}>
                        {branches.map((branch) => (
                          <SelectItem key={branch.name} value={branch.name}>
                            <div className="flex items-center gap-2">
                              <span>{branch.name}</span>
                              {branch.default && (
                                <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                                  DEFAULT
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        push("agent-sessions" as any, { tab: "fix" });
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
