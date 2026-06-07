import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Bot, Trash2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


import { ChatMessage } from '@/pages/agent/components/chat-message';
import { ChatInput } from '@/pages/agent/components/chat-input';
import { useAgent } from '@/pages/agent/hooks/use-agent';

interface TestScenarioChatAgentProps {
  projectId?: string;
  projectName?: string;
  /** Left pixel offset so the chat centers within the visible content area, not the full viewport. */
  leftOffset?: number;
}

export const TestScenarioChatAgent: React.FC<TestScenarioChatAgentProps> = ({
  projectId,
  projectName,
  leftOffset,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [minimized, setMinimized] = useState(false);

  const sessionId = projectId
    ? `scenario-chat-${projectId}`
    : 'scenario-chat-global';

  const { messages, isAgentLoading, progressMessage, sendMessage, resetMessages } = useAgent({
    sessionId,
    endpoint: projectId
      ? `/api/projects/${projectId}/scenario-agent/chat`
      : '/api/agent/chat',
  });

  const hasHistory = messages.length > 0 || isAgentLoading;
  const isExpanded = hasHistory && !minimized;

  // Auto-expand when the agent responds so the user sees the answer
  useEffect(() => {
    if (isAgentLoading) setMinimized(false);
  }, [isAgentLoading]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
    <div
      className="fixed bottom-6 z-50 flex items-end justify-center"
      style={{ left: leftOffset ?? 0, right: 0 }}
    >
      <div className="flex w-[min(560px,calc(100%-2rem))] flex-col">
      {/* Messages panel — slides up from the input when conversation starts */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="messages-panel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative mb-2 flex flex-col overflow-hidden rounded-2xl border bg-background/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Action buttons — float top-right */}
            <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5">
              <button
                onClick={() => setMinimized(true)}
                title="Minimize"
                className="p-1 text-muted-foreground/40 transition-colors hover:text-muted-foreground"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { resetMessages(); setMinimized(false); }}
                title="Clear conversation"
                className="p-1 text-destructive/40 transition-colors hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Scrollable message list */}
            <div className="max-h-[50vh] overflow-y-auto" ref={scrollRef}>
              <div className="space-y-1 px-3 py-2">
                <AnimatePresence initial={false}>
                  {messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {isAgentLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex w-full gap-3 px-2 py-2"
                  >
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        className="absolute inset-0 rounded-full bg-primary/20"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center space-x-1.5 rounded-2xl rounded-tl-none border bg-muted/40 px-3 py-2.5">
                        {[0, 0.15, 0.3].map((delay, i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.2, delay, ease: 'easeInOut' }}
                            className="h-1.5 w-1.5 rounded-full bg-primary/60"
                          />
                        ))}
                      </div>
                      {progressMessage && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="px-1 text-[10px] font-medium italic text-muted-foreground"
                        >
                          {progressMessage}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized restore pill — shown above input when history is hidden */}
      <AnimatePresence>
        {minimized && hasHistory && (
          <motion.button
            key="restore"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={() => setMinimized(false)}
            className="mb-1.5 self-center flex items-center gap-1.5 rounded-full border bg-background/95 px-3 py-1 text-xs text-muted-foreground shadow-md backdrop-blur-xl transition-colors hover:text-foreground"
          >
            <ChevronDown className="h-3 w-3 rotate-180" />
            Show conversation
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating input — always visible */}
      <ChatInput
        onSend={handleSend}
        isLoading={isAgentLoading}
        placeholder={projectName ? `Ask about ${projectName}…` : 'Ask about test scenarios…'}
        hideCommandsPopover
      />
    </div>
    </div>
  );
};
