import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import type { ProjectSyncState, SyncStepInfo } from '../hooks/use-project-sync';
import { cn } from '@/lib/utils';

const easing: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface SyncProgressPanelProps {
  syncState: ProjectSyncState;
  syncMessage: string;
  syncStep?: SyncStepInfo | null;
  syncError?: string;
  onDismiss?: () => void;
  hidden?: boolean;
}

export const SyncProgressPanel: React.FC<SyncProgressPanelProps> = ({
  syncState,
  syncMessage,
  syncStep,
  syncError,
  onDismiss,
  hidden = false,
}) => {
  const isActive = syncState !== 'idle' && !hidden;
  const isWorking = syncState === 'syncing' || syncState === 'importing';

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={syncState}
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3, ease: easing }}
          className="overflow-hidden"
        >
          <div
            role="status"
            aria-live="polite"
            className={cn(
              'rounded-xl border px-4 py-3',
              isWorking &&
                'border-amber-200 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-950/30',
              syncState === 'completed' &&
                'border-emerald-200 bg-emerald-50 dark:border-emerald-800/30 dark:bg-emerald-950/30',
              syncState === 'error' &&
                'border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-950/30',
            )}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                  isWorking && 'bg-amber-100 text-amber-700 dark:bg-amber-800/40 dark:text-amber-400',
                  syncState === 'completed' &&
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-400',
                  syncState === 'error' &&
                    'bg-red-100 text-red-700 dark:bg-red-800/40 dark:text-red-400',
                )}
              >
                {isWorking && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                {syncState === 'completed' && (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {syncState === 'error' && (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isWorking && 'text-amber-800 dark:text-amber-300',
                    syncState === 'completed' && 'text-emerald-800 dark:text-emerald-300',
                    syncState === 'error' && 'text-red-800 dark:text-red-300',
                  )}
                >
                  {syncMessage || 'Processing…'}
                </p>

                {/* Progress bar — only shown during syncing when step info is available */}
                {isWorking && syncStep && syncStep.totalSteps > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 rounded-full bg-amber-200/60 dark:bg-amber-800/30">
                      <motion.div
                        className="h-full rounded-full bg-amber-500 dark:bg-amber-500"
                        initial={{ width: '0%' }}
                        animate={{
                          width: `${Math.round((syncStep.currentStep / syncStep.totalSteps) * 100)}%`,
                        }}
                        transition={{ duration: 0.4, ease: easing }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono text-amber-700 dark:text-amber-400">
                        {syncStep.stepName}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500 tabular-nums">
                        {syncStep.currentStep} of {syncStep.totalSteps}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error detail */}
                {syncState === 'error' && syncError && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {syncError}
                  </p>
                )}
              </div>

              {/* Dismiss button — shown on error */}
              {syncState === 'error' && onDismiss && (
                <button
                  onClick={onDismiss}
                  className="shrink-0 rounded-md p-1 text-red-500 hover:bg-red-200/50 dark:hover:bg-red-800/30 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
