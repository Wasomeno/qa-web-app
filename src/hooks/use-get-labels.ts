import { getAppProjectLabels, getProjectLabels } from "@/api/project";
import { useQuery } from "@tanstack/react-query";

export function useGetLabels(
  projectId?: string | number,
  options?: { appProject?: boolean },
) {
  const isProjectSelected = projectId && projectId !== "ALL";

  const query = useQuery({
    queryKey: [options?.appProject ? "app-labels" : "labels", projectId],
    queryFn: () =>
      options?.appProject
        ? getAppProjectLabels(projectId!)
        : getProjectLabels(projectId!),
    enabled: !!isProjectSelected,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    ...query,
    data: Array.isArray(query.data?.data)
      ? query.data.data
      : query.data?.data?.labels || [],
  };
}
