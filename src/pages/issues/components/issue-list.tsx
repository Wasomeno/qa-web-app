import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, FolderOpen, Loader2 } from 'lucide-react';
import { Issue } from '@/api/issue';
import { IssueCard } from './issue-card';
import { IssueCardSkeleton } from './issue-card-skeleton';

interface IssueListProps {
  issues: Issue[];
  isProjectFiltered: boolean;
  onIssueClick: (issue: Issue) => void;
  onPin?: (issue: Issue) => void;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  isPinned?: (issueIid: number, projectId: number) => boolean;
  onFixIssue?: (issue: Issue) => void;
}

export const IssueList: React.FC<IssueListProps> = ({
  issues,
  isProjectFiltered,
  onIssueClick,
  onPin,
  isLoading = false,
  isFetchingNextPage = false,
  isPinned,
  onFixIssue,
}) => {
  const [collapsedProjects, setCollapsedProjects] = useState<
    Record<string, boolean>
  >({});

  const toggleProject = (projectId: string) => {
    setCollapsedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <IssueCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Group issues by project
  const groupedIssues = issues.reduce(
    (acc, issue) => {
      const pid = issue.project_id.toString();
      if (!acc[pid]) {
        acc[pid] = {
          projectId: pid,
          projectName: issue.project_name,
          issues: [],
        };
      }
      acc[pid].issues.push(issue);
      return acc;
    },
    {} as Record<
      string,
      { projectId: string; projectName: string; issues: Issue[] }
    >
  );

  const projectGroups = Object.values(groupedIssues);

  if (issues.length === 0) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
          <FolderOpen className="w-9 h-9 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-semibold text-lg">No issues found</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-xs leading-relaxed">
          Try adjusting your filters or search terms to find what you're looking
          for.
        </p>
      </div>
    );
  }

  // If a specific project is selected, just show the flat list without headers
  if (isProjectFiltered) {
    return (
      <div className="space-y-3">
        {issues.map(issue => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onClick={onIssueClick}
            onPin={onPin}
            onUnpin={onPin}
            onFixIssue={onFixIssue}
            variant={
              isPinned?.(issue.iid, issue.project_id) ? 'pinned' : 'default'
            }
          />
        ))}
        {isFetchingNextPage && (
          <div className="flex justify-center py-6">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading more issues...
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full">
      {projectGroups.map(group => {
        const isCollapsed = collapsedProjects[group.projectId];

        return (
          <motion.div
            key={group.projectId}
            layout
            className="bg-gray-50/60 border border-gray-100 rounded-2xl p-1"
          >
            <button
              onClick={() => toggleProject(group.projectId)}
              className="flex items-center gap-2.5 w-full text-left py-2.5 px-3 hover:bg-white/60 rounded-xl transition-colors group"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white border border-gray-200 shadow-sm">
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                )}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {group.projectName}
              </span>
              <span className="px-2 py-0.5 bg-white border border-gray-100 text-gray-500 text-[11px] font-semibold rounded-full shadow-sm">
                {group.issues.length}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2.5 px-2 pb-2 pt-1">
                    {group.issues.map(issue => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        onClick={onIssueClick}
                        onPin={onPin}
                        onUnpin={onPin}
                        onFixIssue={onFixIssue}
                        variant={
                          isPinned?.(issue.iid, issue.project_id)
                            ? 'pinned'
                            : 'default'
                        }
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading more issues...
          </div>
        </div>
      )}
    </div>
  );
};
