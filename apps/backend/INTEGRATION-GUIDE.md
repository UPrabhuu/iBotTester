# Integration Guide: Using the Playwright Execution Engine

This guide shows how to integrate the new Playwright Execution Engine with existing iBotTester services.

## Quick Integration

### Option 1: Use the Engine Directly

```typescript
import { PlaywrightExecutionEngine, TestPlan } from './src/engine';

// In your controller or service
async function executeTest(testPlan: TestPlan) {
  const engine = new PlaywrightExecutionEngine({
    headless: true,
    screenshots: true,
    recordVideo: true
  });
  
  const result = await engine.executeTestPlan(testPlan);
  return result;
}
```

### Option 2: Replace ExecutionAgentService

The new `PlaywrightExecutionEngine` is a drop-in replacement for `ExecutionAgentService` with enhanced features:

**Before (ExecutionAgentService):**
```typescript
import { ExecutionAgentService } from './services/executionAgentService';

const agent = new ExecutionAgentService();
const result = await agent.executeTestPlan(testPlan, options);
```

**After (PlaywrightExecutionEngine):**
```typescript
import { PlaywrightExecutionEngine } from './engine';

const engine = new PlaywrightExecutionEngine(options);
const result = await engine.executeTestPlan(testPlan);
```

## Enhanced Features

The new engine provides:

1. **Better type safety** - Comprehensive TypeScript definitions
2. **Progress tracking** - Real-time callbacks for monitoring
3. **Event system** - Subscribe to execution events
4. **File-based screenshots** - Both base64 and file saving
5. **Better error handling** - Detailed error information
6. **More actions** - 12 supported actions vs 8 in original

## API Endpoint Integration

### Update `/api/execute-test-plan` Endpoint

```typescript
app.post('/api/execute-test-plan', async (req: Request, res: Response) => {
  const { testPlan, options = {} } = req.body;
  
  if (!testPlan || !testPlan.steps) {
    return res.status(400).json({ 
      success: false, 
      error: 'Test plan with steps is required' 
    });
  }

  try {
    // Use the new engine
    const engine = new PlaywrightExecutionEngine({
      headless: options.headless !== false,
      screenshots: options.screenshots !== false,
      recordVideo: options.recordVideo || false,
      videoDir: './test-results/videos',
      screenshotDir: './test-results/screenshots',
    });

    // Optional: Track progress
    engine.onProgress((progress) => {
      // Send progress updates via WebSocket or Server-Sent Events
      console.log(`Progress: ${progress.currentStep}/${progress.totalSteps}`);
    });

    const result = await engine.executeTestPlan(testPlan);

    res.json({
      success: true,
      execution: result,
    });
  } catch (error: any) {
    console.error('Error executing test plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute test plan',
      details: error.message,
    });
  }
});
```

## Database Integration

Store execution results in the database:

```typescript
import prisma from './utils/prisma';
import { PlaywrightExecutionEngine } from './engine';

async function runAndStoreTest(testCaseId: string) {
  // Load test plan from database
  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    include: { steps: true }
  });

  // Convert to TestPlan format
  const testPlan = convertToTestPlan(testCase);

  // Execute
  const engine = new PlaywrightExecutionEngine({
    headless: true,
    screenshots: true,
    recordVideo: true
  });

  const result = await engine.executeTestPlan(testPlan);

  // Store results
  await prisma.execution.create({
    data: {
      testCaseId,
      status: result.status.toLowerCase(),
      startedAt: new Date(result.startTime!),
      completedAt: new Date(result.endTime!),
      duration: result.duration,
      resultsJson: result.steps,
      screenshotsJson: result.evidence.screenshots.map((s, i) => ({
        id: `screenshot-${i}`,
        label: `Step ${i + 1}`,
        url: s,
        timestamp: new Date()
      })),
      summary: result.summary,
      videoPath: result.evidence.video
    }
  });

  return result;
}
```

## Real-time Progress Updates

Use Server-Sent Events or WebSockets:

