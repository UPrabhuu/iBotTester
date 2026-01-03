import { useState, useEffect, useCallback, useRef } from 'react';
import { batchExecutionsApi } from '@/services/api';

export interface TestExecution {
  id: string;
  order: number;
  testCaseId: string;
  testCaseName: string;
  projectName: string;
  branchId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  errorMessage?: string;
  currentUrl?: string;
  lastScreenshot?: string;
}

export interface ExecutionBatch {
  id: string;
  batchName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalTests: number;
  completedTests: number;
  passedTests: number;
  failedTests: number;
  executions: TestExecution[];
  startedAt: Date;
  completedAt?: Date;
}

interface UseBatchExecutionOptions {
  autoSubscribe?: boolean;
  pollInterval?: number;
}

export const useBatchExecution = (
  batchId: string | null,
  options: UseBatchExecutionOptions = {}
) => {
  const [batch, setBatch] = useState<ExecutionBatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { autoSubscribe = true, pollInterval = 500 } = options;

  // Subscribe to SSE updates
  const subscribe = useCallback(async () => {
    if (!batchId) return;

    try {
      // Get initial batch data
      const result = await batchExecutionsApi.getById(batchId);
      if (result.success && result.data) {
        setBatch(result.data);
      }

      // Subscribe to SSE for live updates
      if (autoSubscribe) {
        const eventSource = await batchExecutionsApi.streamUpdates(batchId);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          try {
            const update = JSON.parse(event.data);
            if (update.type === 'batch_update' && update.data) {
              setBatch(update.data);
            } else if (update.type === 'batch_complete') {
              unsubscribe();
            }
          } catch (parseError) {
            console.error('Error parsing SSE message:', parseError);
          }
        };

        eventSource.onerror = () => {
          console.error('SSE error occurred');
          eventSource.close();
          eventSourceRef.current = null;
        };
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to batch updates');
    }
  }, [batchId, autoSubscribe]);

  // Unsubscribe from SSE
  const unsubscribe = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Create new batch execution
  const createBatch = useCallback(
    async (data: {
      projectId: string;
      branchId?: string;
      conversationId?: string;
      testCaseIds: string[];
      batchName?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await batchExecutionsApi.create(data);
        if (result.success && result.data) {
          setBatch(result.data);
          return result.data;
        } else {
          throw new Error(result.error || 'Failed to create batch');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create batch';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update execution status
  const updateExecution = useCallback(
    async (executionId: string, updates: any) => {
      try {
        const result = await batchExecutionsApi.update(batchId!, {
          executions: [
            {
              id: executionId,
              ...updates,
            },
          ],
        });
        if (result.success && result.data) {
          setBatch(result.data);
        }
      } catch (err) {
        console.error('Failed to update execution:', err);
      }
    },
    [batchId]
  );

  // Get list of batches
  const listBatches = useCallback(
    async (filters?: {
      projectId?: string;
      status?: string;
      limit?: number;
    }) => {
      try {
        const result = await batchExecutionsApi.getAll(filters);
        return result.success ? result.data || [] : [];
      } catch (err) {
        console.error('Failed to list batches:', err);
        return [];
      }
    },
    []
  );

  // Auto-subscribe when batchId changes
  useEffect(() => {
    if (batchId) {
      subscribe();
      return () => {
        unsubscribe();
      };
    }
  }, [batchId, subscribe, unsubscribe]);

  return {
    batch,
    loading,
    error,
    createBatch,
    updateExecution,
    listBatches,
    subscribe,
    unsubscribe,
  };
};

// Hook to simulate execution progress (for demo/testing)
export const useSimulatedExecution = (batch: ExecutionBatch | null) => {
  useEffect(() => {
    if (!batch || batch.status !== 'running') return;

    // Simulate progress for running executions
    const interval = setInterval(() => {
      setBatch((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          executions: prev.executions.map((exec) => {
            if (exec.status === 'running' && exec.progress < 100) {
              return {
                ...exec,
                progress: Math.min(100, exec.progress + Math.random() * 15),
              };
            } else if (exec.status === 'running' && exec.progress >= 100) {
              // Randomly complete or fail
              const shouldFail = Math.random() < 0.1;
              return {
                ...exec,
                status: shouldFail ? 'failed' : 'completed',
                progress: 100,
                completedAt: new Date(),
                duration: Math.floor(Math.random() * 60 + 10),
                errorMessage: shouldFail ? 'Assertion failed: Expected element not found' : undefined,
              };
            }
            return exec;
          }),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [batch?.status]);
};

export default useBatchExecution;
