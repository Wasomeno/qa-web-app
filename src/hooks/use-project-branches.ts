import { useQuery } from "@tanstack/react-query";
import { getProjectBranches, type GitLabBranch } from "@/api/project";

export function useProjectBranches(
  projectId: string | number | undefined,
  search?: string,
) {
  return useQuery({
    queryKey: ["project-branches", projectId, search],
    queryFn: () => getProjectBranches(projectId!, search),
    enabled: !!projectId,
    select: (data) => data.data?.branches ?? [],
    staleTime: search ? 0 : 2 * 60 * 1000, // no cache when searching, 2 min otherwise
    placeholderData: (prev) => prev, // keep previous results while searching
  });
}
