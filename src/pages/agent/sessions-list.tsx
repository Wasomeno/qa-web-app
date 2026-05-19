import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useChatSessionsApi, useDeleteChatSession, ChatSession } from '@/hooks/use-chat-sessions-api';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Trash2,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const SessionSkeleton: React.FC = () => {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white">
      <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
};

export const SessionsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: sessions = [], isLoading, refetch } = useChatSessionsApi();
  const deleteMutation = useDeleteChatSession();
  const [sessionToDelete, setSessionToDelete] = React.useState<ChatSession | null>(null);
  const [loadingSessionId, setLoadingSessionId] = React.useState<string | null>(null);

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Format full date
  const formatFullDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle session click - navigate to session detail page
  const handleSessionClick = (session: ChatSession) => {
    setLoadingSessionId(session.session_id);
    navigate({
      to: '/chat-sessions/$sessionId',
      params: { sessionId: session.session_id }
    });
  };

  // Handle delete click
  const handleDeleteClick = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setSessionToDelete(session);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (sessionToDelete) {
      try {
        await deleteMutation.mutateAsync(sessionToDelete.session_id);
        toast.success('Session deleted successfully');
      } catch (error) {
        toast.error('Failed to delete session');
      }
      setSessionToDelete(null);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setSessionToDelete(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-background relative">
      {/* Header */}
      <div className="flex-none space-y-5 px-8 pt-10 pb-6 border-b border-gray-100/80 bg-white/80 backdrop-blur-xl z-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Chat Sessions</h1>
          <p className="text-sm text-gray-500 mt-1.5">Review your chat history</p>
        </div>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <SessionSkeleton key={i} />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Start a new conversation from the home page to see it listed here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {sessions.map((session: ChatSession, index: number) => {
                  const isLoading = loadingSessionId === session.session_id;

                  return (
                    <motion.div
                      key={session.session_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                      onClick={() => !isLoading && handleSessionClick(session)}
                      className={cn(
                        'group flex items-center gap-3 p-3 rounded-lg border cursor-pointer',
                        'transition-all duration-200',
                        isLoading
                          ? 'bg-muted/30 border-muted'
                          : 'hover:bg-accent/50 hover:border-muted hover:shadow-md'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate pr-2">
                          {session.preview || 'Chat Session'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatRelativeTime(session.last_update_time)}
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
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600 text-gray-400"
                                onClick={e => handleDeleteClick(e, session)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete session</TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!sessionToDelete} onOpenChange={() => setSessionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
