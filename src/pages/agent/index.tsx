import React, {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import { useNavigate, useSearch } from '@tanstack/react-router';

import { ChatMessage, Message } from "./components/chat-message";
import { ChatInput } from "./components/chat-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  ArrowLeft,
  Trash2,
  Clock,
  ChevronRight,
  List,
  Folder,
  CheckSquare,
  PlayCircle,
  Terminal,
  Loader2,
} from "lucide-react";
import { useAgent } from "./hooks/use-agent";
import { useChatSessions } from "./hooks/use-chat-sessions";
import { useChatSessionsApi, useChatSessionApi, ChatSession as ApiChatSession, ChatMessageFromApi } from "@/hooks/use-chat-sessions-api";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

// Convert API messages to local Message format
function convertApiMessagesToMessages(apiMessages: ChatMessageFromApi[]): Message[] {
  return apiMessages.map((msg, index) => ({
    id: `msg-${index}-${Date.now()}`,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    timestamp: new Date(msg.timestamp).getTime(),
  }));
}

export const AgentPage: React.FC<{ portalContainer?: HTMLElement | null }> = ({
  portalContainer,
}) => {
  const navigate = useNavigate();
  const search = useSearch({ from: '/' });
  const [ref, bounds] = useMeasure();

  // Local storage for messages (for display)
  const {
    currentSessionId,
    createSession,
    saveSession,
    clearCurrentSession,
    getCurrentSession,
    setCurrentSessionId,
  } = useChatSessions();

  // Backend API for session list
  const { data: apiSessions = [], isLoading: isLoadingSessions } = useChatSessionsApi();

  // Track if we're loading a session from the backend
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

  // Fetch session details when loading a session from the backend
  const { data: sessionDetail, isLoading: isLoadingSession } = useChatSessionApi(loadingSessionId);

  const currentSession = getCurrentSession();

  // Store loaded messages from backend
  const [loadedMessages, setLoadedMessages] = useState<Message[] | null>(null);

  // Use useState with a function to compute initial value properly
  const [view, setView] = useState<"home" | "chat">(() => {
    return currentSession && currentSession.messages.length > 0
      ? "chat"
      : "home";
  });

  const [isCommandMode, setIsCommandMode] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  // Track pending initial message to send after ChatView mounts
  const [pendingInitialMessage, setPendingInitialMessage] = useState<
    string | null
  >(null);

  // Track pending initial files
  const [pendingInitialFiles, setPendingInitialFiles] = useState<File[]>([]);

  // Track when bounds are measured (to avoid animate target change mid-animation)
  const [boundsReady, setBoundsReady] = useState(false);
  useEffect(() => {
    if (bounds.height > 0 && !boundsReady) {
      setBoundsReady(true);
    }
  }, [bounds.height, boundsReady]);

  // Commands definitions (match ChatInput)
  const COMMANDS = useMemo(
    () => [
      {
        id: "projects",
        icon: Folder,
        label: "Projects",
        description: "List and manage your projects",
      },
      {
        id: "issue",
        icon: CheckSquare,
        label: "Create Issue",
        description: "Create a new ticket or bug",
      },
      {
        id: "tests",
        icon: PlayCircle,
        label: "Run Tests",
        description: "Execute automated test scenarios",
      },
      {
        id: "help",
        icon: Terminal,
        label: "Help",
        description: "Show available actions and usage",
      },
    ],
    [],
  );

  const filteredCommands = useMemo(() => {
    return COMMANDS.filter(
      (c) =>
        c.id.toLowerCase().includes(commandQuery.toLowerCase()) ||
        c.label.toLowerCase().includes(commandQuery.toLowerCase()),
    );
  }, [COMMANDS, commandQuery]);

  const handleCommandStateChange = useCallback(
    (isCmdMode: boolean, query: string) => {
      setIsCommandMode(isCmdMode);
      setCommandQuery(query);
    },
    [],
  );

  const startNewChat = (initialMessage?: string, initialFiles?: File[]) => {
    createSession();
    setView("chat");
    if (
      initialMessage !== undefined ||
      (initialFiles && initialFiles.length > 0)
    ) {
      // Store the initial message to be sent after ChatView mounts
      setPendingInitialMessage(initialMessage || null);
      setPendingInitialFiles(initialFiles || []);
    }
  };

  // Resume a session from the API list - navigate to session detail page
  const handleResumeSession = (session: ApiChatSession) => {
    setLoadingSessionId(session.session_id);
    navigate({
      to: '/chat-sessions/$sessionId',
      params: { sessionId: session.session_id }
    });
  };

  // Format relative time for API sessions (ISO string)
  const formatRelativeTimeApi = (timestamp: string) => {
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
  };

  // Home View
  if (view === "home") {
    return (
      <div className="flex flex-col h-full w-full bg-background relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-transparent pointer-events-none" />

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 relative z-10 overflow-auto">
          <div className="w-full max-w-2xl space-y-6 md:space-y-8">
            {/* Logo and Title or Commands List */}
            {isCommandMode ? (
              <MotionConfig
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              >
                <motion.div
                  animate={boundsReady ? { height: bounds.height } : {}}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="w-full sm:w-[calc(100%+2rem)] sm:-ml-4 px-0 sm:px-4 pb-4 sm:pb-8 -mb-4 sm:-mb-8 relative overflow-visible"
                >
                  <div className="w-full relative px-1 py-1" ref={ref}>
                    <motion.div
                      key="commands"
                      initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="flex flex-col w-full bg-background border rounded-3xl shadow-xl overflow-hidden origin-bottom"
                    >
                      <div className="px-5 py-3.5 text-[11px] font-bold text-muted-foreground border-b bg-muted/20">
                        Suggested Commands
                      </div>
                      <div className="p-2.5 max-h-[300px] overflow-y-auto space-y-1">
                        {filteredCommands.length > 0 ? (
                          filteredCommands.map((cmd) => (
                            <button
                              key={cmd.id}
                              onClick={() => {
                                startNewChat(`/${cmd.id}`);
                              }}
                              className="w-full flex items-center gap-4 px-4 py-3 text-left rounded-2xl transition-all duration-200 text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm group outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-background border border-border/80 shadow-sm group-hover:shadow group-hover:border-primary/20 transition-all shrink-0">
                                <cmd.icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <div className="text-sm font-semibold">
                                  /{cmd.id}
                                </div>
                                <div className="text-xs text-muted-foreground/70">
                                  {cmd.description}
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <p className="text-sm text-muted-foreground">
                              No commands match{" "}
                              <span className="font-medium text-foreground">
                                /{commandQuery}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </MotionConfig>
            ) : (
              <div className="text-center space-y-3 px-2 sm:px-0">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Welcome to FlowG
                </h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Your AI assistant for QA testing. Ask me anything about your
                  projects, issues, and test automation.
                </p>
              </div>
            )}

            {/* Chat Input */}
            <div className="relative w-full mt-6 md:mt-8">
              <ChatInput
                onSend={(value, files) => startNewChat(value, files)}
                placeholder="Ask me anything..."
                onCommandStateChange={handleCommandStateChange}
                hideCommandsPopover={true}
              />
            </div>

            {/* Recent Sessions - Loading Skeleton */}
            {isLoadingSessions && (
              <div className="w-full mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: i * 0.06,
                        duration: 0.25,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="flex items-center gap-3 p-3 sm:p-3 rounded-lg"
                    >
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <Skeleton className="h-3.5 rounded" style={{ width: `${65 - i * 8}%` }} />
                        <Skeleton className="h-3 rounded opacity-60" style={{ width: `${30 - i * 4}%` }} />
                      </div>
                      <Skeleton className="h-3.5 w-3.5 rounded opacity-40 shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Sessions - Loaded (Limited to 3 with View All link) */}
            {!isLoadingSessions && apiSessions.length > 0 && (
              <div className="w-full mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium text-muted-foreground">
                    Recent Chats
                  </h2>
                  {apiSessions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-xs h-7"
                      onClick={() => navigate({ to: '/chat-sessions' })}
                    >
                      <List className="h-3 w-3 mr-1" />
                      View all ({apiSessions.length})
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {apiSessions.slice(0, 3).map((session, index) => {
                      const isLoading = loadingSessionId === session.session_id;

                      return (
                        <motion.div
                          key={session.session_id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ delay: 0.1 * index, duration: 0.2 }}
                          onClick={() => !isLoading && handleResumeSession(session)}
                          className={cn(
                            "group flex items-center gap-3 p-3 sm:p-3 rounded-lg border cursor-pointer",
                            "transition-all duration-200",
                            isLoading
                              ? "bg-muted/30 border-muted"
                              : "hover:bg-accent/50 hover:border-muted"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate pr-2">
                              {session.preview || 'Chat Session'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatRelativeTimeApi(session.last_update_time)}
                            </p>
                          </div>

                          {isLoading ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative h-5 w-5 shrink-0"
                            >
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="h-5 w-5 rounded-full border-[1.5px] border-muted-foreground/20 border-t-muted-foreground/60"
                              />
                            </motion.div>
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while fetching session from backend
  if (isLoadingSession || (loadingSessionId && !sessionDetail)) {
    return (
      <div className="flex flex-col h-full w-full bg-background items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center gap-4 px-6 py-8 bg-white rounded-2xl shadow-xl border border-gray-100"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="h-10 w-10 animate-spin text-primary relative" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">Loading chat session</p>
            <p className="text-xs text-muted-foreground mt-1">Please wait...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Chat View - use session ID as key to remount with correct messages
  // Use loadedMessages from backend if available, otherwise use local session messages
  const messagesForChat = loadedMessages || currentSession?.messages || [];

  return (
    <ChatView
      key={currentSessionId}
      sessionId={currentSessionId}
      initialMessages={messagesForChat}
      saveSession={saveSession}
      clearCurrentSession={() => {
        setLoadedMessages(null);
        clearCurrentSession();
      }}
      onBack={() => {
        setLoadedMessages(null);
        clearCurrentSession();
        setView("home");
      }}
      initialMessage={pendingInitialMessage}
      initialFiles={pendingInitialFiles}
      onInitialMessageHandled={() => {
        setPendingInitialMessage(null);
        setPendingInitialFiles([]);
      }}
    />
  );
};

// Separate ChatView component to ensure fresh agent state
interface ChatViewProps {
  sessionId: string | null;
  initialMessages: Message[];
  saveSession: (id: string, msgs: Message[]) => void;
  clearCurrentSession: () => void;
  onBack: () => void;
  initialMessage: string | null;
  initialFiles?: File[];
  onInitialMessageHandled: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({
  sessionId,
  initialMessages,
  saveSession,
  clearCurrentSession,
  onBack,
  initialMessage,
  initialFiles,
  onInitialMessageHandled,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Guard: if sessionId is null, show a fallback UI
  if (!sessionId) {
    return (
      <div className="flex flex-col h-full w-full bg-background items-center justify-center">
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  const {
    messages,
    isAgentLoading,
    sendMessage,
    progressMessage,
    resetMessages,
  } = useAgent({
    sessionId,
    initialMessages,
    onMessagesChange: useCallback(
      (msgs: Message[]) => {
        if (sessionId && msgs.length > 0) {
          saveSession(sessionId, msgs);
        }
      },
      [sessionId, saveSession],
    ),
  });

  // Handle initial message from parent - send when component mounts and sendMessage is ready
  useEffect(() => {
    if (
      (initialMessage || (initialFiles && initialFiles.length > 0)) &&
      sendMessage
    ) {
      // Small delay to ensure component is fully rendered
      const timer = setTimeout(() => {
        sendMessage(initialMessage || "", initialFiles || []);
        onInitialMessageHandled();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [initialMessage, initialFiles, sendMessage, onInitialMessageHandled]);

  // Check if there are any user messages
  const hasUserMessages = useMemo(() => {
    return messages.some((msg) => msg.role === "user");
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current && hasUserMessages) {
      const scrollContainer = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isAgentLoading, progressMessage, hasUserMessages]);

  return (
    <div className="flex flex-col h-full w-full bg-background relative">
      {/* Floating Back Button */}
      <button
        type="button"
        className="absolute top-2 left-2 sm:top-4 sm:left-4 h-9 w-9 sm:h-12 sm:w-12 z-50 flex items-center justify-center rounded-md opacity-40 hover:opacity-100 transition-opacity"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      <ScrollArea className="flex-1 w-full" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col min-h-full justify-end">
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
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
                    overflow: "hidden",
                    transition: { duration: 0.15 },
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="flex w-full gap-3 py-4"
                >
                  <div className="h-9 w-9 rounded-full bg-muted/40 flex items-center justify-center border border-muted relative">
                    <Bot className="h-5 w-5 text-muted-foreground" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 rounded-full bg-muted-foreground/10"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-1.5 px-4 py-3 bg-muted/40 backdrop-blur-sm rounded-2xl rounded-tl-none border shadow-sm">
                      <motion.div
                        animate={{ y: [0, -4, 0], opacity: [0.3, 0.8, 0.3] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          delay: 0,
                          ease: "easeInOut",
                        }}
                        className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -4, 0], opacity: [0.3, 0.8, 0.3] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          delay: 0.15,
                          ease: "easeInOut",
                        }}
                        className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -4, 0], opacity: [0.3, 0.8, 0.3] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          delay: 0.3,
                          ease: "easeInOut",
                        }}
                        className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"
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
      <div className="w-full shrink-0">
        <div className="max-w-3xl mx-auto px-4 pb-6">
          <div className="relative">
            <ChatInput
              onSend={(val, files) => sendMessage(val, files)}
              isLoading={isAgentLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPage;
