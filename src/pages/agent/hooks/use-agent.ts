import { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '../components/chat-message';
import { useStreamEvents, StreamEvent } from './use-stream-events';

interface UseAgentOptions {
  sessionId?: string;
  initialMessages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
}

export const useAgent = (options?: UseAgentOptions) => {
  const [messages, setMessages] = useState<Message[]>(
    options?.initialMessages || []
  );
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [sessionId] = useState(() => options?.sessionId || crypto.randomUUID());

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

  // Notify parent when messages change - but skip initial mount to avoid circular updates
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    
    // Call the ref-based callback to avoid dependency issues
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
        const response = await fetch('/api/agent/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: content,
            session_id: sessionId,
            attachments: base64Attachments.length > 0 ? base64Attachments : undefined,
          }),
        });

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

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                console.log('[useAgent] SSE event:', data);

                if (data.event === 'progress' && data.data?.message) {
                  setProgressMessage(data.data.message);
                } else if (data.event === 'final') {
                  setIsAgentLoading(false);
                  setProgressMessage(null);
                  activeSessionIdRef.current = null;

                  const responseContent = data.data?.content || data.data?.response || data.data;
                  if (responseContent) {
                    setMessages(prev => [
                      ...prev,
                      {
                        id: responseId,
                        role: 'assistant',
                        content: typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent),
                        timestamp: Date.now(),
                      },
                    ]);
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
    [sessionId]
  );

  // Reset messages
  const resetMessages = useCallback((newMessages?: Message[]) => {
    setMessages(newMessages || []);
  }, []);

  return {
    messages,
    isAgentLoading,
    progressMessage,
    sendMessage,
    resetMessages,
    sessionId,
  };
};
