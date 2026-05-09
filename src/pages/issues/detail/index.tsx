import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ExternalLink,
  Pin,
  Pencil,
  Save,
  Calendar,
  Smile,
  Reply,
  Trash2,
  Copy,
  Check,
  ClipboardList,
  GitPullRequest,
  CircleDot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { Issue, updateIssue } from '@/api/issue';
import { useGetProjectMembers } from '@/pages/issues/create/hooks/use-get-project-members';
import { useGetProjectLabels } from '@/pages/issues/create/hooks/use-get-project-labels';
import { AssigneePicker } from '@/pages/issues/create/components/assignee-picker';
import { LabelPicker } from '@/pages/issues/create/components/label-picker';
import { DescriptionEditor } from '@/pages/issues/create/components/description-editor';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { usePinnedIssues } from '@/hooks/use-pinned-issues';
import { useSession } from '@/contexts/session-context';
import { useGetIssue } from '../hooks/use-get-issue';
import { useGetIssueComments } from '../hooks/use-get-issue-comments';
import { ChildIssuesList } from '@/pages/issues/detail/components/child-issues-list';
import { useIssueCommentMutations } from '@/pages/issues/hooks/use-issue-comment-mutations';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface IssueDetailPageProps {
  issue?: Issue;
  issueId?: number;
  projectId?: number;
  onBack: () => void;
  portalContainer?: HTMLElement | null;
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  opened: { color: 'text-green-700', bg: 'bg-green-100', label: 'Open' },
  closed: { color: 'text-gray-700', bg: 'bg-gray-100', label: 'Closed' },
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/* ------------------------------------------------------------------ */
//  Stream primitives
/* ------------------------------------------------------------------ */

interface StreamItemProps {
  avatar: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  isLast?: boolean;
  className?: string;
}

const StreamItem: React.FC<StreamItemProps> = ({
  avatar,
  header,
  children,
  isLast,
  className,
}) => {
  return (
    <div className={cn('flex gap-4 relative', className)}>
      {/* Avatar + thread line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {avatar}
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-200 mt-2" />}
      </div>

      {/* Content */}
      <div className={cn('flex-1 min-w-0', !isLast ? 'pb-10' : 'pb-4')}>
        {header && <div className="mb-2">{header}</div>}
        {children}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
//  Sidebar metadata row
/* ------------------------------------------------------------------ */

interface MetadataRowProps {
  label: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
  children: React.ReactNode;
  editComponent: React.ReactNode;
}

const MetadataRow: React.FC<MetadataRowProps> = ({
  label,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isSaving,
  children,
  editComponent,
}) => {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
          {label}
        </span>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity"
          >
            <Pencil className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          {editComponent}
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancel}
              disabled={isSaving}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="h-7 text-xs gap-1.5"
            >
              {isSaving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-3 h-3" /> Save
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
//  Page
/* ------------------------------------------------------------------ */

export const IssueDetailPage: React.FC<IssueDetailPageProps> = ({
  issue,
  issueId: propIssueId,
  projectId: propProjectId,
  onBack,
  portalContainer,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const session = useSession();
  const user = session?.user;

  const projectId = propProjectId || issue?.project_id;
  const issueId = propIssueId || issue?.iid;

  const { data: fetchedIssueData, isLoading: isFetching } = useGetIssue(
    projectId!,
    issueId!
  );

  const currentIssue = useMemo(() => {
    const fetched = fetchedIssueData?.data;
    if (!fetched) return issue;
    if (!fetched.label_details?.length && issue?.label_details?.length) {
      return { ...fetched, label_details: issue.label_details };
    }
    return fetched;
  }, [fetchedIssueData, issue]);

  const [editingField, setEditingField] = useState<
    'description' | 'status' | 'assignee' | 'labels' | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { togglePin, isPinned } = usePinnedIssues();

  const [description, setDescription] = useState(currentIssue?.description || '');
  const [status, setStatus] = useState<string>(
    currentIssue?.state === 'closed' ? 'closed' : 'opened'
  );

  const comments = useGetIssueComments(projectId!, issueId!);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentBody, setEditCommentBody] = useState('');

  const {
    createComment,
    updateComment,
    deleteComment,
    isCreating,
    isUpdating,
  } = useIssueCommentMutations(projectId!, issueId!);

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;
    await createComment({ body: newComment });
    setNewComment('');
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editCommentBody.trim()) return;
    await updateComment({ commentId, data: { body: editCommentBody } });
    setEditingCommentId(null);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(commentId);
    }
  };

  const [selectedAssignee, setSelectedAssignee] = useState(
    currentIssue?.assignees?.[0]
      ? {
          id: String(currentIssue.assignees[0].id),
          name: currentIssue.assignees[0].name,
          username: currentIssue.assignees[0].username,
          avatarUrl: currentIssue.assignees[0].avatar_url,
          webUrl: currentIssue.assignees[0].web_url,
          state: currentIssue.assignees[0].state,
        }
      : undefined
  );

  const [selectedLabels, setSelectedLabels] = useState(
    currentIssue?.label_details
      ? currentIssue.label_details.map((l) => ({
          id: String(l.id),
          name: l.name,
          color: l.color,
          textColor: l.text_color,
          description: l.description,
        }))
      : (currentIssue?.labels || []).map((l) => ({
          id: String(l),
          name: String(l),
          color: '#ccc',
          textColor: '#000',
          description: '',
        }))
  );

  const { data: members, isLoading: isLoadingMembers } = useGetProjectMembers(projectId!);
  const { data: labels, isLoading: isLoadingLabels } = useGetProjectLabels(projectId!);

  useEffect(() => {
    if (fetchedIssueData?.data) {
      const data = fetchedIssueData.data;
      setDescription(data.description || '');
      setStatus((data.state || 'opened') === 'closed' ? 'closed' : 'opened');
      setSelectedAssignee(
        data.assignees?.[0]
          ? {
              id: String(data.assignees[0].id),
              name: data.assignees[0].name,
              username: data.assignees[0].username,
              avatarUrl: data.assignees[0].avatar_url,
              webUrl: data.assignees[0].web_url,
              state: data.assignees[0].state,
            }
          : undefined
      );
    }
  }, [fetchedIssueData]);

  const handleUpdate = async () => {
    if (!editingField) return;
    setIsSaving(true);
    try {
      if (editingField === 'description') {
        await updateIssue(projectId!, issueId!, { description });
        toast.success('Description updated');
      } else if (editingField === 'status') {
        const event = status === 'closed' ? 'close' : 'reopen';
        await updateIssue(projectId!, issueId!, { state_event: event });
        toast.success('Status updated');
      } else if (editingField === 'assignee') {
        await updateIssue(projectId!, issueId!, {
          assignee_ids: selectedAssignee ? [parseInt(selectedAssignee.id)] : [],
        });
        toast.success('Assignee updated');
      } else if (editingField === 'labels') {
        await updateIssue(projectId!, issueId!, {
          labels: selectedLabels.map((l) => l.name).join(','),
        });
        toast.success('Labels updated');
      }
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
      setEditingField(null);
    } catch (error) {
      toast.error('Failed to update issue');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    if (!currentIssue) return;
    
    setDescription(currentIssue.description || '');
    setStatus((currentIssue.state || '') === 'closed' ? 'closed' : 'opened');
    setSelectedAssignee(
      currentIssue.assignees?.[0]
        ? {
            id: String(currentIssue.assignees[0].id),
            name: currentIssue.assignees[0].name,
            username: currentIssue.assignees[0].username,
            avatarUrl: currentIssue.assignees[0].avatar_url,
            webUrl: currentIssue.assignees[0].web_url,
            state: currentIssue.assignees[0].state,
          }
        : undefined
    );
    if (currentIssue.label_details && currentIssue.label_details.length > 0) {
      setSelectedLabels(
        currentIssue.label_details.map((l) => ({
          id: String(l.id),
          name: l.name,
          color: l.color,
          textColor: l.text_color,
          description: l.description,
        }))
      );
    }
  };

  /* ---------------------------------------------------------------- */
  //  Loading skeleton
  /* ---------------------------------------------------------------- */

  if (isFetching && !currentIssue) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex-1 flex flex-col relative h-full overflow-hidden"
      >
        <div className="flex-none sticky top-0 z-10 bg-white/80 backdrop-blur-sm px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="space-y-2">
              <Skeleton className="h-6 w-[320px]" />
              <Skeleton className="h-3 w-[200px]" />
            </div>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <StreamItem
                avatar={<Skeleton className="w-8 h-8 rounded-full" />}
                header={<Skeleton className="h-4 w-48" />}
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </StreamItem>
              <StreamItem
                avatar={<Skeleton className="w-8 h-8 rounded-full" />}
                header={<Skeleton className="h-4 w-32" />}
                isLast
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </StreamItem>
            </div>
          </div>
          <div className="w-64 flex-shrink-0 border-l border-gray-100 bg-gray-50/30 p-5 space-y-6">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (!currentIssue) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white gap-4 p-8">
        <div className="text-gray-400">Issue not found</div>
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const commentCount = comments.data?.data?.length || 0;
  const hasChildIssues = currentIssue.child && currentIssue.child.amount > 0;

  /* ---------------------------------------------------------------- */
  //  Derived stream order
  /* ---------------------------------------------------------------- */

  const streamItems = [];
  // We'll render them manually so we can control isLast precisely

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col relative h-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex-none sticky top-0 z-10 bg-white/80 backdrop-blur-sm px-6 py-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors mt-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-gray-900 leading-snug">
                {currentIssue.title}
              </h1>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-gray-500 mt-1.5">
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    (statusConfig[currentIssue.state] || statusConfig.opened).bg,
                    (statusConfig[currentIssue.state] || statusConfig.opened).color
                  )}
                >
                  {(statusConfig[currentIssue.state] || statusConfig.opened).label}
                </span>
                <span className="text-gray-300">•</span>
                <span className="font-medium text-gray-600">
                  {currentIssue.project_name || (
                    <Skeleton className="h-3.5 w-20 inline-block" />
                  )}
                </span>
                <span className="text-gray-300">•</span>
                <span>
                  {currentIssue.author?.name || (
                    <Skeleton className="h-3.5 w-24 inline-block" />
                  )}
                </span>
                <span className="text-gray-300">•</span>
                <span>
                  {currentIssue.created_at ? (
                    formatDate(currentIssue.created_at)
                  ) : (
                    <Skeleton className="h-3.5 w-16 inline-block" />
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* -------- Stream -------- */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
            {/* Description */}
            <StreamItem
              avatar={
                currentIssue.author?.avatar_url ? (
                  <img
                    src={currentIssue.author.avatar_url}
                    alt={currentIssue.author.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500">
                    {(currentIssue.author?.name || '?').charAt(0).toUpperCase()}
                  </div>
                )
              }
              header={
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">
                    {currentIssue.author?.name || 'Unknown'}
                  </span>
                  <span>opened this issue</span>
                  <span className="text-gray-300">•</span>
                  <span>{formatDate(currentIssue.created_at)}</span>
                </div>
              }
            >
              {editingField === 'description' ? (
                <div className="space-y-3 bg-white p-3 rounded-lg border border-zinc-100 shadow-sm ring-2 ring-zinc-50">
                  <DescriptionEditor
                    content={description}
                    onChange={setDescription}
                    className="min-h-[200px]"
                    portalContainer={portalContainer || containerRef.current}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEdit}
                      disabled={isSaving}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUpdate}
                      disabled={isSaving}
                      className="h-7 text-xs gap-1.5"
                    >
                      {isSaving ? 'Saving...' : <><Save className="w-3 h-3" /> Save</>}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="group/description relative">
                  {isFetching && !currentIssue.description ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : (
                    <MarkdownRenderer content={currentIssue.description || ''} />
                  )}
                  <button
                    onClick={() => {
                      setDescription(currentIssue.description || '');
                      setEditingField('description');
                    }}
                    className="absolute -right-2 -top-2 opacity-0 group-hover/description:opacity-100 p-1.5 bg-white shadow-sm border border-gray-100 hover:bg-gray-50 rounded-full transition-all z-10"
                  >
                    <Pencil className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              )}
            </StreamItem>

            {/* Child Tasks */}
            {hasChildIssues && (
              <StreamItem
                avatar={
                  <ClipboardList className="w-4 h-4 text-gray-500" />
                }
                header={
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">Child Tasks</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs">{currentIssue.child!.amount} linked</span>
                  </div>
                }
              >
                <ChildIssuesList
                  parentIssue={currentIssue}
                  portalContainer={portalContainer}
                  hideHeader
                />
              </StreamItem>
            )}

            {/* Comments */}
            {commentCount > 0 && (
              <div className="pt-2">
                {comments.data?.data?.map((comment, idx) => (
                  <StreamItem
                    key={comment.id}
                    avatar={
                      <img
                        src={comment.author.avatar_url}
                        alt={comment.author.name}
                        className="w-full h-full object-cover"
                      />
                    }
                    header={
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-semibold text-gray-900">
                            {comment.author.name}
                          </span>
                          <span className="text-gray-400">@{comment.author.username}</span>
                          <span className="text-gray-300">•</span>
                          <span>{formatDate(comment.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <Smile className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <Reply className="w-3.5 h-3.5" />
                          </button>
                          {editingCommentId !== comment.id && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditCommentBody(comment.body);
                                }}
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    }
                    isLast={idx === commentCount - 1 && !user}
                  >
                    {editingCommentId === comment.id ? (
                      <div className="space-y-2">
                        <DescriptionEditor
                          content={editCommentBody}
                          onChange={setEditCommentBody}
                          className="min-h-[100px]"
                          portalContainer={portalContainer || containerRef.current}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingCommentId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateComment(comment.id)}
                            disabled={isUpdating}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <MarkdownRenderer content={comment.body} className="text-sm" />
                    )}
                  </StreamItem>
                ))}
              </div>
            )}

            {/* Comment composer */}
            {user && (
              <StreamItem
                avatar={
                  user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name || user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500">
                      {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )
                }
                isLast
              >
                <div className="space-y-2">
                  <DescriptionEditor
                    content={newComment}
                    onChange={setNewComment}
                    placeholder="Write a comment..."
                    className="min-h-[120px]"
                    portalContainer={portalContainer || containerRef.current}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleCreateComment}
                      disabled={isCreating || !newComment.trim()}
                    >
                      {isCreating ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </div>
              </StreamItem>
            )}
          </div>
        </div>

        {/* -------- Sidebar -------- */}
        <div className="w-full lg:w-64 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 bg-gray-50/30 p-5 space-y-6 overflow-y-auto">
          {/* Actions */}
          <div className="space-y-2">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
              Actions
            </span>
            <div className="flex items-center gap-1">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.1 }}
                      onClick={() => {
                        const content = [
                          `# ${currentIssue.title}`,
                          '',
                          `**Description:**`,
                          currentIssue.description || '_No description_',
                          '',
                          `**Labels:** ${currentIssue.labels?.join(', ') || 'None'}`,
                          '',
                          `**Assignees:** ${currentIssue.assignees?.map((a: any) => a.name).join(', ') || 'Unassigned'}`,
                          '',
                          `**Status:** ${currentIssue.state || 'Open'}`,
                          '',
                          `**Link:** ${currentIssue.web_url}`,
                        ]
                          .filter(Boolean)
                          .join('\n');
                        navigator.clipboard.writeText(content);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        copied
                          ? 'text-green-600'
                          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                      )}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{copied ? 'Copied!' : 'Copy to clipboard'}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.1 }}
                      onClick={() =>
                        currentIssue.web_url && window.open(currentIssue.web_url, '_blank')
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-zinc-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Open in GitLab</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.1 }}
                      onClick={() => togglePin(currentIssue)}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        isPinned(currentIssue.iid, currentIssue.project_id)
                          ? 'bg-amber-100 text-amber-500 hover:bg-amber-200 hover:text-amber-600'
                          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <Pin
                        className={cn(
                          'w-4 h-4',
                          isPinned(currentIssue.iid, currentIssue.project_id) && 'fill-current'
                        )}
                      />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>
                      {isPinned(currentIssue.iid, currentIssue.project_id)
                        ? 'Unpin Issue'
                        : 'Pin Issue'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Status */}
          <MetadataRow
            label="Status"
            isEditing={editingField === 'status'}
            onEdit={() => {
              setStatus((currentIssue.state || '') === 'closed' ? 'closed' : 'opened');
              setEditingField('status');
            }}
            onCancel={cancelEdit}
            onSave={handleUpdate}
            isSaving={isSaving}
            editComponent={
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent container={portalContainer || containerRef.current}>
                  <SelectItem value="opened">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            }
          >
            <span
              className={cn(
                'text-xs px-2 py-1 rounded-full font-medium inline-flex items-center gap-1.5',
                (statusConfig[currentIssue.state] || statusConfig.opened).bg,
                (statusConfig[currentIssue.state] || statusConfig.opened).color
              )}
            >
              <CircleDot className="w-3 h-3" />
              {(statusConfig[currentIssue.state] || statusConfig.opened).label}
            </span>
          </MetadataRow>

          {/* Assignee */}
          <MetadataRow
            label="Assignee"
            isEditing={editingField === 'assignee'}
            onEdit={() => {
              setSelectedAssignee(
                currentIssue.assignees?.[0]
                  ? {
                      id: String(currentIssue.assignees[0].id),
                      name: currentIssue.assignees[0].name,
                      username: currentIssue.assignees[0].username,
                      avatarUrl: currentIssue.assignees[0].avatar_url,
                      webUrl: currentIssue.assignees[0].web_url,
                      state: currentIssue.assignees[0].state,
                    }
                  : undefined
              );
              setEditingField('assignee');
            }}
            onCancel={cancelEdit}
            onSave={handleUpdate}
            isSaving={isSaving}
            editComponent={
              <AssigneePicker
                members={members || []}
                isLoading={isLoadingMembers}
                selectedAssignee={selectedAssignee}
                onSelect={setSelectedAssignee}
                disabled={isSaving}
                portalContainer={containerRef.current}
              />
            }
          >
            <div className="flex items-center gap-2">
              {currentIssue.assignees?.[0] ? (
                <>
                  <img
                    src={currentIssue.assignees[0].avatar_url}
                    className="w-5 h-5 rounded-full"
                    alt=""
                  />
                  <span className="text-xs font-medium text-gray-900">
                    {currentIssue.assignees[0].name}
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-400 italic">Unassigned</span>
              )}
            </div>
          </MetadataRow>

          {/* Labels */}
          <MetadataRow
            label="Labels"
            isEditing={editingField === 'labels'}
            onEdit={() => {
              setSelectedLabels(
                currentIssue.label_details
                  ? currentIssue.label_details.map((l) => ({
                      id: String(l.id),
                      name: l.name,
                      color: l.color,
                      textColor: l.text_color,
                      description: l.description,
                    }))
                  : (currentIssue.labels || []).map((l) => ({
                      id: String(l),
                      name: String(l),
                      color: '#ccc',
                      textColor: '#000',
                      description: '',
                    }))
              );
              setEditingField('labels');
            }}
            onCancel={cancelEdit}
            onSave={handleUpdate}
            isSaving={isSaving}
            editComponent={
              <LabelPicker
                labels={labels || []}
                isLoading={isLoadingLabels}
                selectedLabels={selectedLabels}
                onToggle={(label) => {
                  const exists = selectedLabels.some((l) => l.id === label.id);
                  if (exists) {
                    setSelectedLabels((prev) => prev.filter((l) => l.id !== label.id));
                  } else {
                    setSelectedLabels((prev) => [...prev, label]);
                  }
                }}
                disabled={isSaving}
                portalContainer={portalContainer || containerRef.current}
              />
            }
          >
            <div className="flex flex-wrap gap-1.5">
              {isFetching &&
              (!currentIssue.label_details || currentIssue.label_details.length === 0) &&
              (!currentIssue.labels || currentIssue.labels.length === 0) ? (
                <>
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-5 w-12 rounded" />
                </>
              ) : (currentIssue.label_details && currentIssue.label_details.length > 0) ||
                (labels && labels.length > 0) ? (
                (currentIssue.label_details && currentIssue.label_details.length > 0
                  ? currentIssue.label_details
                  : (currentIssue.labels || []).map((l) => {
                      const name = String(l);
                      const detail = labels?.find((ld) => ld.name === name);
                      return (
                        detail || {
                          id: name,
                          name,
                          color: '#ccc',
                          text_color: '#000',
                        }
                      );
                    })
                ).map((label) => (
                  <div
                    key={label.id}
                    className="text-[10px] px-2 py-0.5 rounded border font-medium"
                    style={{
                      backgroundColor: `${label.color}15`,
                      color: label.color,
                      borderColor: `${label.color}30`,
                    }}
                  >
                    {label.name}
                  </div>
                ))
              ) : currentIssue.labels && currentIssue.labels.length > 0 ? (
                currentIssue.labels.map((label, i) => (
                  <div
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded border font-medium bg-gray-100 text-gray-700"
                  >
                    {String(label)}
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">No labels</span>
              )}
            </div>
          </MetadataRow>

          {/* Due Date */}
          {currentIssue.due_date && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Due Date
              </span>
              <div className="text-xs font-medium text-gray-900">
                {formatDate(currentIssue.due_date)}
              </div>
            </div>
          )}

          {/* Merge Requests */}
          {(currentIssue.merge_requests_count ?? 0) > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                Merge Requests
              </span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                  <GitPullRequest className="w-3.5 h-3.5" />
                  {currentIssue.merge_requests_count} Open
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
