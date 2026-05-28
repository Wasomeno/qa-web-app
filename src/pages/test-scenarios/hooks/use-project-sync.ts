import { useEffect, useState, useCallback } from 'react';
import { useStreamEvents, StreamEvent } from '@/pages/agent/hooks/use-stream-events';

export type ProjectSyncState = 'idle' | 'syncing' | 'completed' | 'error';

export interface SyncStepInfo {
  currentStep: number;
  totalSteps: number;
  stepName: string;
}

interface UseProjectSyncOptions {
  projectId?: string;
  enabled?: boolean;
  onSyncComplete?: (event: StreamEvent) => void;
  onSyncError?: (event: StreamEvent) => void;
}

/**
 * Tracks background scenario sync progress for a project via SSE events.
 * Exposes syncState, syncMessage, syncStep (progress detail), and syncError.
 * When syncState is 'completed', auto-resets to 'idle' after 5s.
 */
export function useProjectSync(options: UseProjectSyncOptions = {}) {
  const { projectId, enabled = true, onSyncComplete, onSyncError } = options;
  const [syncState, setSyncState] = useState<ProjectSyncState>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [syncImported, setSyncImported] = useState<number>(0);
  const [syncError, setSyncError] = useState('');
  const [syncStep, setSyncStep] = useState<SyncStepInfo | null>(null);

  const handleEvent = useCallback(
    (event: StreamEvent) => {
      // Only handle project generation events
      if (event.resourceType !== 'project') {
        return;
      }

      switch (event.stage) {
        case 'progress':
          setSyncState('syncing');
          if (event.stepInfo) {
            setSyncStep({
              currentStep: event.stepInfo.currentStep,
              totalSteps: event.stepInfo.totalSteps,
              stepName: event.stepInfo.stepName,
            });
          }
          if (event.message) {
            setSyncMessage(event.message);
          }
          break;

        case 'start':
          setSyncState('syncing');
          setSyncMessage(event.message);
          if (event.stepInfo) {
            setSyncStep({
              currentStep: event.stepInfo.currentStep,
              totalSteps: event.stepInfo.totalSteps,
              stepName: event.stepInfo.stepName,
            });
          }
          break;

        case 'done':
          setSyncState('completed');
          setSyncStep(null);
          setSyncMessage(event.message);
          setSyncImported((event as any).imported ?? 0);
          onSyncComplete?.(event);
          break;

        case 'error':
          setSyncState('error');
          setSyncStep(null);
          setSyncError(event.message);
          setSyncMessage(`Sync failed: ${event.message}`);
          onSyncError?.(event);
          break;
      }
    },
    [onSyncComplete, onSyncError],
  );

  useStreamEvents({
    resourceId: projectId,
    type: 'generation',
    onEvent: handleEvent,
    enabled: enabled && !!projectId,
  });

  // Auto-reset to idle after a brief delay for completed state
  useEffect(() => {
    if (syncState === 'completed') {
      const timer = setTimeout(() => {
        setSyncState('idle');
        setSyncMessage('');
        setSyncStep(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [syncState]);

  return {
    syncState,
    syncMessage,
    syncImported,
    syncError,
    syncStep,
    reset: () => {
      setSyncState('idle');
      setSyncMessage('');
      setSyncError('');
      setSyncStep(null);
    },
  };
}
