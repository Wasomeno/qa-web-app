import { useQuery } from "@tanstack/react-query";
import { getProjectBoards } from "@/api/project";

export function useGetProjectBoards(projectId?: number | string | null) {
  const query = useQuery({
    queryKey: ["project-boards", projectId],
    queryFn: () => getProjectBoards(projectId!),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    ...query,
    data: query.data?.data?.boards || [],
  };
}
