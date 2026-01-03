import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Live Execution Stream Hook
 * Connects via WebSocket to receive real-time execution events
 */

export interface ExecutionStep {
  number: number;
  action: string;
  description?: string;
  timestamp: string;
  status?: 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
}

export interface FrameData {
  base64: string;
  timestamp: string;
  sequence: number;
}

export interface ExecutionUpdate {
  type: 'connected' | 'snapshot' | 'run_started' | 'step_started' | 'step_finished' | 'frame' | 'console' | 'log' | 'run_finished';
  executionId: string;
  timestamp: number;
  // Run started
  testName?: string;
  totalSteps?: number;
  startUrl?: string;
  // Step events
  stepNumber?: number;
  action?: string;
  status?: 'passed' | 'failed' | 'skipped' | 'running';
  duration?: number;
  error?: string;
  selector?: string;
  // Frame
  mime?: string;
  base64?: string;
  seq?: number;
  // Console/Log
  level?: 'log' | 'debug' | 'info' | 'warn' | 'error' | 'warning';
  text?: string;
  message?: string;
  // Run finished
  totalDuration?: number;
  artifacts?: {
    traceUrl?: string;
    reportUrl?: string;
  };
  // Snapshot
  lastFrame?: { base64: string; seq: number } | null;
  steps?: Array<{
    stepNumber: number;
    action: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
  }>;
  logs?: Array<{
    level: string;
    message: string;
    timestamp: number;
  }>;
}

interface UseExecutionStreamOptions {
  executionId?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export const useExecutionStream = (
  executionId: string | null,
  options: UseExecutionStreamOptions = {}
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestFrame, setLatestFrame] = useState<FrameData | null>(null);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'starting' | 'running' | 'completed' | 'failed'>('idle');
  const [startUrl, setStartUrl] = useState<string>('');
  const [totalSteps, setTotalSteps] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { autoConnect = true, reconnectAttempts = 5, reconnectDelay = 1000 } = options;

  const connect = useCallback(() => {
    if (!executionId) {
      console.warn('[ExecutionStream] No executionId provided');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[ExecutionStream] Already connected');
      return;
    }

    try {
      const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const wsUrl = `${protocol}://${new URL(baseUrl).host}/ws/executions/${executionId}`;

      console.log('[ExecutionStream] Connecting to', wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[ExecutionStream] Connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data) as ExecutionUpdate;

          switch (update.type) {
            case 'connected':
              console.log('[ExecutionStream] Connected message received');
              break;

            case 'snapshot':
              // Restore state on reconnect
              if (update.lastFrame) {
                setLatestFrame({
                  base64: update.lastFrame.base64,
                  timestamp: new Date(update.timestamp).toISOString(),
                  sequence: update.lastFrame.seq,
                });
              }
              if (update.steps) {
                const stepsWithStatus = update.steps.map((s, idx) => ({
                  number: s.stepNumber,
                  action: s.action,
                  status: s.status as any,
                  duration: s.duration,
                  error: s.error,
                  timestamp: new Date(update.timestamp).toISOString(),
                }));
                setSteps(stepsWithStatus);
              }
              if (update.logs) {
                setLogs(update.logs.map(l => `[${l.level}] ${l.message}`));
              }
              break;

            case 'run_started':
              console.log('[ExecutionStream] Run started', update.testName);
              setExecutionStatus('running');
              setIsStreaming(true);
              setStartUrl(update.startUrl || '');
              setTotalSteps(update.totalSteps || 0);
              setSteps([]);
              setLogs([]);
              setLatestFrame(null);
              break;

            case 'step_started':
              console.log(`[ExecutionStream] Step ${update.stepNumber} started: ${update.action}`);
              setSteps((prev) => [
                ...prev,
                {
                  number: update.stepNumber || 0,
                  action: update.action || '',
                  description: update.description,
                  status: 'running',
                  timestamp: new Date(update.timestamp).toISOString(),
                },
              ]);
              break;

            case 'step_finished':
              console.log(`[ExecutionStream] Step ${update.stepNumber} finished: ${update.status}`);
              setSteps((prev) =>
                prev.map((s) =>
                  s.number === update.stepNumber
                    ? {
                        ...s,
                        status: update.status as any,
                        duration: update.duration,
                        error: update.error,
                      }
                    : s
                )
              );
              break;

            case 'frame':
              // Update latest frame (only keep latest to avoid memory issues)
              setLatestFrame({
                base64: update.base64 || '',
                timestamp: new Date(update.timestamp).toISOString(),
                sequence: update.seq || 0,
              });
              break;

            case 'console':
            case 'log':
              const logMessage = `[${update.level}] ${update.text || update.message}`;
              setLogs((prev) => [...prev, logMessage]);
              break;

            case 'run_finished':
              console.log('[ExecutionStream] Run finished:', update.status);
              setExecutionStatus(update.status === 'passed' ? 'completed' : 'failed');
              setIsStreaming(false);
              break;
          }
        } catch (parseError) {
          console.error('[ExecutionStream] Parse error:', parseError);
        }
      };

      ws.onerror = (event) => {
        console.error('[ExecutionStream] WebSocket error:', event);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        console.log('[ExecutionStream] Disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Auto-reconnect
        if (reconnectAttemptsRef.current < reconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1);
          console.log(`[ExecutionStream] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError('Failed to reconnect after multiple attempts');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect';
      console.error('[ExecutionStream] Connection error:', errorMsg);
      setError(errorMsg);
    }
  }, [executionId, reconnectAttempts, reconnectDelay]);

  const disconnect = useCallback(() => {
    console.log('[ExecutionStream] Disconnecting');
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const reset = useCallback(() => {
    setLatestFrame(null);
    setSteps([]);
    setLogs([]);
    setExecutionStatus('idle');
    setStartUrl('');
    setTotalSteps(0);
    setError(null);
  }, []);

  useEffect(() => {
    if (executionId && autoConnect) {
      connect();
      return () => disconnect();
    }
  }, [executionId, autoConnect, connect, disconnect]);

  return {
    isConnected,
    isStreaming,
    error,
    latestFrame,
    steps,
    logs,
    executionStatus,
    startUrl,
    totalSteps,
    connect,
    disconnect,
    reset,
  };
};

export default useExecutionStream;
