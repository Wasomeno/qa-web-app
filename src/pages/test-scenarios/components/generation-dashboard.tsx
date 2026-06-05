import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  ListChecks,
  X,
} from 'lucide-react';
import type {
  ScenarioImportFeedItem,
  ScenarioImportStatus,
} from '@/api/test-scenario';
import type { SyncStepInfo } from '../hooks/use-project-sync';
import { cn } from '@/lib/utils';

const easing: [number, number, number, number] = [0.16, 1, 0.3, 1];
const COMPLETED_VISIBLE_MS = 4000;

interface ScenarioFeedCardProps {
  item: ScenarioImportFeedItem;
  index: number;
}

const statusCopy = {
  pending: 'Pending',
  importing: 'Importing',
  imported: 'Imported',
  error: 'Error',
} as const;

const ScenarioFeedCard: React.FC<ScenarioFeedCardProps> = ({ item, index }) => {
  const isImporting = item.status === 'importing';
  const isImported = item.status === 'imported';
  const isError = item.status === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.24, ease: easing, delay: index * 0.035 }}
      className="rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm shadow-slate-950/[0.03]"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border',
            isImporting && 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-400',
            isImported && 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-400',
            isError && 'border-red-200 bg-red-50 text-red-600 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-400',
            !isImporting && !isImported && !isError && 'border-border bg-muted/30 text-muted-foreground',
          )}
        >
          {isImporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isImported ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : isError ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Clock3 className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {item.title}
              </p>
              {item.sourcePath && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {item.sourcePath}
                </p>
              )}
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset',
                isImporting && 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800/50',
                isImported && 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800/50',
                isError && 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800/50',
                !isImporting && !isImported && !isError && 'bg-muted text-muted-foreground ring-border',
              )}
            >
              {statusCopy[item.status]}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="tabular-nums">
              {item.testCaseCount} test case{item.testCaseCount === 1 ? '' : 's'}
            </span>
          </div>

          {item.error && (
            <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-2 text-xs leading-5 text-red-700 dark:bg-red-950/30 dark:text-red-300">
              {item.error}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface ScenarioImportDashboardProps {
  importStatus: ScenarioImportStatus;
  generationMessage?: string;
  generationStep?: SyncStepInfo | null;
  onDismiss?: () => void;
}

export const ScenarioImportDashboard: React.FC<ScenarioImportDashboardProps> = ({
  importStatus,
  generationMessage,
  generationStep,
  onDismiss,
}) => {
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncing = importStatus.state === 'syncing';
  const isImporting = importStatus.state === 'importing';
  const isCompleted = importStatus.state === 'completed';
  const isError = importStatus.state === 'error';
  const isActive = isSyncing || isImporting;
  const feed = importStatus.feed ?? [];
  const counts = importStatus.counts ?? { total: 0, imported: 0, pending: 0, failed: 0 };
  const generationProgress =
    generationStep && generationStep.totalSteps > 0
      ? Math.min(
          100,
          Math.max(
            0,
            generationStep.progress ??
              Math.round((generationStep.currentStep / generationStep.totalSteps) * 100),
          ),
        )
      : null;

  useEffect(() => {
    if (!isCompleted || !onDismiss) return;
    dismissTimer.current = setTimeout(onDismiss, COMPLETED_VISIBLE_MS);
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [isCompleted, onDismiss]);

  const title = isError
    ? 'Import failed'
    : isCompleted
      ? 'Import complete'
      : isSyncing
        ? 'Syncing specs repository'
        : 'Importing test scenarios';

  const iconClass = isError
    ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-400'
    : isCompleted
      ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-400'
      : 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-400';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: easing }}
      className="flex-1 overflow-hidden flex flex-col"
    >
      <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: easing }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-slate-950/[0.04]"
          >
            <div className="flex items-start justify-between gap-4 px-5 py-5 md:px-6">
              <div className="flex min-w-0 items-start gap-3.5">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border', iconClass)}>
                  {isActive ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {importStatus.indicatorText}
                  </p>
                  {importStatus.current?.title && isImporting && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Current: <span className="font-medium text-foreground">{importStatus.current.title}</span>
                      {importStatus.current.total ? (
                        <span className="tabular-nums"> ({importStatus.current.index}/{importStatus.current.total})</span>
                      ) : null}
                    </p>
                  )}
                  {importStatus.error && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                      {importStatus.error}
                    </p>
                  )}
                  {isCompleted && generationMessage && (
                    <div className="mt-3 max-w-xl rounded-xl border border-border bg-background/70 px-3 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-xs font-medium text-foreground">
                          {generationMessage}
                        </p>
                        {generationStep && (
                          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                            {generationStep.currentStep} of {generationStep.totalSteps}
                          </span>
                        )}
                      </div>
                      {generationProgress !== null && (
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            className="h-full rounded-full bg-foreground"
                            initial={{ width: 0 }}
                            animate={{ width: `${generationProgress}%` }}
                            transition={{ duration: 0.35, ease: easing }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {(isCompleted || isError) && onDismiss && (
                <button
                  onClick={onDismiss}
                  className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid border-t border-border/70 bg-muted/20 sm:grid-cols-3">
              <div className="px-5 py-4 sm:border-r sm:border-border/70">
                <p className="text-2xl font-semibold tabular-nums text-foreground">
                  {counts.total}
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Found
                </p>
              </div>
              <div className="px-5 py-4 sm:border-r sm:border-border/70">
                <p className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {counts.imported}
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Imported
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-2xl font-semibold tabular-nums text-red-600 dark:text-red-400">
                  {counts.failed}
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Errors
                </p>
              </div>
            </div>
          </motion.div>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-950/[0.03]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground ring-1 ring-inset ring-border">
                  <ListChecks className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Scenario feed
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Markdown scenarios reported by the backend
                  </p>
                </div>
              </div>
              {feed.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground tabular-nums">
                  {feed.length}
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-[calc(100vh-430px)] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {feed.length > 0 ? (
                  feed.map((item, index) => (
                    <ScenarioFeedCard
                      key={item.sourcePath || item.id || index}
                      item={item}
                      index={index}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <FileText className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground">
                      {isCompleted ? 'No scenario files found' : 'Reading docs/test-scenarios'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isCompleted
                        ? 'The backend completed the import without reporting Markdown scenarios.'
                        : 'Scenario files will appear here when the backend reports them.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export const GenerationDashboard = ScenarioImportDashboard;
