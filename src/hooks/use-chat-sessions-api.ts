import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatSessions, getChatSession, deleteChatSession, ChatSession, ChatSessionDetail, ChatMessageFromApi } from '@/api/chat-session';

export function useChatSessionsApi() {
  return useQuery<ChatSession[]>({
    queryKey: ['chat-sessions'],
    queryFn: getChatSessions,
  });
}

export function useChatSessionApi(sessionId: string | null) {
  return useQuery<ChatSessionDetail>({
    queryKey: ['chat-session', sessionId],
    queryFn: () => getChatSession(sessionId!),
    enabled: !!sessionId,
  });
}

export function useDeleteChatSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteChatSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
}

export type { ChatSession, ChatSessionDetail, ChatMessageFromApi };
