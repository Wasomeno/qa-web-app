import { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '../components/chat-message';
import { useStreamEvents, StreamEvent } from './use-stream-events';

// Module-level cache so messages survive component unmount/remount across navigation.
const messageCache = new Map<string, Message[]>();

interface UseAgentOptions {
  sessionId?: string;
  initialMessages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
  /** API endpoint for the chat request. Defaults to /api/agent/chat */
  endpoint?: string;
}

export const useAgent = (options?: UseAgentOptions) => {
  const [sessionId] = useState(() => options?.sessionId || crypto.randomUUID());

  const [messages, setMessages] = useState<Message[]>(
    () => messageCache.get(sessionId) ?? options?.initialMessages ?? []
  );
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);

  // Track which session is currently being processed for stream events
  const activeSessionIdRef = useRef<string | null>(null);

  // Store the callback in a ref to avoid dependency issues
  const onMessagesChangeRef = useRef(options?.onMessagesChange);
  onMessagesChangeRef.current = options?.onMessagesChange;

  // Track if this is the initial mount to avoid calling onMessagesChange on first render
  const isInitialMountRef = useRef(true);

  // Subscribe to stream events to update progress message dynamically
  // We don't filter by resourceId so we receive all events
  useStreamEvents({
    enabled: isAgentLoading,
    onEvent: (event: StreamEvent) => {
      // Update progress message for any agent event that has a meaningful message
      if (event.type === 'agent') {
        if (event.stage === 'start' || event.stage === 'thinking') {
          // Show actual progress message
          if (event.message && event.message !== 'Agent is processing...') {
            setProgressMessage(event.message);
          }
        }
        // For done stage, keep the current message briefly then it will be cleared
      }
    },
  });

  // Keep the module-level cache in sync and notify parent on change.
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    messageCache.set(sessionId, messages);
    onMessagesChangeRef.current?.(messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string, files: File[] = []) => {
      // Convert files to base64 for sending to backend
      const base64Attachments: Array<{ name: string; mimeType: string; data: string }> = [];
      for (const file of files) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Strip data URL prefix: "data:<mime>;base64,<data>"
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        base64Attachments.push({
          name: file.name,
          mimeType: file.type,
          data: base64,
        });
      }

      // Create attachment entries for message display
      // Use a small data URL for display so images persist after File/blob revocation
      const attachments = files.map((file, i) => ({
        name: file.name,
        type: file.type,
        url: base64Attachments[i]
          ? `data:${file.type};base64,${base64Attachments[i].data}`
          : URL.createObjectURL(file),
      }));

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: Date.now(),
        attachments: attachments.length > 0 ? attachments : undefined,
      };
      setMessages(prev => [...prev, userMsg]);
      setIsAgentLoading(true);
      setProgressMessage('Agent is thinking...');
      activeSessionIdRef.current = sessionId;

      const responseId = (Date.now() + 1).toString();

      try {
        // Use direct fetch with POST to agent chat endpoint
        const authSessionId = localStorage.getItem('qa_webapp_session_id');
        const url = new URL(options?.endpoint || '/api/agent/chat', window.location.origin);
        if (authSessionId) {
          url.searchParams.set('session_id', authSessionId);
        }

        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authSessionId ? {
              'X-Session-ID': authSessionId,
              'Authorization': `Bearer ${authSessionId}`
            } : {})
          },
          body: JSON.stringify({
            input: content,
            session_id: sessionId,
            attachments: base64Attachments.length > 0 ? base64Attachments : undefined,
          }),
        });

        console.log('[useAgent] Response status:', response.status, response.statusText);
        console.log('[useAgent] Response headers:', [...(response.headers.entries())]);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Handle SSE stream response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let receivedFinal = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('[useAgent] Stream ended. receivedFinal:', receivedFinal);
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          console.log('[useAgent] Raw buffer chunk:', JSON.stringify(buffer));
          
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            console.log('[useAgent] Processing line:', JSON.stringify(line));
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                console.log('[useAgent] Parsed SSE event:', data);

                if (data.event === 'progress' && data.data?.message) {
                  // Only update the status indicator — never put progress chunks into the
                  // message bubble. Tool-call lines (e.g. "Calling X", "X completed") would
                  // otherwise appear as content. The clean response arrives via `final`.
                  setProgressMessage(data.data.message);
                } else if (data.event === 'final') {
                  receivedFinal = true;
                  setIsAgentLoading(false);
                  setProgressMessage(null);
                  activeSessionIdRef.current = null;

                  const responseContent = data.data?.content || data.data?.response || data.data;
                  const responseActivities = data.data?.activities || data.data?.tool_calls;
                  console.log('[useAgent] Final event received. Content length:', typeof responseContent === 'string' ? responseContent.length : 'not string');

                  if (responseContent) {
                    // Strip any embedded tool-call lines from the content string
                    const rawContent = typeof responseContent === 'string'
                      ? responseContent
                      : JSON.stringify(responseContent);
                    const cleanContent = rawContent
                      .split('\n')
                      .filter(line => !line.startsWith('Calling tool:') && !line.startsWith('Tool result:'))
                      .join('\n')
                      .trim();

                    setMessages(prev => {
                      const existingIndex = prev.findIndex(m => m.id === responseId);
                      const newMessage: Message = {
                        id: responseId,
                        role: 'assistant',
                        content: cleanContent,
                        timestamp: Date.now(),
                        activities: Array.isArray(responseActivities) ? responseActivities : undefined,
                      };

                      if (existingIndex >= 0) {
                        const newMessages = [...prev];
                        newMessages[existingIndex] = newMessage;
                        return newMessages;
                      } else {
                        return [...prev, newMessage];
                      }
                    });
                  }
                  return;
                } else if (data.event === 'error') {
                  throw new Error(data.data?.message || 'Agent error');
                }
              } catch (parseError) {
                console.warn('[useAgent] Failed to parse SSE data:', parseError);
              }
            }
          }
        }

        // If we get here without a final event, something went wrong
        if (!receivedFinal) {
          console.warn('[useAgent] Stream ended without final event');
        }
        setIsAgentLoading(false);
        setProgressMessage(null);
        activeSessionIdRef.current = null;

      } catch (error: any) {
        console.error('[useAgent] Error:', error);
        setMessages(prev => [
          ...prev,
          {
            id: responseId,
            role: 'error',
            content: `Error: ${error.message}`,
            timestamp: Date.now(),
          },
        ]);
        setIsAgentLoading(false);
        setProgressMessage(null);
        activeSessionIdRef.current = null;
      }
    },
    [sessionId, options?.endpoint]
  );

  // Reset messages and clear the cache for this session
  const resetMessages = useCallback((newMessages?: Message[]) => {
    const next = newMessages || [];
    messageCache.set(sessionId, next);
    setMessages(next);
  }, [sessionId]);

  return {
    messages,
    isAgentLoading,
    progressMessage,
    sendMessage,
    resetMessages,
    sessionId,
  };
};
