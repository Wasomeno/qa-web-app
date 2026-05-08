import { api } from '@/services/api';

export interface ChatSession {
  session_id: string;
  last_update_time: string;
  preview: string;
}

export interface ChatMessageFromApi {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  parts?: string[];
}

export interface ChatSessionDetail {
  session_id: string;
  last_update_time: string;
  messages: ChatMessageFromApi[];
  message_count: number;
}

// GET /agent/chat-sessions - List all chat sessions
export async function getChatSessions(): Promise<ChatSession[]> {
  const response = await api.get<{ sessions: ChatSession[] }>('/agent/chat-sessions');
  
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to get chat sessions');
  }

  return response.data.sessions || [];
}

// GET /agent/chat-sessions/:sessionId - Get a specific chat session with messages
export async function getChatSession(sessionId: string): Promise<ChatSessionDetail> {
  const response = await api.get<ChatSessionDetail>(`/agent/chat-sessions/${sessionId}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to get chat session');
  }

  return response.data;
}

// DELETE /agent/chat-sessions/:sessionId - Delete a chat session
export async function deleteChatSession(sessionId: string): Promise<void> {
  const response = await api.delete(`/agent/chat-sessions/${sessionId}`);
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to delete chat session');
  }
}
