import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  GitCommit,
  Clock,
  User,
  ChevronRight,
  FileText,
  Plus,
  Minus,
  RefreshCw,
  ArrowLeft,
  Hash,
} from 'lucide-react';
import type { SpecCommit, CommitDetail } from '@/api/specs';

interface CommitHistoryProps {
  commits: SpecCommit[];
  loading?: boolean;
  onRefresh?: () => void;
  onSelectCommit?: (sha: string) => void;
  selectedCommit?: CommitDetail | null | undefined;
  loadingDetail?: boolean;
  className?: string;
}

export function CommitHistory({
  commits,
  loading,
  onRefresh,
  onSelectCommit,
  selectedCommit,
  loadingDetail,
  className,
}: CommitHistoryProps) {
  const [view, setView] = useState<'list' | 'detail'>('list');

  const handleSelectCommit = (sha: string) => {
    setView('detail');
    onSelectCommit?.(sha);
  };

  const handleBack = () => setView('list');

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-muted/20 shrink-0">
        {view === 'detail' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </button>
            <span className="text-[13px] font-semibold">Commit Details</span>
          </div>
        ) : (
          <>
            <span className="text-[13px] font-semibold">History</span>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="text-muted-foreground/50 hover:text-foreground transition-colors p-1 rounded hover:bg-muted/50"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <CommitList
                commits={commits}
                loading={loading}
                onSelect={handleSelectCommit}
              />
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <CommitDetailView commit={selectedCommit} loading={loadingDetail} />
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}

function CommitList({
  commits,
  loading,
  onSelect,
}: {
  commits: SpecCommit[];
  loading?: boolean;
  onSelect: (sha: string) => void;
}) {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-muted/50 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-muted/50 rounded w-3/4" />
              <div className="h-2.5 bg-muted/30 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center">
          <GitCommit className="h-5 w-5 text-muted-foreground/30" />
        </div>
        <p className="text-xs text-muted-foreground/50">No commits yet</p>
      </div>
    );
  }

  return (
    <div className="py-1">
      {commits.map((commit, i) => (
        <button
          key={commit.hash}
          className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors group relative"
          onClick={() => onSelect(commit.hash)}
        >
          {/* Timeline line */}
          {i < commits.length - 1 && (
            <div className="absolute left-[29px] top-[34px] bottom-0 w-px bg-border/40" />
          )}

          <div className="flex items-start gap-3">
            {/* Dot */}
            <div className="relative mt-1 shrink-0">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/60 group-hover:bg-muted-foreground transition-colors ring-4 ring-background" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-snug text-foreground/80 group-hover:text-foreground transition-colors line-clamp-2">
                {commit.message}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground/50">
                <span className="font-mono bg-muted/40 px-1.5 py-0.5 rounded text-[10px]">
                  {commit.shortHash}
                </span>
                <span>·</span>
                <span>{commit.authorName}</span>
                <span>·</span>
                <span>{formatDate(commit.committedDate)}</span>
              </div>
            </div>

            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors mt-1" />
          </div>
        </button>
      ))}
    </div>
  );
}

function CommitDetailView({
  commit,
  loading,
}: {
  commit: CommitDetail | null | undefined;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 bg-muted/50 rounded w-3/4" />
          <div className="h-3 bg-muted/30 rounded w-1/2" />
        </div>
        <div className="h-20 bg-muted/30 rounded-lg" />
      </div>
    );
  }

  if (!commit) {
    return (
      <div className="flex flex-col items-center justify-center p-10 gap-3">
        <p className="text-xs text-muted-foreground/50">Commit not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Commit meta */}
      <div className="space-y-2.5">
        <p className="text-[13px] font-semibold leading-snug text-foreground/90">
          {commit.message}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/60">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {commit.authorName}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(commit.committedDate)}
          </span>
          <span className="flex items-center gap-1 font-mono bg-muted/40 px-1.5 py-0.5 rounded text-[10px]">
            <Hash className="h-2.5 w-2.5" />
            {commit.shortHash}
          </span>
        </div>
      </div>

      {/* Diffs */}
      <div className="space-y-2.5">
        <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
          Changes ({commit.diffs?.length || 0})
        </p>
        {commit.diffs?.map((diff, i) => (
          <DiffCard key={i} diff={diff} />
        ))}
      </div>
    </div>
  );
}

function DiffCard({
  diff,
}: {
  diff: {
    oldPath: string;
    newPath: string;
    diff: string;
    newFile: boolean;
    deletedFile: boolean;
  };
}) {
  const [expanded, setExpanded] = useState(true);

  const getBadge = () => {
    if (diff.newFile)
      return (
        <span className="ml-auto inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-stone-600 bg-stone-100 dark:bg-stone-950/30 px-1.5 py-0.5 rounded-full">
          <Plus className="h-2.5 w-2.5" />
          New
        </span>
      );
    if (diff.deletedFile)
      return (
        <span className="ml-auto inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 dark:bg-stone-950/30 px-1.5 py-0.5 rounded-full">
          <Minus className="h-2.5 w-2.5" />
          Deleted
        </span>
      );
    return null;
  };

  return (
    <div className="rounded-lg border border-border/40 overflow-hidden">
      <button
        className="flex items-center gap-2 w-full px-3 py-2 text-xs bg-muted/20 hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <FileText className="h-3 w-3 text-muted-foreground/50 shrink-0" />
        <span className="truncate text-foreground/70 font-medium">
          {diff.newFile ? diff.newPath : diff.deletedFile ? diff.oldPath : diff.newPath}
        </span>
        {getBadge()}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <pre className="p-3 text-[11px] leading-relaxed font-mono overflow-x-auto whitespace-pre-wrap bg-muted/10 border-t border-border/20">
              {diff.diff}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}
