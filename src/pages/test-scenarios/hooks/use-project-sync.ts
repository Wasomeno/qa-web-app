import { useEffect, useState, useCallback } from 'react';
import { useStreamEvents, StreamEvent } from '@/pages/agent/hooks/use-stream-events';

export type ProjectSyncState = 'idle' | 'syncing' | 'completed' | 'error';

interface UseProjectSyncOptions {
  projectId?: string;
  enabled?: boolean;
  onSyncComplete?: (event: StreamEvent) => void;
  onSyncError?: (event: StreamEvent) => void;
}

/**
 * Tracks background scenario sync progress for a project via SSE events.
 * Displays a transient banner during sync, then shows a brief success/error toast.
 */
export function useProjectSync(options: UseProjectSyncOptions = {}) {
  const { projectId, enabled = true, onSyncComplete, onSyncError } = options;
  const [syncState, setSyncState] = useState<ProjectSyncState>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [syncImported, setSyncImported] = useState<number>(0);
  const [syncError, setSyncError] = useState('');

  const handleEvent = useCallback(
    (event: StreamEvent) => {
      // Only handle project generation events
      if (event.resourceType !== 'project' || event.stage === 'progress') {
        return;
      }

      switch (event.stage) {
        case 'start':
          setSyncState('syncing');
          setSyncMessage(event.message);
          break;

        case 'done':
          setSyncState('completed');
          setSyncMessage(event.message);
          onSyncComplete?.(event);
          break;

        case 'error':
          setSyncState('error');
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
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [syncState]);

  return {
    syncState,
    syncMessage,
    syncImported,
    syncError,
    reset: () => {
      setSyncState('idle');
      setSyncMessage('');
      setSyncError('');
    },
  };
}
