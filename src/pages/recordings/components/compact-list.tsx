import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  FileText,
  Play,
  Trash2,
  Plus,
  Clock,
  ExternalLink,
  PlusCircle,
  Loader2,
  Pencil,
  Check,
  X,
  Link,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listRecordings, deleteRecording, updateRecording } from '@/api/recording';
import { storageService } from '@/services/storage';
import { useSelectedProject } from '@/contexts/selected-project-context';
import { TestBlueprint } from '@/types/recording';
import { isRestrictedUrl } from '@/utils/domain-matcher';
import { ProjectSelect } from '@/components/project-select';

interface CompactRecordingsListProps {
  onClose: () => void;
  onViewAll?: () => void;
  portalContainer?: HTMLDivElement | null;
}

const CompactRecordingSkeleton = () => (
  <div className="px-4 py-3 space-y-2 border-b border-gray-50">
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 flex-1" />
      <div className="flex gap-1">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

export const CompactRecordingsList: React.FC<CompactRecordingsListProps> = ({
  onClose,
  onViewAll,
  portalContainer,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [deletedId, setDeletedId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const isPageRestricted = isRestrictedUrl(window.location.href);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [portalReady, setPortalReady] = useState(false);

  React.useEffect(() => {
    setPortalReady(true);
  }, []);

  // Use containerRef as portal container if portalContainer is null (for Shadow DOM compatibility)
  const getPortalContainer = useCallback((): HTMLElement | undefined => {
    if (portalContainer) return portalContainer;
    if (containerRef.current) return containerRef.current;
    return undefined;
  }, [portalContainer, portalReady]);

  const queryClient = useQueryClient();
  const { selectedProjectId, setSelectedProject } = useSelectedProject();

  const {
    data: recordings = [],
    isLoading,
    refetch: refetchRecordings,
  } = useQuery({
    queryKey: ['recordings-blueprints', selectedProjectId],
    queryFn: async () => {
      const params: any = {
        sort_by: 'created_at',
        order: 'desc',
      };

      if (selectedProjectId) {
        params.project_id = selectedProjectId;
      }

      const result = await listRecordings(params);
      // Handle both array response and paginated response { data: [...] }
      if (result && typeof result === 'object' && !Array.isArray(result) && 'data' in result) {
        return (result as any).data || [];
      }
      return Array.isArray(result) ? result : [];
    },
    refetchOnMount: 'always',
  });

  const { data: lastBlueprint, refetch: refetchLastBlueprint } = useQuery({
    queryKey: ['last-blueprint'],
    queryFn: async () => {
      const data = await storageService.get('lastBlueprint');
      return data || null;
    },
    refetchOnMount: 'always',
  });

  React.useEffect(() => {
    if (saveState === 'success' || saveState === 'error') {
      const timer = setTimeout(() => setSaveState('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveState]);

  React.useEffect(() => {
    refetchRecordings();
    refetchLastBlueprint();
  }, [refetchRecordings, refetchLastBlueprint]);

  const handleSaveDraft = useCallback(async () => {
    try {
      const latestBlueprint = await storageService.get('lastBlueprint');
      if (!latestBlueprint) {
        setError('No recording to save. Please record a test first.');
        return;
      }

      // Save via API
      setSaveState('saving');
      setError(null);

      // Import and call the save recording API
      const { saveRecording } = await import('@/api/recording');
      await saveRecording(latestBlueprint);
      
      setSaveState('success');
      queryClient.setQueryData(['last-blueprint'], null);
      refetchRecordings();
    } catch (e: any) {
      setSaveState('error');
      setError(e.message || 'Failed to save draft');
    }
  }, [selectedProjectId, refetchRecordings, queryClient]);

  const filteredRecordings = (Array.isArray(recordings) ? recordings : [])
    .filter(
      rec =>
        !selectedProjectId ||
        rec.project_id?.toString() === selectedProjectId
    )
    .slice(0, 5);

  const handleStartRecording = () => {
    setError(null);
    // Recording requires browser extension
    toast.info('Recording feature requires browser extension');
  };

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleStartRename = (e: React.MouseEvent, rec: TestBlueprint) => {
    e.stopPropagation();
    setEditingId(rec.id);
    setEditName(rec.name);
  };

  const handleRename = async (id: string) => {
    if (editName.trim() && editName !== recordings.find((r: any) => r.id === id)?.name) {
      try {
        await updateRecording(id, { name: editName.trim() } as any);
        refetchRecordings();
      } catch (error) {
        toast.error('Failed to rename recording');
      }
    }
    setEditingId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleRename(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleRunTest = (blueprint: TestBlueprint) => {
    // Playback requires test runner service
    toast.info('Playback feature requires a test runner service');
    onClose();
  };

  const handleDelete = async (id: string) => {
    setIsDeletingId(id);
    try {
      await deleteRecording(id);
      setDeletedId(id);
      setConfirmDeleteId(null);
      setTimeout(() => {
        setDeletedId(null);
        queryClient.invalidateQueries({ queryKey: ['recordings-blueprints'] });
      }, 1500);
    } catch (error) {
      setError('Failed to delete recording');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleCopyVideoLink = (e: React.MouseEvent, blueprint: TestBlueprint) => {
    e.stopPropagation();
    if (blueprint.video_url) {
      navigator.clipboard.writeText(blueprint.video_url);
      toast.success('Video link copied to clipboard');
    } else {
      toast.error('No video available for this recording');
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-[380px] w-full bg-white"
      onMouseDown={e => e.stopPropagation()}
      onMouseUp={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
      onPointerUp={e => e.stopPropagation()}
    >
      {/* Header with Project Selector */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Test Recordings</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {filteredRecordings.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ProjectSelect
            value={selectedProjectId}
            onSelect={project => setSelectedProject(project)}
            mode="single"
            portalContainer={getPortalContainer()}
            placeholder="Project"
            extraOptions={{ allProjects: true }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-50">
            {[1, 2, 3].map(i => (
              <CompactRecordingSkeleton key={i} />
            ))}
          </div>
        ) : filteredRecordings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FileText className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm">No recordings yet</p>
            <p className="text-xs text-gray-400 mt-1">Start recording to create tests</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="divide-y divide-gray-50">
              {filteredRecordings.map((rec: any) => {
                const isEditing = editingId === rec.id;
                const isConfirming = confirmDeleteId === rec.id;
                const isDeleting = isDeletingId === rec.id;
                const isDeleted = deletedId === rec.id;

                return (
                  <motion.div
                    key={rec.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: isDeleted ? 0 : 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={cn(
                      'px-4 py-3 hover:bg-gray-50 transition-colors',
                      isDeleted && 'bg-green-50',
                      isConfirming && 'bg-red-50'
                    )}
                  >
                    {isDeleted ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Deleted</span>
                      </div>
                    ) : isConfirming ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-600 font-medium">
                          Delete this recording?
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs bg-red-600 hover:bg-red-700"
                            onClick={() => handleDelete(rec.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Delete'
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                ref={editInputRef}
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                onKeyDown={e => handleRenameKeyDown(e, rec.id)}
                                className="h-7 text-sm"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => handleRename(rec.id)}
                              >
                                <Check className="w-3 h-3 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="w-3 h-3 text-gray-400" />
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {rec.name}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {rec.created_at
                                ? new Date(rec.created_at).toLocaleDateString()
                                : 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {rec.steps?.length || 0} steps
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-gray-100"
                            onClick={() => handleRunTest(rec)}
                            title="Run test"
                          >
                            <Play className="w-3.5 h-3.5 text-gray-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-gray-100"
                            onClick={e => handleStartRename(e, rec)}
                            title="Rename"
                          >
                            <Pencil className="w-3.5 h-3.5 text-gray-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-gray-100"
                            onClick={() => setConfirmDeleteId(rec.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-gray-600" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
        <Button
          size="sm"
          variant="ghost"
          className="text-xs text-gray-600 hover:text-gray-900"
          onClick={onViewAll}
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          View All
        </Button>
        <Button
          size="sm"
          className="text-xs bg-zinc-600 hover:bg-zinc-700 text-white"
          onClick={handleStartRecording}
        >
          <Plus className="w-3 h-3 mr-1" />
          New Recording
        </Button>
      </div>
    </div>
  );
};
