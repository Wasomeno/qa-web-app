import { useEffect, useRef, useCallback, useState } from 'react';
import type { ScenarioImportStatus } from '@/api/test-scenario';

export interface StreamEvent {
  type: string;
  resourceType?: string;
  resourceId?: string;
  stage: string;
  message: string;
  stepInfo?: {
    currentStep: number;
    totalSteps: number;
    stepName: string;
    action?: string;
    progress?: number;
  };
  importStatus?: ScenarioImportStatus;
  errorInfo?: {
    code?: string;
    details?: string;
  };
  timestamp: string;
}

type StreamEventHandler = (event: StreamEvent) => void;

interface UseStreamEventsOptions {
  resourceId?: string;
  type?: string;
  onEvent?: StreamEventHandler;
  enabled?: boolean;
}

/**
 * Subscribes to the unified SSE stream endpoint and calls onEvent for each event.
 */
export const useStreamEvents = (options: UseStreamEventsOptions = {}) => {
  const { resourceId, type, onEvent, enabled = true } = options;
  const eventSourceRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const connect = useCallback(() => {
    // Build URL with optional filters
    const params = new URLSearchParams();
    if (resourceId) params.set('resourceId', resourceId);
    if (type) params.set('type', type);

    // Add session_id for auth
    const authSessionId = localStorage.getItem('qa_webapp_session_id');
    if (authSessionId) {
      params.set('session_id', authSessionId);
    }

    const url = `/api/stream${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('[useStreamEvents] Connecting to:', url);

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[useStreamEvents] SSE connection opened');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: StreamEvent = JSON.parse(event.data);
        console.log('[useStreamEvents] Received event:', data);
        if (onEventRef.current) {
          onEventRef.current(data);
        }
      } catch (e) {
        console.warn('[useStreamEvents] Failed to parse event:', e);
      }
    };

    eventSource.onerror = (error) => {
      console.warn('[useStreamEvents] SSE error:', error);
      setIsConnected(false);
    };
  }, [resourceId, type]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('[useStreamEvents] Disconnecting SSE');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }

    connect();

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    disconnect,
    reconnect: connect,
  };
};

export default useStreamEvents;
