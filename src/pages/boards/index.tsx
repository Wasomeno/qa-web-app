import React, { useState } from 'react';
import { Rows3, Rows2, KanbanSquare } from 'lucide-react';
import { ProjectFilter } from './components/project-filter';
import { ProjectBoardView } from './components/project-board-view';
import { useGetProjectBoards } from './hooks/use-get-project-boards';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectBoard } from './mock-data';
import { updateIssue } from '@/api/issue';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';

interface BoardsPageProps {
  portalContainer?: HTMLDivElement | null;
  onNavigateToIssue?: (issue: any) => void;
}

export const BoardsPage: React.FC<BoardsPageProps> = ({
  portalContainer,
  onNavigateToIssue,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useLocalStorage<
    string | number | undefined
  >('boards-project-id', undefined);

  const [density, setDensity] = useLocalStorage<'comfortable' | 'compact'>(
    'boards-density',
    'comfortable'
  );

  const activeProjectId = selectedProjectId;

  const {
    data: boards = [],
    isLoading: isLoadingBoards,
    isFetching: isFetchingBoards,
  } = useGetProjectBoards(Number(activeProjectId));

  const queryClient = useQueryClient();

  // Select the first board by default (API returns list of boards)
  const selectedBoardData = boards[0];

  const handleProjectSelect = (projectId: string | number) => {
    setSelectedProjectId(projectId);
  };

  const handleMoveIssue = async (
    issueId: string,
    sourceColId: string,
    targetColId: string
  ) => {
    if (!selectedBoardData || !activeProjectId) return;

    // Find Columns
    const sourceList = selectedBoardData.lists.find(
      l => l.id.toString() === sourceColId
    );
    const targetList = selectedBoardData.lists.find(
      l => l.id.toString() === targetColId
    );

    if (!sourceList || !targetList) return;

    // Find Issue IID
    const issue = sourceList.issues.find(i => i.id.toString() === issueId);
    if (!issue) return;

    try {
      const updateData: any = {};

      // Handle Labels
      if (targetList.label) {
        updateData.add_labels = [targetList.label.name];
      }
      if (sourceList.label) {
        updateData.remove_labels = [sourceList.label.name];
      }

      if (Object.keys(updateData).length > 0) {
        await updateIssue(Number(activeProjectId), issue.iid, updateData);
        toast.success('Issue moved');
        queryClient.invalidateQueries({ queryKey: ['project-boards'] });
      }
    } catch {
      toast.error('Failed to move issue');
    }
  };

  // Map API data to UI model
  const mappedBoard: ProjectBoard | undefined = selectedBoardData
    ? {
        id: selectedBoardData.id.toString(),
        name: selectedBoardData.name,
        avatarUrl: undefined,
        columns: (selectedBoardData.lists ?? [])
          .map(list => ({
            id: list.id.toString(),
            title: list.label?.name || `List ${list.position}`,
            color: list.label?.color,
            textColor: list.label?.text_color,
            label: list.label ? {
              name: list.label.name,
              color: list.label.color,
              text_color: list.label.text_color,
            } : undefined,
            issues: (list.issues ?? []).map(issue => ({
              id: issue.id.toString(),
              iid: issue.iid,
              title: issue.title,
              weight: 0,
              projectId: activeProjectId ? Number(activeProjectId) : 0,
              projectName: '',
              webUrl: '',
              assignee: issue.assignees?.[0]
                ? {
                    id: issue.assignees[0].id.toString(),
                    name: issue.assignees[0].name,
                    username: issue.assignees[0].username,
                    avatarUrl: issue.assignees[0].avatar_url,
                  }
                : undefined,
              labels: (issue.labels ?? []).map(label => ({
                id: label.id.toString(),
                name: label.name,
                color: label.color,
                textColor: label.text_color as string,
              })),
            })),
          }))
          .sort(() => 0),
      }
    : undefined;

  // Only show skeletons when there's no cached board data at all (initial load).
  // Board content is never affected by project search refetches.
  const isBoardLoading = isLoadingBoards && !boards.length;

  return (
    <div className="h-full flex flex-col">
      {/* Header & Filters */}
      <div className="flex-none px-4 md:px-8 pt-6 md:pt-10 pb-6 border-b border-gray-100/80 bg-white/80 backdrop-blur-xl z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
              Issue Boards
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop issues to move them across your workflow
            </p>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
            {/* Density Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-100 shrink-0">
              <button
                onClick={() => setDensity('comfortable')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
                  density === 'comfortable'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
                title="Comfortable view"
              >
                <Rows3 className="w-3.5 h-3.5" />
                Comfortable
              </button>
              <button
                onClick={() => setDensity('compact')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
                  density === 'compact'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
                title="Compact view"
              >
                <Rows2 className="w-3.5 h-3.5" />
                Compact
              </button>
            </div>

            <div className="h-6 w-px bg-gray-200" />

            {isBoardLoading ? (
              <Skeleton className="h-9 w-[180px] md:w-[250px] shrink-0" />
            ) : (
              <ProjectFilter
                selectedProjectIds={activeProjectId ? [activeProjectId] : []}
                onSelect={handleProjectSelect}
                portalContainer={portalContainer}
                singleSelect={true}
                className="w-[180px] md:w-[260px] shrink-0"
              />
            )}
          </div>
        </div>
      </div>

      {/* Boards Content */}
      <div
        className="flex-1 flex flex-col w-full overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="flex flex-1 flex-col w-full">
          {isBoardLoading ? (
            <div className="flex flex-1 gap-4 px-6 py-4 min-w-min overflow-hidden">
              <Skeleton className="w-[280px] rounded-xl" />
              <Skeleton className="w-[280px] rounded-xl" />
              <Skeleton className="w-[280px] rounded-xl" />
            </div>
          ) : mappedBoard ? (
            <div className="flex flex-1 flex-col w-full">
              {/* Horizontal Board Area */}
              <div className="flex-1 flex-col flex w-full overflow-x-auto custom-scrollbar">
                <ProjectBoardView
                  key={mappedBoard.id}
                  project={mappedBoard}
                  projectId={activeProjectId ? Number(activeProjectId) : undefined}
                  density={density}
                  onOpenIssue={issue => {
                    // Map BoardIssue to structure expected by IssueDetail
                    onNavigateToIssue?.({
                      id: Number(issue.id),
                      iid: issue.iid,
                      title: issue.title,
                      project_id: issue.projectId,
                      project_name: issue.projectName,
                      description: '',
                      state: 'opened',
                      web_url: issue.webUrl,
                      author: { name: 'Unknown', avatar_url: '' },
                      assignees: issue.assignee
                        ? [
                            {
                              id: Number(issue.assignee.id),
                              name: issue.assignee.name,
                              username: issue.assignee.username,
                              avatar_url: issue.assignee.avatarUrl,
                            },
                          ]
                        : [],
                      labels: (issue.labels ?? []).map(l => l.name),
                      label_details: (issue.labels ?? []).map(l => ({
                        id: Number(l.id.split('-')[0]) || 0,
                        name: l.name,
                        color: l.color,
                        text_color: l.textColor,
                      })),
                      created_at: new Date().toISOString(),
                      merge_requests_count: 0,
                    });
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                <KanbanSquare className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-600">
                {activeProjectId
                  ? 'No boards found for this project.'
                  : 'Select a project to view boards.'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {activeProjectId
                  ? 'Try selecting a different project.'
                  : 'Choose a project from the filter above.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
