import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getIssues, Issue } from '@/api/issue';
import { PinnedIssueMeta } from '@/types/issues';

export type PinnedIssue = Issue & { pinnedMeta: PinnedIssueMeta };

export const usePinnedIssues = () => {
  const [pinnedMap, setPinnedMap] = useState<Record<string, PinnedIssueMeta>>({});
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  useEffect(() => {
    // Initial load from localStorage
    const stored = localStorage.getItem('pinned_issues');
    if (stored) {
      try {
        setPinnedMap(JSON.parse(stored));
      } catch (e) {
        setPinnedMap({});
      }
    }
    setIsStorageLoaded(true);

    const listener = (e: StorageEvent) => {
      if (e.key === 'pinned_issues' && e.newValue) {
        try {
          setPinnedMap(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };

    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);

  const updateStorage = (newMap: Record<string, PinnedIssueMeta>) => {
    setPinnedMap(newMap);
    localStorage.setItem('pinned_issues', JSON.stringify(newMap));
    // Trigger custom event for same-window updates
    window.dispatchEvent(new StorageEvent('storage', { key: 'pinned_issues', newValue: JSON.stringify(newMap) }));
  };

  const pinnedEntries = Object.entries(pinnedMap);

  // Fetch all pinned issues in one batch
  const allIids = pinnedEntries
    .map(([key]) => {
      const parts = key.split('-');
      // Format: "projectId-iid" or legacy "iid"
      return parts.length === 2 ? parts[1] : parts[0];
    })
    .join(',');

  const { data: fetchedIssues, isLoading: isFetching } = useQuery({
    queryKey: ['pinned-issues-batch', allIids],
    queryFn: () => getIssues({ issue_ids: allIids }),
    enabled: isStorageLoaded && allIids.length > 0,
    staleTime: 1000 * 60 * 5, // 5 mins
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const isLoading = !isStorageLoaded || (allIids.length > 0 && isFetching);

  const pinnedIssues: PinnedIssue[] = (fetchedIssues?.data || [])
    .map((issue: any) => ({
      ...issue,
      pinnedMeta: pinnedMap[`${issue.project_id}-${issue.iid}`],
    }))
    .filter((issue: any) => !!issue.pinnedMeta) // Filter out issues that might have matched ID but wrong project (if any) or aren't in map
    .sort((a: any, b: any) => {
      return (
        new Date(b.pinnedMeta.pinnedAt).getTime() -
        new Date(a.pinnedMeta.pinnedAt).getTime()
      );
    });

  const togglePin = async (issue: Issue) => {
    const key = `${issue.project_id}-${issue.iid}`;
    const newMap = { ...pinnedMap };
    if (newMap[key]) {
      delete newMap[key];
    } else {
      newMap[key] = { pinnedAt: new Date().toISOString() } as PinnedIssueMeta;
    }
    updateStorage(newMap);
  };

  const updatePinMeta = async (
    issueIid: number,
    projectId: number,
    meta: Partial<PinnedIssueMeta>
  ) => {
    const key = `${projectId}-${issueIid}`;
    if (!pinnedMap[key]) return;
    
    const newMap = {
      ...pinnedMap,
      [key]: { ...pinnedMap[key], ...meta }
    };
    updateStorage(newMap);
  };

  const isPinned = (issueIid: number, projectId: number) =>
    !!pinnedMap[`${projectId}-${issueIid}`];

  return {
    pinnedIssues,
    isLoading,
    togglePin,
    updatePinMeta,
    isPinned,
  };
};
