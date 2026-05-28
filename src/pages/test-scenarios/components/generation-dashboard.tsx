import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import type { ProjectSyncState } from '../hooks/use-project-sync';
import type { TestScenario } from '@/types/test-scenario';
import { cn } from '@/lib/utils';

const easing = [0.16, 1, 0.3, 1];
const COMPLETED_VISIBLE_MS = 4000;

interface ScenarioCardProps {
  scenario: TestScenario;
  index: number;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, index }) => {
  const procStatus = scenario.processingStatus ?? 'idle';
  const stats = scenario.automationStats ?? scenario.stats;
  const total = stats?.totalTestCases ?? 0;
  const completed =
    (stats?.generatedCount ?? 0) + (stats?.passCount ?? 0) + (stats?.failCount ?? 0);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isGenerating = procStatus === 'generating';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: easing, delay: index * 0.05 }}
      className="rounded-lg border border-border bg-card/60 px-3 py-2.5"
    >
      <div className="flex items-start gap-2.5">
        <Loader2
          className={cn(
            'mt-0.5 h-3.5 w-3.5 shrink-0',
            isGenerating ? 'animate-spin text-amber-500' : 'text-muted-foreground/30',
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">
            {scenario.title}
          </p>
          {stats && (
            <div className="mt-1.5 space-y-1">
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    isGenerating ? 'bg-amber-400' : 'bg-emerald-400',
                  )}
                  initial={{ width: '0%' }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: easing }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground tabular-nums">
                {completed}/{total} test cases
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface GenerationDashboardProps {
  /** SSE-based sync state from useProjectSync (may be idle if no SSE) */
  syncState: ProjectSyncState;
  /** Polling-derived state: true when any scenario has processingStatus === 'generating' */
  isAnyGenerating: boolean;
  /** True while the manual sync POST is in-flight (isSyncing state variable) */
  isManualSyncPending: boolean;
  /** 'started' when navigating from project creation flow */
  scenarioSync?: 'started';
  syncMessage: string;
  syncError?: string;
  scenarios: TestScenario[];
  onDismiss?: () => void;
}

/**
 * Immersive dashboard that replaces the table during test scenario generation.
 *
 * Trigger sources (any one triggers the dashboard):
 * 1. SSE syncState === 'syncing' (project creation background goroutine — now covers both import AND generation)
 * 2. Polling shows scenarios with processingStatus === 'generating' (secondary safety net)
 * 3. Manual sync is in-flight (isManualSyncPending)
 *
 * Completion sources:
 * 1. SSE syncState === 'completed' (fires only after import + generation both finish)
 * 2. Polling + debounce detects no more generating scenarios (safety net)
 * 3. Manual sync resolves (isManualSyncPending -> false)
 */
export const GenerationDashboard: React.FC<GenerationDashboardProps> = ({
  syncState,
  isAnyGenerating,
  isManualSyncPending,
  scenarioSync,
  syncMessage,
  syncError,
  scenarios,
  onDismiss,
}) => {
  const [completionVisible, setCompletionVisible] = useState(false);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scenarioSyncTimedOut, setScenarioSyncTimedOut] = useState(false);

  // Debounce: when generation activity pauses between scenarios,
  // wait 8s before allowing the state to transition to idle/completed.
  // This handles the gap between back-to-back scenarios and is a safety
  // net for when SSE events are missed (e.g. user navigates away and back).
  const [debounceComplete, setDebounceComplete] = useState(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isAnyGenerating) {
      // Generation resumed - cancel debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        setDebounceComplete(true);
      }
      return;
    }

    // No current generating activity, start debounce
    if (debounceTimerRef.current === null && debounceComplete) {
      setDebounceComplete(false);
      debounceTimerRef.current = setTimeout(() => {
        setDebounceComplete(true);
        debounceTimerRef.current = null;
        // Debounce expired: show completion
        setCompletionVisible(true);
        completionTimer.current = setTimeout(() => {
          setCompletionVisible(false);
          setDebounceComplete(true);
          onDismiss?.();
        }, COMPLETED_VISIBLE_MS);
      }, 8000);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [isAnyGenerating, debounceComplete, onDismiss]);

  // Derive effective state
  // scenarioSync is a one-shot trigger from the project creation flow — it activates the
  // dashboard on initial mount. After the first render, real data (SSE, polling) takes over.
  const effectiveState = ((): 'idle' | 'syncing' | 'completed' | 'error' => {
    if (syncState === 'error') return 'error';
    if (syncState === 'syncing') return 'syncing';
    if (isManualSyncPending) return 'syncing';
    // Keep syncing while generating or waiting for debounce (gap between scenarios)
    if (isAnyGenerating) return 'syncing';
    if (!debounceComplete) return 'syncing';
    if (syncState === 'completed' || completionVisible) return 'completed';
    // scenarioSync activates the dashboard during project creation, but is ignored
    // once the safety timeout fires to prevent a stuck state.
    if (!scenarioSyncTimedOut && scenarioSync === 'started') return 'syncing';
    return 'idle';
  })();

  // SSE completion trigger: when syncState becomes 'completed' and no debounce
  // is pending (i.e., only import ran, no generation needed), show completion.
  useEffect(() => {
    if (syncState !== 'completed' || completionVisible) return;
    if (debounceTimerRef.current) return; // debounce already running

    setCompletionVisible(true);
    completionTimer.current = setTimeout(() => {
      setCompletionVisible(false);
      onDismiss?.();
    }, COMPLETED_VISIBLE_MS);
  }, [syncState, completionVisible, onDismiss]);

  // Safety timeout: if scenarioSync triggered the dashboard but no real sync
  // events arrive within 15s, auto-dismiss to avoid a stuck "Syncing..." state.
  useEffect(() => {
    if (scenarioSync !== 'started') return;

    const timer = setTimeout(() => {
      setScenarioSyncTimedOut(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [scenarioSync]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (completionTimer.current) clearTimeout(completionTimer.current);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    setCompletionVisible(false);
    setDebounceComplete(true);
    if (completionTimer.current) clearTimeout(completionTimer.current);
    onDismiss?.();
  }, [onDismiss]);

  // Don't render if truly idle
  const isVisible =
    effectiveState === 'syncing' ||
    effectiveState === 'error' ||
    completionVisible;

  if (!isVisible) return null;

  const showStatus = effectiveState === 'syncing' || effectiveState === 'error';
  const isError = effectiveState === 'error';

  const statusColor = isError ? 'red' : completionVisible ? 'emerald' : 'amber';

  const statusBg = {
    amber: 'border-amber-200 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-950/30',
    emerald:
      'border-emerald-200 bg-emerald-50 dark:border-emerald-800/30 dark:bg-emerald-950/30',
    red: 'border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-950/30',
  }[statusColor];

  const StatusIcon = isError
    ? AlertTriangle
    : completionVisible
      ? CheckCircle2
      : Loader2;

  const generatingCount = scenarios.filter(
    (s) => s.processingStatus === 'generating',
  ).length;

  const completedScenarioCount = scenarios.filter(
    (s) => s.processingStatus !== 'generating' && s.processingStatus !== 'generation_failed',
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: easing }}
      className="flex-1 overflow-hidden flex flex-col"
    >
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left column: Status area */}
          <div className="space-y-5">
            {/* Status header card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: easing }}
              className={cn('rounded-xl border px-5 py-4', statusBg)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    {
                      amber:
                        'bg-amber-100 text-amber-700 dark:bg-amber-800/40 dark:text-amber-400',
                      emerald:
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-400',
                      red: 'bg-red-100 text-red-700 dark:bg-red-800/40 dark:text-red-400',
                    }[statusColor],
                  )}
                >
                  <StatusIcon
                    className={cn(
                      'h-4 w-4',
                      effectiveState === 'syncing' && 'animate-spin',
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn('text-sm font-semibold', {
                      amber: 'text-amber-800 dark:text-amber-300',
                      emerald: 'text-emerald-800 dark:text-emerald-300',
                      red: 'text-red-800 dark:text-red-300',
                    }[statusColor])}
                  >
                    {isError
                      ? 'Sync failed'
                      : completionVisible
                        ? 'Sync complete'
                        : 'Syncing test scenarios'}
                  </h3>

                  {completionVisible && (
                    <p className="mt-0.5 text-sm text-emerald-700/80 dark:text-emerald-400/80">
                      {completedScenarioCount > 0
                        ? `${completedScenarioCount} scenario${completedScenarioCount === 1 ? '' : 's'} imported`
                        : 'Import finished'}
                    </p>
                  )}

                  {showStatus && (
                    <p
                      className={cn('mt-0.5 text-sm', {
                        amber: 'text-amber-700/80 dark:text-amber-400/80',
                        red: 'text-red-700/80 dark:text-red-400/80',
                      }[statusColor])}
                    >
                      {syncMessage || (isManualSyncPending
                        ? 'Importing scenarios from specs repository…'
                        : generatingCount > 0
                          ? `Generating ${generatingCount} scenario${generatingCount === 1 ? '' : 's'}…`
                          : 'Preparing import…')}
                    </p>
                  )}

                  {isError && syncError && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {syncError}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {(isError || completionVisible) && onDismiss && (
                    <button
                      onClick={handleDismiss}
                      className={cn(
                        'rounded-md p-1 transition-colors',
                        isError
                          ? 'text-red-500 hover:bg-red-200/50 dark:hover:bg-red-800/30'
                          : 'text-muted-foreground hover:bg-accent',
                      )}
                      aria-label="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Live stats row */}
              {effectiveState === 'syncing' && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-white/60 dark:bg-black/20 px-3 py-2 text-center">
                    <p className="text-lg font-semibold text-foreground tabular-nums">
                      {scenarios.length}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Total
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/60 dark:bg-black/20 px-3 py-2 text-center">
                    <p className="text-lg font-semibold text-amber-600 tabular-nums">
                      {generatingCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Generating
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/60 dark:bg-black/20 px-3 py-2 text-center">
                    <p className="text-lg font-semibold text-emerald-600 tabular-nums">
                      {completedScenarioCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Imported
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Activity tip */}
            {effectiveState === 'syncing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="flex items-start gap-2.5">
                  <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Import in progress
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {isManualSyncPending
                        ? 'Fetching and parsing markdown scenarios from the specs repository. This may take a moment.'
                        : 'Scenarios are being generated from the specs repository. The list updates automatically as they complete.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right column: Scenario feed */}
          <div className="lg:border-l lg:border-border lg:pl-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-foreground">
                  Scenarios
                </h3>
              </div>
              {scenarios.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
                  {scenarios.length}
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {scenarios.length > 0 ? (
                  scenarios.map((s, i) => (
                    <ScenarioCard key={s.id} scenario={s} index={i} />
                  ))
                ) : effectiveState === 'syncing' ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-amber-400/10 animate-ping" />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                        <FileText className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-muted-foreground">
                      Waiting for scenarios…
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      Scenarios will appear here as they are imported.
                    </p>
                  </motion.div>
                ) : completionVisible ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      All scenarios processed
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Refreshing the list…
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
