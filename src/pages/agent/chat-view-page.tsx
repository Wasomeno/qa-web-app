import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useChatSessions } from './hooks/use-chat-sessions';
import { useAgent } from './hooks/use-agent';
import { ChatMessage, Message } from './components/chat-message';
import { ChatInput } from './components/chat-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useChatSessionApi, ChatMessageFromApi } from '@/hooks/use-chat-sessions-api';

interface ChatViewPageProps {
  sessionId: string;
}

function convertApiMessagesToMessages(apiMessages: ChatMessageFromApi[]): Message[] {
  return apiMessages.map((msg, index) => ({
    id: `msg-${index}-${Date.now()}`,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    timestamp: new Date(msg.timestamp).getTime(),
  }));
}

export const ChatViewPage: React.FC<ChatViewPageProps> = ({ sessionId }) => {
  const navigate = useNavigate();
  const { sessions, saveSession } = useChatSessions();
  
  const { data: apiSession, isLoading: isLoadingApi } = useChatSessionApi(sessionId);
  
  // Local session
  const localSession = useMemo(() => sessions.find((s) => s.id === sessionId), [sessions, sessionId]);
  
  // API messages converted
  const apiMessages = useMemo(() => {
    if (!apiSession) return null;
    return convertApiMessagesToMessages(apiSession.messages);
  }, [apiSession]);

  // Initial messages to pass to useAgent
  const [initialMessages, setInitialMessages] = useState<Message[] | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized) {
      if (apiMessages) {
        setInitialMessages(apiMessages);
        setHasInitialized(true);
      } else if (localSession) {
        setInitialMessages(localSession.messages);
        setHasInitialized(true);
      } else if (!isLoadingApi) {
        // If not loading and no api/local session found
        setInitialMessages([]);
        setHasInitialized(true);
      }
    }
  }, [apiMessages, localSession, isLoadingApi, hasInitialized]);

  // Handle back
  const handleBack = () => {
    navigate({ to: '/chat-sessions' });
  };

  if (isLoadingApi && !hasInitialized) {
    return (
      <div className="flex flex-col h-full w-full bg-background items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Loading session...</p>
      </div>
    );
  }

  if (hasInitialized && initialMessages === null && !apiSession && !localSession) {
    return (
      <div className="flex flex-col h-full w-full bg-background items-center justify-center text-center p-4">
        <p className="text-muted-foreground">Session not found</p>
        <Button onClick={handleBack} className="mt-4">
          Back to Sessions
        </Button>
      </div>
    );
  }

  const title = apiSession?.preview || localSession?.title || 'Chat Session';

  return (
    <div className="flex flex-col h-full w-full bg-background relative">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold truncate">
            {title}
          </h2>
          <p className="text-[10px] text-muted-foreground">
            {sessionId}
          </p>
        </div>
      </div>

      {hasInitialized && initialMessages !== null ? (
        <ChatContent 
          sessionId={sessionId} 
          initialMessages={initialMessages} 
          saveSession={saveSession} 
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

interface ChatContentProps {
  sessionId: string;
  initialMessages: Message[];
  saveSession: (sessionId: string, messages: Message[]) => void;
}

const ChatContent: React.FC<ChatContentProps> = ({ sessionId, initialMessages, saveSession }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize agent hook
  const {
    messages,
    isAgentLoading,
    progressMessage,
    sendMessage,
  } = useAgent({
    sessionId,
    initialMessages,
    onMessagesChange: useCallback(
      (msgs: Message[]) => {
        if (sessionId && msgs.length > 0) {
          saveSession(sessionId, msgs);
        }
      },
      [sessionId, saveSession]
    ),
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isAgentLoading, progressMessage]);

  // Handle send message using the hook's sendMessage
  const handleSendMessage = useCallback(
    async (value: string, files?: File[]) => {
      if (!value.trim() && (!files || files.length === 0)) return;
      await sendMessage(value, files);
    },
    [sendMessage]
  );

  return (
    <>
      <ScrollArea className="flex-1 w-full" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col min-h-full justify-end">
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((msg: Message) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {isAgentLoading && (
                <motion.div
                  key="loading-indicator"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    overflow: 'hidden',
                    transition: { duration: 0.15 },
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="flex w-full gap-3 py-4"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 relative">
                    <Bot className="h-5 w-5 text-primary" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 rounded-full bg-primary/20"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-1.5 px-4 py-3 bg-muted/40 backdrop-blur-sm rounded-2xl rounded-tl-none border shadow-sm">
                      <motion.div
                        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          delay: 0,
                          ease: 'easeInOut',
                        }}
                        className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          delay: 0.15,
                          ease: 'easeInOut',
                        }}
                        className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          delay: 0.3,
                          ease: 'easeInOut',
                        }}
                        className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                      />
                    </div>
                    {progressMessage && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] text-muted-foreground px-1 font-medium italic"
                      >
                        {progressMessage}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="w-full shrink-0 border-t bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative">
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isAgentLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
};
