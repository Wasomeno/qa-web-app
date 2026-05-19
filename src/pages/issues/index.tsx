import React, { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { IssueFilterState } from "@/types/issues";
import { useDebounce } from "@/utils/useDebounce";
import { IssueFilterBar } from "./components/filter-bar";
import { IssueList } from "./components/issue-list";
import { QuickFilterChips } from "./components/quick-filter-chips";
import { FixIssueModal } from "./components/fix-issue-modal";
import { useGetLabels } from "@/hooks/use-get-labels";
import { useGetIssues } from "./hooks/use-get-issues";
import { useGetLoggedInUser } from "@/hooks/use-get-logged-in-user";
import { usePinnedIssues } from "@/hooks/use-pinned-issues";
import { Issue } from "@/api/issue";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface IssuesPageProps {
  initialIssue?: Issue | null;
  portalContainer?: HTMLElement | null;
  appProjectId?: string;
  title?: string;
  description?: string;
  hideHeader?: boolean;
}

export const IssuesPage: React.FC<IssuesPageProps> = ({
  initialIssue,
  portalContainer,
  appProjectId,
  title = "Issues",
  description = "Manage issues across your projects",
  hideHeader = false,
}) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useLocalStorage<IssueFilterState>(
    "issues-filters",
    {
      search: "",
      projectIds: [],
      status: "ALL",
      labels: [],
      assigneeIds: ["ALL"],
      sort: "UPDATED",
      quickFilters: {
        assignedToMe: false,
        createdByMe: false,
        highPriority: false,
        inQa: false,
        blocked: false,
        hasOpenMr: false,
        unassigned: false,
      },
    },
  );

  const debouncedSearch = useDebounce(filters.search, 300);

  const memoizedFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
      projectIds: appProjectId ? [appProjectId] : filters.projectIds,
    }),
    [filters, debouncedSearch, appProjectId],
  );

  // Fetch filter options
  // For labels, we use the first project if only one is selected, otherwise 'ALL'
  const labels = useGetLabels(
    appProjectId ||
      (filters.projectIds.length === 1 ? filters.projectIds[0] : "ALL"),
    { appProject: !!appProjectId },
  );

  const issues = useGetIssues(memoizedFilters, {
    projectScoped: !!appProjectId,
  });
  const { togglePin, isPinned } = usePinnedIssues();

  // State for Fix with Agent modal
  const [fixingIssue, setFixingIssue] = useState<Issue | null>(null);

  // Track if user is still loading - we need this to show proper loading state
  const isUserLoading = useGetLoggedInUser().isLoading;

  // Show loading skeleton while either user is loading or issues are fetching
  const isInitialLoading = isUserLoading || issues.isLoading;

  const labelOptions = useMemo(() => {
    return labels.data.map((l) => ({
      label: l.name,
      value: l.name,
    }));
  }, [labels.data]);

  const handleFilterChange = <K extends keyof IssueFilterState>(
    key: K,
    value: IssueFilterState[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleQuickFilterToggle = (
    key: keyof IssueFilterState["quickFilters"],
  ) => {
    setFilters((prev) => ({
      ...prev,
      quickFilters: {
        ...prev.quickFilters,
        [key]: !prev.quickFilters[key],
      },
    }));
  };

  const selectedIssue = initialIssue || null;

  // If an initial issue is provided, redirect to the standalone route
  if (selectedIssue) {
    navigate({
      to: "/issues/$projectId/$iid",
      params: {
        projectId: String(selectedIssue.project_id),
        iid: String(selectedIssue.iid),
      },
      replace: true,
    });
  }

  console.log("ISSUEs", issues.data);

  return (
    <div className="flex flex-1 w-full flex-col overflow-hidden bg-[#F9FAFB]">
      {/* Header & Filters */}
      <div
        className={`flex-none space-y-5 px-4 md:px-8 border-b border-gray-100/80 bg-white/80 backdrop-blur-xl z-10 ${hideHeader ? "pt-4 pb-4" : "pt-6 md:pt-10 pb-6"}`}
      >
        {!hideHeader && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                {title}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
          </div>
        )}
        <IssueFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          labelOptions={labelOptions}
          portalContainer={portalContainer}
          hideProjectFilter={!!appProjectId}
        />
        <QuickFilterChips
          filters={filters.quickFilters}
          onToggle={handleQuickFilterToggle}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full overflow-y-auto overscroll-contain px-4 md:px-8 py-6 md:py-8">
        <IssueList
          issues={issues.data}
          isLoading={isInitialLoading}
          isProjectFiltered={!!appProjectId || filters.projectIds.length === 1}
          onIssueClick={(issue) =>
            appProjectId
              ? navigate({
                  to: "/projects/$id/issues/$iid",
                  params: { id: appProjectId, iid: String(issue.iid) },
                })
              : navigate({
                  to: "/issues/$projectId/$iid",
                  params: {
                    projectId: String(issue.project_id),
                    iid: String(issue.iid),
                  },
                })
          }
          onPin={togglePin}
          isPinned={isPinned}
          onFixIssue={setFixingIssue}
        />
      </div>
      {fixingIssue && (
        <FixIssueModal
          issue={fixingIssue}
          isOpen={true}
          onClose={() => setFixingIssue(null)}
          portalContainer={portalContainer}
          appProjectId={appProjectId}
        />
      )}
    </div>
  );
};

export default IssuesPage;
