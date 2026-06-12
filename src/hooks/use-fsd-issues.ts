import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createFSDIssues,
  previewFSDIssues,
  type CreateFSDIssuesRequest,
  type PreviewFSDIssuesRequest,
} from "@/api/fsd-issues";

export function usePreviewFSDIssues(projectId: string | number | undefined) {
  return useMutation({
    mutationFn: (request: PreviewFSDIssuesRequest) =>
      previewFSDIssues(projectId!, request),
  });
}

export function useCreateFSDIssues(projectId: string | number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateFSDIssuesRequest) =>
      createFSDIssues(projectId!, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["project-boards"] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["project-boards", projectId] });
      }
    },
  });
}
