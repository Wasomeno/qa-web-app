import { useEffect, useState, useCallback, useRef } from 'react';
import { useStreamEvents, StreamEvent } from '@/pages/agent/hooks/use-stream-events';
import type { ScenarioImportState, ScenarioImportStatus } from '@/api/test-scenario';

export type ProjectSyncState = ScenarioImportState;

export interface SyncStepInfo {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  action?: string;
  progress?: number;
}

interface UseProjectSyncOptions {
  projectId?: string;
  enabled?: boolean;
  onSyncComplete?: (event: StreamEvent) => void;
  onSyncError?: (event: StreamEvent) => void;
}

interface ImportedStreamEvent extends StreamEvent {
  imported?: number;
}

const toSyncStep = (event: StreamEvent): SyncStepInfo | null =>
  event.stepInfo
    ? {
        currentStep: event.stepInfo.currentStep,
        totalSteps: event.stepInfo.totalSteps,
        stepName: event.stepInfo.stepName,
        action: event.stepInfo.action,
        progress: event.stepInfo.progress,
      }
    : null;

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
  const [importStatus, setImportStatus] = useState<ScenarioImportStatus | null>(null);
  const [generationMessage, setGenerationMessage] = useState('');
  const [generationStep, setGenerationStep] = useState<SyncStepInfo | null>(null);
  const [errorInfo, setErrorInfo] = useState<StreamEvent['errorInfo'] | null>(null);
  const [stateProjectId, setStateProjectId] = useState(projectId);
  const importStatusRef = useRef<ScenarioImportStatus | null>(null);
  const terminalImportEventRef = useRef<string | null>(null);

  useEffect(() => {
    importStatusRef.current = importStatus;
  }, [importStatus]);

  const clearSyncStartedMarker = useCallback(() => {
    if (projectId && typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(`project:${projectId}:sync_started`);
    }
  }, [projectId]);

  const handleEvent = useCallback(
    (event: StreamEvent) => {
      // Only handle project generation events
      if (event.resourceType !== 'project') {
        return;
      }
      if (projectId && event.resourceId && event.resourceId !== projectId) {
        return;
      }

      setStateProjectId(projectId);

      if (event.importStatus) {
        const nextImportStatus = event.importStatus;
        const isTerminal =
          nextImportStatus.state === 'completed' ||
          nextImportStatus.state === 'error';
        const terminalEventKey = `${nextImportStatus.state}:${nextImportStatus.completedAt ?? nextImportStatus.updatedAt}`;

        setImportStatus(nextImportStatus);
        setSyncState(nextImportStatus.state);
        setSyncMessage(nextImportStatus.indicatorText || event.message);
        setSyncImported(nextImportStatus.counts?.imported ?? 0);
        setSyncStep(null);
        setErrorInfo(event.errorInfo ?? null);

        if (nextImportStatus.state === 'error') {
          const message = nextImportStatus.error || event.message;
          setSyncError(message);
          setSyncMessage(message ? `Sync failed: ${message}` : 'Sync failed');
        } else {
          setSyncError('');
        }

        if (isTerminal) {
          clearSyncStartedMarker();

          if (terminalImportEventRef.current !== terminalEventKey) {
            terminalImportEventRef.current = terminalEventKey;
            if (nextImportStatus.state === 'completed') {
              onSyncComplete?.(event);
            } else {
              onSyncError?.(event);
            }
          }

          if (event.stepInfo) {
            setGenerationStep(toSyncStep(event));
            setGenerationMessage(event.message);
          }
        } else {
          setGenerationStep(null);
          setGenerationMessage('');
        }

        return;
      }

      const currentImportStatus =
        stateProjectId === projectId ? importStatusRef.current : null;
      const hasActiveImport =
        currentImportStatus?.state === 'syncing' ||
        currentImportStatus?.state === 'importing';

      if (hasActiveImport) {
        return;
      }

      const nextStep = toSyncStep(event);

      switch (event.stage) {
        case 'progress':
          setSyncState('syncing');
          setSyncStep(nextStep);
          setGenerationStep(nextStep);
          if (event.message) {
            setSyncMessage(event.message);
            setGenerationMessage(event.message);
          }
          break;

        case 'start':
          setSyncState('syncing');
          setSyncMessage(event.message);
          setSyncStep(nextStep);
          setGenerationStep(nextStep);
          setGenerationMessage(event.message);
          break;

        case 'done':
          setSyncState('completed');
          setSyncStep(null);
          setGenerationStep(null);
          setSyncMessage(event.message);
          setGenerationMessage(event.message);
          setSyncImported((event as ImportedStreamEvent).imported ?? 0);
          onSyncComplete?.(event);
          break;

        case 'error':
          setSyncState('error');
          setSyncStep(null);
          setGenerationStep(null);
          setErrorInfo(event.errorInfo ?? null);
          setSyncError(event.message);
          setSyncMessage(`Sync failed: ${event.message}`);
          setGenerationMessage(event.message);
          onSyncError?.(event);
          break;
      }
    },
    [clearSyncStartedMarker, onSyncComplete, onSyncError, projectId, stateProjectId],
  );

  const stream = useStreamEvents({
    resourceId: projectId,
    type: 'generation',
    onEvent: handleEvent,
    enabled: enabled && !!projectId,
  });

  // Auto-reset to idle after a brief delay for completed state
  useEffect(() => {
    if (syncState === 'completed' && importStatus?.state !== 'completed') {
      const timer = setTimeout(() => {
        setSyncState('idle');
        setSyncMessage('');
        setSyncStep(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [importStatus?.state, syncState]);

  const isCurrentProjectState = stateProjectId === projectId;

  return {
    syncState: isCurrentProjectState ? syncState : 'idle',
    syncMessage: isCurrentProjectState ? syncMessage : '',
    syncImported: isCurrentProjectState ? syncImported : 0,
    syncError: isCurrentProjectState ? syncError : '',
    syncStep: isCurrentProjectState ? syncStep : null,
    importStatus: isCurrentProjectState ? importStatus : null,
    generationMessage: isCurrentProjectState ? generationMessage : '',
    generationStep: isCurrentProjectState ? generationStep : null,
    errorInfo: isCurrentProjectState ? errorInfo : null,
    isStreamConnected: stream.isConnected,
    reset: () => {
      setStateProjectId(projectId);
      terminalImportEventRef.current = null;
      setSyncState('idle');
      setSyncMessage('');
      setSyncError('');
      setSyncStep(null);
      setImportStatus(null);
      setGenerationMessage('');
      setGenerationStep(null);
      setErrorInfo(null);
    },
  };
}
