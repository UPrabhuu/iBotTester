/**
 * Example: How to integrate Live Execution Viewer with ExecutionController
 * 
 * Add this to your execution creation flow to support live streaming
 */

// In your executionController.ts:

import { PlaywrightRunnerService } from '../services/playwrightRunnerService';
import { executionWebSocketHub } from '../services/executionWebSocketHub';

/**
 * Enhanced execution creation with live streaming support
 * 
 * POST /api/executions/start
 */
export const startExecutionWithLiveStream = async (req: Request, res: Response) => {
  try {
    const { testCaseId } = req.body;
    const userId = req.user?.id;

    if (!testCaseId) {
      return res.status(400).json(errorResponse('testCaseId is required'));
    }

    // Verify user has access to test case
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
      include: {
        project: {
          select: { userId: true },
        },
        steps: true,
      },
    });

    if (!testCase || testCase.project.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    // Create execution record
    const execution = await prisma.execution.create({
      data: {
        testCaseId,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    const executionId = execution.id;

    // Return executionId immediately so client can connect WebSocket
    res.json(createdResponse({
      id: executionId,
      testCaseId,
      status: 'RUNNING',
      wsUrl: `ws://localhost:${process.env.PORT || 3001}/ws/executions/${executionId}`,
    }));

    // Run execution asynchronously in background
    // (don't await - return response immediately)
    runExecutionAsync(executionId, testCase).catch((error) => {
      console.error('[Execution] Error running test:', error);
      // Update execution status in database
      prisma.execution.update({
        where: { id: executionId },
        data: {
          status: 'FAILED',
          error: error.message,
          finishedAt: new Date(),
        },
      }).catch(err => console.error('Failed to update execution:', err));
    });

  } catch (error) {
    console.error('Start execution error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

/**
 * Async execution runner - runs in background
 */
async function runExecutionAsync(executionId: string, testCase: any) {
  const runner = new PlaywrightRunnerService();

  try {
    // Convert test case to steps format
    const testSteps = testCase.steps.map((step: any) => ({
      stepNumber: step.order,
      action: step.action,
      selector: step.selector,
      value: step.value,
      expectedResult: step.expectedResult,
      description: step.description,
    }));

    const startUrl = testCase.project.baseUrl || 'https://example.com';

    // Execute with live streaming
    const result = await runner.executeTest(
      executionId,
      testSteps,
      startUrl,
      {
        screenshotsEnabled: true,
        traceEnabled: true,
        frameInterval: 300, // Send frames every 300ms
      }
    );

    // Update execution in database with results
    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: result.status === 'completed' ? 'PASSED' : 'FAILED',
        finishedAt: new Date(),
        error: result.error,
        // Store result as JSON
        result: JSON.stringify({
          steps: result.steps,
          duration: result.duration,
          evidenceIds: result.evidenceIds,
        }),
      },
    });

    console.log(`[Execution] ${executionId} completed: ${result.status}`);

  } catch (error) {
    console.error(`[Execution] ${executionId} error:`, error);
    throw error;
  } finally {
    await runner.stopExecution();
  }
}

/**
 * Optional: Get execution status
 * 
 * GET /api/executions/:id/status
 */
export const getExecutionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const execution = await prisma.execution.findUnique({
      where: { id },
    });

    if (!execution) {
      return res.status(404).json(errorResponse('Execution not found'));
    }

    res.json(successResponse({
      id: execution.id,
      status: execution.status,
      hasListeners: executionWebSocketHub.hasActiveClients(id),
      listenerCount: executionWebSocketHub.getClientCount(id),
      startedAt: execution.startedAt,
      finishedAt: execution.finishedAt,
    }));

  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

/**
 * Frontend usage example:
 * 
 * const startExecution = async () => {
 *   const response = await fetch('/api/executions/start', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ testCaseId: 'test-123' })
 *   });
 *   
 *   const { id: executionId } = await response.json();
 *   
 *   // Connect to WebSocket
 *   const { isStreaming, latestFrame, steps, logs } = useExecutionStream(executionId);
 *   
 *   // Render live execution viewer
 *   return <LiveExecutionStream executionId={executionId} />;
 * };
 */
