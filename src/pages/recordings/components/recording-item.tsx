import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  MoreVertical,
  Clock,
  Bot,
  FileCode,
  FileJson,
  Copy,
  Trash2,
  Download,
  Pencil,
  Loader2,
  AlertCircle,
  Link,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TestBlueprint } from '@/types/recording';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { ProjectSelect } from '@/components/project-select';
import { updateRecording } from '@/api/recording';
import { StyledCheckbox } from '@/components/ui/styled-checkbox';

interface RecordingItemProps {
  recording: TestBlueprint;
  onClick?: () => void;
  viewMode?: 'grid' | 'list';
  onRun: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onRename: (id: string, newName: string) => void;
  onExportPlaywright: (e: React.MouseEvent) => void;
  onExportJson: (e: React.MouseEvent) => void;
  onRunInAgent: (e: React.MouseEvent) => void;
  onCopyScript: (e: React.MouseEvent) => void;
  onCopyVideoLink?: (e: React.MouseEvent) => void;
  portalContainer?: HTMLElement | null;
  isDeleting?: boolean;
  deleteError?: string | null;
  // List-view selection props
  isSelected?: boolean;
  onToggleSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectionActive?: boolean;
}

export const RecordingItem: React.FC<RecordingItemProps> = ({
  recording,
  onClick,
  viewMode = 'grid',
  onRun,
  onDelete,
  onRename,
  onExportPlaywright,
  onExportJson,
  onRunInAgent,
  onCopyScript,
  onCopyVideoLink,
  portalContainer,
  isDeleting = false,
  deleteError = null,
  isSelected = false,
  onToggleSelect,
  selectionActive = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editName, setEditName] = useState(recording.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const videoUrl = recording.video_url || (recording as any).videoUrl;

  useEffect(() => {
    if (isDeleting) {
      setIsConfirmingDelete(false);
    }
  }, [isDeleting]);

  const handleUpdateProject = async (project: any) => {
    try {
      await updateRecording(recording.id, { project_id: project?.id ?? null } as any);
      toast.success('Project updated');
    } catch (error) {
      toast.error('Failed to update project');
      console.error('Failed to update project:', error);
    }
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleStartEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsEditing(true);
    setEditName(recording.name);
  };

  const handleSave = () => {
    if (editName.trim() && editName !== recording.name) {
      onRename(recording.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditName(recording.name);
      setIsEditing(false);
    }
  };

  const Actions = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        container={portalContainer ?? undefined}
        onClick={e => e.stopPropagation()}
      >
        <DropdownMenuItem className="gap-2" onClick={onRunInAgent}>
          <Bot className="w-4 h-4 text-zinc-900" /> Run in Agent
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" onClick={handleStartEdit}>
          <Pencil className="w-4 h-4" /> Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <Download className="w-4 h-4" /> Export
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem className="gap-2" onClick={onExportPlaywright}>
              <FileCode className="w-4 h-4" /> Playwright Test
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={onExportJson}>
              <FileJson className="w-4 h-4" /> JSON Data
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem className="gap-2" onClick={onCopyScript}>
          <Copy className="w-4 h-4" /> Copy Test Script
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onCopyVideoLink?.(e);
          }}
          disabled={!recording.video_url}
        >
          <Link className="w-4 h-4" /> Copy Video Link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={cn(
            "gap-2",
            isDeleting ? "text-zinc-400 cursor-not-allowed" : "text-red-600 focus:text-red-600"
          )}
          onClick={e => {
            e.stopPropagation();
            if (!isDeleting) {
              setIsConfirmingDelete(true);
            }
          }}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          {isDeleting ? 'Deleting...' : 'Delete'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // ─── List view ───
  if (viewMode === 'list') {
    const statusColor = cn(
      recording.status === 'ready' && 'bg-emerald-400',
      recording.status === 'processing' && 'bg-amber-400',
      recording.status === 'failed' && 'bg-red-400',
      !recording.status && 'bg-zinc-300'
    );

    return (
      <div
        role="button"
        className="flex items-center gap-3 py-3 px-4 border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors group cursor-pointer relative"
        onClick={onClick}
      >
        {/* Delete confirmation / error overlay */}
        <AnimatePresence>
          {(isConfirmingDelete || isDeleting || deleteError) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-red-50/95 backdrop-blur-sm z-10 flex items-center gap-3 px-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 text-red-500 animate-spin shrink-0" />
                ) : deleteError ? (
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                ) : (
                  <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                )}
                <span className="text-sm text-red-700 truncate">
                  {isDeleting ? 'Deleting...' : deleteError ? deleteError : 'Delete this recording?'}
                </span>
              </div>
              {!isDeleting && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs text-zinc-600 hover:bg-white/80"
                    onClick={e => {
                      e.stopPropagation();
                      setIsConfirmingDelete(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 px-3 text-xs bg-red-600 hover:bg-red-700"
                    onClick={onDelete}
                  >
                    {deleteError ? 'Retry' : 'Delete'}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left: Thumbnail + Checkbox + Status */}
        <div className="relative w-16 h-10 shrink-0 flex items-center justify-center bg-zinc-900 rounded-lg border border-zinc-100 overflow-hidden">
          {videoUrl ? (
            <video
              src={videoUrl}
              className="w-full h-full object-cover"
              preload="metadata"
              muted
              playsInline
            />
          ) : (
            <Video className="w-5 h-5 text-zinc-700" />
          )}

          {/* Selection overlay */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-opacity duration-150 bg-black/5',
              selectionActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}
          >
            <StyledCheckbox
              checked={isSelected}
              onChange={e => {
                e.stopPropagation();
                onToggleSelect?.(e);
              }}
              size="sm"
            />
          </div>

          {/* Status dot layer (hidden when hovering/selecting) */}
          {!selectionActive && (
            <div
              className={cn(
                'absolute bottom-1 right-1 transition-opacity duration-150',
                'group-hover:opacity-0'
              )}
            >
              <div className={cn('w-2 h-2 rounded-full border border-white', statusColor)} />
            </div>
          )}
        </div>

        {/* Middle: Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Input
                ref={inputRef}
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                onClick={e => e.stopPropagation()}
                className="h-7 text-sm py-0 w-full max-w-md"
              />
            ) : (
              <span className="text-sm font-semibold text-zinc-900 truncate">
                {recording.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            {recording.description && (
              <span className="text-xs text-zinc-500 truncate max-w-[400px]">
                {recording.description}
              </span>
            )}
          </div>
        </div>

        {/* Project Picker */}
        <div className="w-48 shrink-0 flex justify-end">
          <ProjectSelect
            value={recording.project_id ?? null}
            projectName={recording.project_name}
            projectDetails={recording.projectDetails ?? null}
            onSelect={project => {
              const newProjectId = project?.id ?? null;
              handleUpdateProject({ id: recording.id, project_id: newProjectId });
            }}
            mode="single"
            size="compact"
            portalContainer={portalContainer}
            stopPropagation
          />
        </div>

        {/* Right: Date + Actions */}
        <div className="flex items-center gap-4 shrink-0 ml-4">
          {recording.created_at && (
            <span className="text-[11px] text-zinc-400 tabular-nums">
              {new Date(recording.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <Actions />
          </div>
        </div>
      </div>
    );
  }

  // ─── Grid view (clean, lightweight) ───
  return (
    <div
      role="button"
      className={cn(
        'flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all bg-white group relative h-full',
        'border border-zinc-100 hover:border-zinc-200 hover:shadow-sm',
      )}
      onClick={onClick}
    >
      {/* Top-right date */}
      {recording.created_at && (
        <span className="absolute top-3 right-3 text-[10px] text-zinc-400 font-medium tabular-nums z-20">
          {new Date(recording.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      )}

      {/* Delete confirmation banner */}
      <AnimatePresence>
        {(isConfirmingDelete || isDeleting || deleteError) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden z-30"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-red-50 border-b border-red-100">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin shrink-0" />
                ) : deleteError ? (
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                )}
                <span className="text-xs font-semibold text-red-700 truncate">
                  {isDeleting ? 'Deleting...' : deleteError ? deleteError : 'Delete this recording?'}
                </span>
              </div>
              {!isDeleting && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] text-zinc-600 hover:bg-white/80"
                    onClick={e => {
                      e.stopPropagation();
                      setIsConfirmingDelete(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-6 px-2 text-[11px] bg-red-600 hover:bg-red-700"
                    onClick={onDelete}
                  >
                    {deleteError ? 'Retry' : 'Delete'}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Thumbnail */}
      <div className="w-full h-[240px] bg-zinc-900 relative overflow-hidden border-b border-zinc-100 flex items-center justify-center">
        {videoUrl ? (
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            preload="metadata"
            muted
            playsInline
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-700">
            <Video className="w-8 h-8" />
          </div>
        )}
        
        {/* Selection overlay */}
        <div
          className={cn(
            'absolute inset-0 flex items-start p-3 transition-opacity duration-150',
            selectionActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
          <StyledCheckbox
            checked={isSelected}
            onChange={e => {
              e.stopPropagation();
              onToggleSelect?.(e);
            }}
            size="sm"
          />
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        {/* Header: Title + Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                ref={inputRef}
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                onClick={e => e.stopPropagation()}
                className="h-7 text-sm py-0"
              />
            ) : (
              <h3 className="text-sm font-semibold text-zinc-900 truncate leading-snug group-hover:text-primary transition-colors">
                {recording.name}
              </h3>
            )}
            <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">
              {recording.description || 'No description'}
            </p>
          </div>
          {/* Actions - hover only */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
            <Actions />
          </div>
        </div>

        {/* Footer: Project Picker */}
        <div className="mt-3 pt-2 flex items-center justify-between border-t border-zinc-50">
          <div className="flex-1 min-w-0">
            {recording.project_name && (
              <span className="text-[10px] text-zinc-400 truncate block">
                {recording.project_name}
              </span>
            )}
          </div>
          <ProjectSelect
            value={recording.project_id ?? null}
            projectName={recording.project_name}
            projectDetails={recording.projectDetails ?? null}
            onSelect={project => {
              const newProjectId = project?.id ?? null;
              handleUpdateProject({ id: recording.id, project_id: newProjectId });
            }}
            mode="single"
            size="compact"
            portalContainer={portalContainer}
            stopPropagation
          />
        </div>
      </div>
    </div>
  );
};
