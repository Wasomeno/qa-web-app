import React, { useRef, useEffect, useCallback } from 'react';
import { Bot, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/pages/agent/components/chat-message';
import { ChatInput } from '@/pages/agent/components/chat-input';
import { useAgent } from '@/pages/agent/hooks/use-agent';
import { cn } from '@/lib/utils';

const easing = [0.16, 1, 0.3, 1];

interface TestScenarioChatAgentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  projectName?: string;
}

export const TestScenarioChatAgent: React.FC<TestScenarioChatAgentProps> = ({
  open,
  onOpenChange,
  projectId,
  projectName,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use a stable session ID scoped to this project so chat history is preserved
  const sessionId = projectId
    ? `scenario-chat-${projectId}`
    : 'scenario-chat-global';

  const {
    messages,
    isAgentLoading,
    progressMessage,
    sendMessage,
  } = useAgent({
    sessionId,
    endpoint: projectId ? `/api/projects/${projectId}/scenario-agent/chat` : '/api/agent/chat',
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isAgentLoading, progressMessage]);

  const handleSend = useCallback(
    async (value: string, files?: File[]) => {
      if (!value.trim() && (!files || files.length === 0)) return;
      await sendMessage(value, files);
    },
    [sendMessage]
  );

  return (
    <>
      {/* Backdrop overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easing }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-in panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 32,
              mass: 0.9,
            }}
            className={cn(
              'fixed inset-y-0 right-0 z-50',
              'w-full sm:max-w-md',
              'flex flex-col',
              'bg-background border-l border-border shadow-2xl'
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-border shrink-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-foreground">
                  AI Assistant
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  {projectName
                    ? `Ask about test scenarios for ${projectName}`
                    : 'Ask about test scenarios'}
                </p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
              <div className="px-5 py-4 flex flex-col min-h-full justify-end">
                <div className="space-y-1">
                  {messages.length === 0 && !isAgentLoading && (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="mt-4 text-sm font-medium text-foreground">
                        How can I help?
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
                        Ask me anything about your test scenarios, test cases, or
                        automation status.
                      </p>
                    </motion.div>
                  )}

                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))}
                  </AnimatePresence>

                  {isAgentLoading && (
                    <motion.div
                      key="loading-indicator"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
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
                </div>
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="shrink-0 border-t border-border px-4 pt-3 pb-4">
              <ChatInput onSend={handleSend} isLoading={isAgentLoading} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
