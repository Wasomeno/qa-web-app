import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getProjectIssuesPaginated,
  getIssuesPaginated,
  Issue,
} from "@/api/issue";
import { IssueFilterState } from "@/types/issues";
import { useGetLoggedInUser } from "@/hooks/use-get-logged-in-user";
import { useCallback, useEffect, useMemo, useRef } from "react";

// Dummy Label Names as per request
const LABEL_NAMES = {
  HIGH_PRIORITY: "High Priority",
  IN_QA: "In QA",
  BLOCKED: "Blocked",
};

const ISSUES_PER_PAGE = 20;

export function useGetIssues(
  filters?: Partial<IssueFilterState>,
  options?: { projectScoped?: boolean },
) {
  const { data: currentUser, isLoading: isUserLoading } = useGetLoggedInUser();

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      "issues",
      filters?.search,
      filters?.projectIds,
      filters?.status,
      filters?.labels,
      filters?.issueIds,
      filters?.assigneeIds,
      filters?.quickFilters,
      options?.projectScoped,
      currentUser?.id ?? "anonymous",
    ],
    queryFn: async ({ pageParam = 1 }) => {
      // If issueIds is provided but empty, return empty result immediately
      if (filters?.issueIds && filters.issueIds.length === 0) {
        return { data: [], page: 1, per_page: ISSUES_PER_PAGE, hasMore: false };
      }

      // If no filters at all, fetch default global issues
      if (!filters) return getIssuesPaginated({ page: pageParam, per_page: ISSUES_PER_PAGE });

      const labels: string[] = [];
      if (filters.quickFilters?.highPriority)
        labels.push(LABEL_NAMES.HIGH_PRIORITY);
      if (filters.quickFilters?.inQa) labels.push(LABEL_NAMES.IN_QA);
      if (filters.quickFilters?.blocked) labels.push(LABEL_NAMES.BLOCKED);

      // Add any manually selected labels
      if (filters.labels && filters.labels.length > 0) {
        const activeLabels = filters.labels.filter((l) => l !== "ALL");
        labels.push(...activeLabels);
      }

      let assigneeId: number | string | null | undefined = undefined;
      let assigneeIds: string | undefined = undefined;

      const activeAssigneeIds = (filters.assigneeIds || []).filter(
        (id) => id !== "ALL",
      );
      if (activeAssigneeIds.length > 0) {
        const ids = activeAssigneeIds.map((id) => {
          if (id === "ME" && currentUser) return currentUser.id;
          return id;
        });

        if (ids.length === 1) {
          assigneeId = ids[0];
        } else {
          assigneeIds = ids.join(",");
        }
      } else if (filters.quickFilters?.assignedToMe && currentUser) {
        assigneeId = currentUser.id;
      } else if (filters.quickFilters?.unassigned) {
        assigneeId = "None";
      }

      let authorId: number | string | undefined = undefined;
      if (filters.quickFilters?.createdByMe && currentUser) {
        authorId = currentUser.id;
      }

      const params: any = {
        search: filters.search || undefined,
        state:
          filters.status && filters.status !== "ALL"
            ? filters.status.toLowerCase()
            : undefined,
        labels: labels.length > 0 ? labels : undefined,
        assignee_id: assigneeId,
        assignee_ids: assigneeIds,
        author_id: authorId,
        page: pageParam,
        per_page: ISSUES_PER_PAGE,
      };

      if (filters.issueIds && filters.issueIds.length > 0) {
        params.issue_ids = filters.issueIds.join(",");
      }

      const projectIds = (filters.projectIds || []).filter(
        (id) => id !== "ALL",
      );
      if (projectIds.length > 0) {
        if (projectIds.length === 1) {
          if (options?.projectScoped) {
            return getProjectIssuesPaginated(projectIds[0], params);
          }
          return getIssuesPaginated({
            ...params,
            project_id: Number(projectIds[0]),
          });
        } else {
          return getIssuesPaginated({
            ...params,
            project_ids: projectIds.join(","),
          });
        }
      } else {
        return getIssuesPaginated({
          ...params,
          project_id: undefined,
        });
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.page + 1;
    },
    enabled: !isUserLoading,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Flatten and dedupe pages into a single array
  const data = useMemo(() => {
    const seen = new Set<number>();
    return (infiniteData?.pages.flatMap((page) => page.data) ?? []).filter(
      (issue) => {
        if (seen.has(issue.id)) return false;
        seen.add(issue.id);
        return true;
      },
    );
  }, [infiniteData]);

  // Scroll ref for the scrollable container
  const scrollRef = useRef<HTMLDivElement>(null);

  const maybeFetchNextPage = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight <= 300) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Also check after data/layout changes so we load again if the first page
  // doesn't fill the scroll container enough to create a scroll event.
  useEffect(() => {
    maybeFetchNextPage();
  }, [maybeFetchNextPage, data.length]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    scrollRef,
    maybeFetchNextPage,
  };
}
