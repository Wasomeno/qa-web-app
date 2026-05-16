import { getProjectLabels } from "@/api/project";
import { useQuery } from "@tanstack/react-query";

export function useGetProjectLabels(projectId?: number | string) {
  const query = useQuery({
    queryKey: ["project-labels", projectId],
    queryFn: () => getProjectLabels(projectId!),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const labels = Array.isArray(query.data?.data)
    ? query.data.data
    : query.data?.data?.labels || [];

  return { ...query, data: labels };
}
