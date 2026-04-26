import { createIssueWithChild, CreateIssueWithChildRequest } from '@/api/issue';
import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';

export function useCreateIssueWithChild(
  options?: Omit<UseMutationOptions<
    any,
    Error,
    { projectId: number; request: CreateIssueWithChildRequest }
  >, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      projectId: number;
      request: CreateIssueWithChildRequest;
    }) => createIssueWithChild(data.projectId, data.request),
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context, null as any);
      }
    },
  });
}