```typescript
app.get('/api/executions/:id/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { testPlan } = req.body;
  const engine = new PlaywrightExecutionEngine();

  engine.onProgress((progress) => {
    res.write(`data: ${JSON.stringify(progress)}\n\n`);
  });

  engine.onEvent((event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  const result = await engine.executeTestPlan(testPlan);
  res.write(`data: ${JSON.stringify({ type: 'complete', result })}\n\n`);
  res.end();
});
```

## Converting Between Formats

### From Database to TestPlan

```typescript
function convertToTestPlan(testCase: any): TestPlan {
  return {
    testId: testCase.id,
    name: testCase.name,
    description: testCase.description,
    steps: testCase.steps.map((step: any) => ({
      step: step.stepNumber,
      action: step.action,
      target: step.elementLocator,
      description: step.expectedResult,
      retryPolicy: {
        maxRetries: 2,
        timeout: 30000
      }
    })),
    createdAt: testCase.createdAt.toISOString()
  };
}
```

### From JSON File to TestPlan

```typescript
import * as fs from 'fs';

function loadTestPlanFromFile(filepath: string): TestPlan {
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}
```

## Migration Path

If you're currently using `ExecutionAgentService`:

1. **Both can coexist** - No need to remove the old service immediately
2. **Gradual migration** - Start with new tests using the new engine
3. **Feature flag** - Use environment variable to toggle between engines:

```typescript
const USE_NEW_ENGINE = process.env.USE_NEW_EXECUTION_ENGINE === 'true';

if (USE_NEW_ENGINE) {
  const engine = new PlaywrightExecutionEngine(options);
  return await engine.executeTestPlan(testPlan);
} else {
  const agent = new ExecutionAgentService();
  return await agent.executeTestPlan(testPlan, options);
}
```

## Best Practices

1. **Error Handling** - Always wrap execution in try-catch
2. **Resource Cleanup** - The engine handles cleanup automatically
3. **Timeout Management** - Set appropriate timeouts based on your needs
4. **Screenshot Storage** - Consider storing in cloud storage for production
5. **Video Files** - Videos can be large, store only when needed
6. **Log Management** - Archive or clean up old logs regularly

## Example: Complete Controller

```typescript
import { Request, Response } from 'express';
import { PlaywrightExecutionEngine, TestPlan } from '../engine';
import prisma from '../utils/prisma';

export const executeTestCase = async (req: Request, res: Response) => {
  try {
    const { testCaseId } = req.body;
    const userId = req.user?.id;

    // Load test case
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
      include: { 
        steps: true,
        project: { select: { userId: true } }
      }
    });

    if (!testCase || testCase.project.userId !== userId) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    // Convert to test plan
    const testPlan: TestPlan = convertToTestPlan(testCase);

    // Create execution record
    const execution = await prisma.execution.create({
      data: {
        testCaseId,
        status: 'running',
        startedAt: new Date()
      }
    });

    // Execute asynchronously
    executeInBackground(execution.id, testPlan);

    res.json({
      success: true,
      executionId: execution.id,
      status: 'running'
    });
  } catch (error: any) {
    console.error('Execute test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function executeInBackground(executionId: string, testPlan: TestPlan) {
  try {
    const engine = new PlaywrightExecutionEngine({
      headless: true,
      screenshots: true,
      recordVideo: true
    });

    const result = await engine.executeTestPlan(testPlan);

    // Update execution record
    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: result.status.toLowerCase(),
        completedAt: new Date(),
        duration: result.duration,
        resultsJson: result.steps,
        screenshotsJson: result.evidence.screenshots,
        summary: result.summary,
        videoPath: result.evidence.video
      }
    });
  } catch (error) {
    console.error('Background execution error:', error);
    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: 'error',
        completedAt: new Date(),
        summary: error.message
      }
    });
  }
}
```

## Support

For questions or issues:
- See `README-EXECUTION-ENGINE.md` for detailed documentation
- Check `examples/run-execution-engine.ts` for working examples
- Review type definitions in `src/engine/types.ts`
