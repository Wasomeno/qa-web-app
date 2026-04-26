import { createIssue, CreateIssueRequest } from '@/api/issue';
import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';

export function useCreateIssue(
  options?: Omit<UseMutationOptions<any, Error, { projectId: number; request: CreateIssueRequest }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: number; request: CreateIssueRequest }) =>
      createIssue(data.projectId, data.request),
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context, null as any);
      }
    },
  });
}
