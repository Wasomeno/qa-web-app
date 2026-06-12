import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ChevronRight,
  Clock,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useChatSessionApi, useChatSessionsApi } from "@/hooks/use-chat-sessions-api";
import type { ChatMessageFromApi, ChatSession } from "@/hooks/use-chat-sessions-api";
import { cn } from "@/lib/utils";
import type { AppProject } from "@/types/project";

import { ChatInput } from "./components/chat-input";
import { ChatMessage, type Message } from "./components/chat-message";
import { useAgent } from "./hooks/use-agent";

function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function convertApiMessages(apiMessages: ChatMessageFromApi[]): Message[] {
  return apiMessages.map((message, index) => ({
    id: `api-${index}-${message.timestamp}`,
    role: message.role,
    content: message.content,
    timestamp: new Date(message.timestamp).getTime(),
  }));
}

function createProjectSessionId(projectId: string) {
  return `project-agent-${projectId}-${crypto.randomUUID()}`;
}

interface ProjectAgentPanelProps {
  project: AppProject;
}

export const ProjectAgentPanel: React.FC<ProjectAgentPanelProps> = ({ project }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(() =>
    createProjectSessionId(project.id),
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const {
    data: sessions = [],
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
  } = useChatSessionsApi();
  const { data: selectedSession, isLoading: isLoadingSelectedSession } =
    useChatSessionApi(selectedSessionId);

  const initialMessages = useMemo(() => {
    if (!selectedSession) return [];
    return convertApiMessages(selectedSession.messages);
  }, [selectedSession]);

  const startNewChat = useCallback(() => {
    setSelectedSessionId(null);
    setActiveSessionId(createProjectSessionId(project.id));
  }, [project.id]);

  const handleSelectSession = useCallback((session: ChatSession) => {
    setSelectedSessionId(session.session_id);
    setActiveSessionId(session.session_id);
  }, []);

  const isLoadingActiveSession =
    !!selectedSessionId && isLoadingSelectedSession && activeSessionId === selectedSessionId;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="fixed bottom-5 right-5 z-40 md:bottom-6 md:right-6">
        <motion.div
          animate={open ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
          whileHover={open ? undefined : { scale: 1.06 }}
          whileTap={open ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className={cn(open && "pointer-events-none")}
        >
          <Button
            type="button"
            size="icon"
            onClick={() => setOpen(true)}
            className="h-11 w-11 rounded-full border border-border/80 bg-background text-foreground shadow-lg shadow-black/10 transition-colors duration-200 hover:bg-muted hover:shadow-xl dark:shadow-black/30"
            aria-label="Ask Agent"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      <SheetContent
        side="right"
        className="flex w-full max-w-none flex-col gap-0 overflow-hidden border-l bg-background p-0 sm:w-[540px] sm:max-w-[540px]"
      >
        <SheetHeader className="border-b border-border/80 bg-muted/20 px-5 py-4 pr-12 text-left">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="text-base leading-6">
                Agent
              </SheetTitle>
              <SheetDescription className="truncate text-xs">
                {project.name}
              </SheetDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startNewChat}
              className="h-8 shrink-0 gap-1.5 rounded-md"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
          </div>
        </SheetHeader>

        <div className="border-b border-border/80 bg-background px-4 py-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Recent
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => refetchSessions()}
                  className="h-7 w-7 rounded-md text-muted-foreground"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="sr-only">Refresh recent sessions</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh recent sessions</TooltipContent>
            </Tooltip>
          </div>

          {isLoadingSessions ? (
            <div className="flex gap-2 overflow-hidden">
              {[0, 1, 2].map((item) => (
                <div key={item} className="w-36 shrink-0 space-y-2 rounded-lg border bg-muted/20 p-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
              No recent sessions yet
            </div>
          ) : (
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {sessions.slice(0, 6).map((session) => {
                const isActive = activeSessionId === session.session_id;

                return (
                  <button
                    key={session.session_id}
                    type="button"
                    onClick={() => handleSelectSession(session)}
                    className={cn(
                      "group w-40 shrink-0 rounded-md border px-3 py-2 text-left transition-colors",
                      isActive
                        ? "border-foreground/20 bg-muted text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <div className="truncate text-xs font-medium">
                      {session.preview || "Chat session"}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span>{formatRelativeTime(session.last_update_time)}</span>
                      <ChevronRight
                        className={cn(
                          "h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100",
                          isActive && "opacity-100",
                        )}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 bg-background">
          {isLoadingActiveSession ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading session
              </div>
            </div>
          ) : (
            <ProjectAgentThread
              key={activeSessionId}
              project={project}
              sessionId={activeSessionId}
              initialMessages={initialMessages}
              onMessagesChange={() => {
                queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
              }}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface ProjectAgentThreadProps {
  project: AppProject;
  sessionId: string;
  initialMessages: Message[];
  onMessagesChange: () => void;
}

const ProjectAgentThread: React.FC<ProjectAgentThreadProps> = ({
  project,
  sessionId,
  initialMessages,
  onMessagesChange,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, isAgentLoading, progressMessage, sendMessage, resetMessages } = useAgent({
    sessionId,
    initialMessages,
    onMessagesChange,
  });

  useEffect(() => {
    if (!scrollRef.current) return;

    const scrollContainer = scrollRef.current.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages, isAgentLoading, progressMessage]);

  const handleSend = useCallback(
    async (value: string, files?: File[]) => {
      if (!value.trim() && (!files || files.length === 0)) return;
      await sendMessage(value, files);
    },
    [sendMessage],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <ScrollArea className="min-h-0 flex-1" ref={scrollRef}>
        <div className="flex min-h-full flex-col justify-end px-4 py-4">
          {messages.length === 0 && !isAgentLoading ? (
            <div className="mb-auto mt-3 rounded-md border bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">
                    Ask about this project
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    Ask about issues, scenarios, recordings, or specs for {project.name}.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-1">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {isAgentLoading && (
                <motion.div
                  key="project-agent-loading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="flex w-full gap-3 py-3"
                >
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2.5 shadow-sm">
                      {[0, 0.15, 0.3].map((delay) => (
                        <motion.span
                          key={delay}
                          animate={{ opacity: [0.35, 1, 0.35] }}
                          transition={{ repeat: Infinity, duration: 1.1, delay }}
                          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
                        />
                      ))}
                    </div>
                    {progressMessage && (
                      <div className="mt-1 px-1 text-[11px] font-medium text-muted-foreground">
                        {progressMessage}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>

      <div className="shrink-0 border-t border-border/80 bg-muted/20 px-4 pb-3 pt-3">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="truncate">
            {messages.length > 0 ? "Current conversation" : "New conversation"}
          </span>
          {messages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => resetMessages()}
              className="h-7 shrink-0 gap-1.5 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
        <ChatInput
          onSend={handleSend}
          isLoading={isAgentLoading}
          placeholder={`Ask about ${project.name}`}
          hideCommandsPopover
        />
      </div>
    </div>
  );
};
