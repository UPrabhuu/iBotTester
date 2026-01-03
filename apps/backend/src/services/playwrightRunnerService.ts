import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { EvidenceCollectorService } from './evidenceCollectorService';
import { ExecutionEvent, ExecutionEventListener } from '../types/execution-events';
import { executionWebSocketHub } from './executionWebSocketHub';
import { createLogger } from '../utils/logger';

const logger = createLogger('PlaywrightRunner');

export interface TestStep {
  stepNumber: number;
  action: string;
  selector?: string;
  value?: string;
  expectedResult?: string;
  description?: string;
}

export interface PlaywrightRunnerConfig {
  browserType?: 'chromium' | 'firefox' | 'webkit';
  headless?: boolean;
  viewport?: { width: number; height: number };
  timeout?: number;
  screenshotsEnabled?: boolean;
  videoEnabled?: boolean;
  traceEnabled?: boolean;
  frameInterval?: number; // milliseconds between frame captures (default: 300)
}

export interface PlaywrightExecutionResult {
  executionId: string;
  status: 'completed' | 'failed';
  duration: number;
  steps: StepResult[];
  evidenceIds: string[];
  error?: string;
}

export interface StepResult {
  stepNumber: number;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshot?: string;
}

export class PlaywrightRunnerService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private evidenceCollector: EvidenceCollectorService;
  private frameInterval: number = 300; // ms
  private frameCounter: number = 0;
  private frameIntervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.evidenceCollector = new EvidenceCollectorService();
  }

  /**
   * Emit execution event to WebSocket clients
   */
  private emitEvent(event: ExecutionEvent): void {
    logger.debug(`Event: ${event.type}`, { executionId: event.executionId });
    executionWebSocketHub.broadcastEvent(event);
  }

  async executeTest(
    executionId: string,
    testSteps: TestStep[],
    startUrl: string,
    config: PlaywrightRunnerConfig = {}
  ): Promise<PlaywrightExecutionResult> {
    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    const evidenceIds: string[] = [];
    this.frameInterval = config.frameInterval || 300;
    this.isRunning = true;
    this.frameCounter = 0;

    try {
      // Emit run started
      this.emitEvent({
        type: 'run_started',
        executionId,
        timestamp: Date.now(),
        testName: 'Playwright Test Execution',
        totalSteps: testSteps.length,
        startUrl,
      });

      // Initialize browser
      await this.initializeBrowser(config);

      // Navigate to start URL
      if (this.page) {
        await this.page.goto(startUrl, { waitUntil: 'networkidle' });

        // Setup page event listeners
        this.setupPageListeners(executionId);

        // Start interval-based frame capture
        this.startFrameCapture(executionId);

        // Capture initial screenshot
        if (config.screenshotsEnabled !== false) {
          await this.captureAndEmitFrame(executionId);
          const evidenceId = await this.evidenceCollector.captureScreenshot(
            executionId,
            this.page,
            0,
            'Initial page load'
          );
          evidenceIds.push(evidenceId);
        }
      }

      // Execute each test step
      for (const step of testSteps) {
        // Emit step started
        this.emitEvent({
          type: 'step_started',
          executionId,
          timestamp: Date.now(),
          stepNumber: step.stepNumber,
          action: step.action,
          description: step.description,
          selector: step.selector,
        });

        const stepResult = await this.executeStep(executionId, step, config);
        stepResults.push(stepResult);

        // Emit step finished
        this.emitEvent({
          type: 'step_finished',
          executionId,
          timestamp: Date.now(),
          stepNumber: step.stepNumber,
          status: stepResult.status,
          duration: stepResult.duration,
          error: stepResult.error,
        });

        if (stepResult.status === 'failed') {
          break; // Stop execution on first failure
        }

        // Capture frame after step
        if (config.screenshotsEnabled !== false && this.page) {
          await this.captureAndEmitFrame(executionId);
          const evidenceId = await this.evidenceCollector.captureScreenshot(
            executionId,
            this.page,
            step.stepNumber,
            step.description || step.action
          );
          evidenceIds.push(evidenceId);
        }
      }

      // Stop frame capture
      this.stopFrameCapture();

      // Capture trace if enabled
      if (config.traceEnabled && this.context) {
        const traceId = await this.evidenceCollector.captureTrace(
          executionId,
          this.context
        );
        evidenceIds.push(traceId);
      }

      const duration = Date.now() - startTime;
      const allPassed = stepResults.every(r => r.status === 'passed');

      // Emit run finished
      this.emitEvent({
        type: 'run_finished',
        executionId,
        timestamp: Date.now(),
        status: allPassed ? 'passed' : 'failed',
        totalDuration: duration,
      });

      return {
        executionId,
        status: allPassed ? 'completed' : 'failed',
        duration,
        steps: stepResults,
        evidenceIds,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Emit run finished with error
      this.emitEvent({
        type: 'run_finished',
        executionId,
        timestamp: Date.now(),
        status: 'failed',
        totalDuration: duration,
      });

      return {
        executionId,
        status: 'failed',
        duration,
        steps: stepResults,
        evidenceIds,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      this.isRunning = false;
      this.stopFrameCapture();
      await this.cleanup();
    }
  }

  /**
   * Setup page event listeners for console and errors
   */
  private setupPageListeners(executionId: string): void {
    if (!this.page) return;

    // Listen to console messages
    this.page.on('console', (msg) => {
      this.emitEvent({
        type: 'console',
        executionId,
        timestamp: Date.now(),
        level: msg.type() as any,
        text: msg.text(),
      });
    });

    // Listen to page errors
    this.page.on('pageerror', (error) => {
      this.emitEvent({
        type: 'log',
        executionId,
        timestamp: Date.now(),
        level: 'error',
        message: `Page Error: ${error.message}`,
      });
    });

    // Listen to request failures
    this.page.on('requestfailed', (request) => {
      this.emitEvent({
        type: 'log',
        executionId,
        timestamp: Date.now(),
        level: 'warning',
        message: `Request Failed: ${request.url()} - ${request.failure()?.errorText}`,
      });
    });
  }

  /**
   * Start interval-based frame capture
   */
  private startFrameCapture(executionId: string): void {
    if (this.frameIntervalId) {
      clearInterval(this.frameIntervalId);
    }

    this.frameIntervalId = setInterval(async () => {
      if (this.isRunning && this.page) {
        try {
          await this.captureAndEmitFrame(executionId);
        } catch (error) {
          logger.error('Frame capture error', { error, executionId });
        }
      }
    }, this.frameInterval);
  }

  /**
   * Stop interval-based frame capture
   */
  private stopFrameCapture(): void {
    if (this.frameIntervalId) {
      clearInterval(this.frameIntervalId);
      this.frameIntervalId = null;
    }
  }

  /**
   * Capture and emit a single frame
   */
  private async captureAndEmitFrame(executionId: string): Promise<void> {
    if (!this.page) return;

    try {
      const screenshot = await this.page.screenshot({ type: 'png' });
      const base64 = screenshot.toString('base64');

      this.emitEvent({
        type: 'frame',
        executionId,
        timestamp: Date.now(),
        mime: 'image/png',
        base64,
        seq: this.frameCounter++,
      });
    } catch (error) {
      logger.error('Screenshot error', { error, executionId });
    }
  }

  private async initializeBrowser(config: PlaywrightRunnerConfig): Promise<void> {
    const browserType = config.browserType || 'chromium';
    
    this.browser = await chromium.launch({
      headless: config.headless !== false,
    });

    this.context = await this.browser.newContext({
      viewport: config.viewport || { width: 1920, height: 1080 },
      ...(config.videoEnabled && {
        recordVideo: {
          dir: './videos/',
        },
      }),
    });

    if (config.traceEnabled) {
      await this.context.tracing.start({ screenshots: true, snapshots: true });
    }

    this.page = await this.context.newPage();
    
    // Set default timeout
    this.page.setDefaultTimeout(config.timeout || 30000);
  }

  private async executeStep(
    executionId: string,
    step: TestStep,
    config: PlaywrightRunnerConfig
  ): Promise<StepResult> {
    const stepStartTime = Date.now();

    try {
      if (!this.page) {
        throw new Error('Page not initialized');
      }

      // Execute action based on step type
      switch (step.action.toLowerCase()) {
        case 'click':
          if (step.selector) {
            await this.page.click(step.selector);
          }
          break;

        case 'fill':
        case 'type':
          if (step.selector && step.value) {
            await this.page.fill(step.selector, step.value);
          }
          break;

        case 'navigate':
        case 'goto':
          if (step.value) {
            await this.page.goto(step.value, { waitUntil: 'networkidle' });
          }
          break;

        case 'wait':
          if (step.value) {
            await this.page.waitForTimeout(parseInt(step.value, 10));
          }
          break;

        case 'assert':
        case 'verify':
          if (step.selector && step.expectedResult) {
            const element = await this.page.locator(step.selector);
            const text = await element.textContent();
            if (text !== step.expectedResult) {
              throw new Error(`Expected "${step.expectedResult}" but got "${text}"`);
            }
          }
          break;

        case 'screenshot':
          await this.evidenceCollector.captureScreenshot(
            executionId,
            this.page,
            step.stepNumber,
            step.description || 'Manual screenshot'
          );
          break;

        default:
          logger.warn(`Unknown action: ${step.action}`, { stepNumber: step.stepNumber });
      }

      const duration = Date.now() - stepStartTime;

      return {
        stepNumber: step.stepNumber,
        status: 'passed',
        duration,
      };
    } catch (error) {
      const duration = Date.now() - stepStartTime;
      
      // Capture error screenshot
      if (this.page && config.screenshotsEnabled !== false) {
        await this.evidenceCollector.captureScreenshot(
          executionId,
          this.page,
          step.stepNumber,
          `Error: ${step.description || step.action}`
        );
      }

      return {
        stepNumber: step.stepNumber,
        status: 'failed',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      logger.error('Error during cleanup', { error });
    } finally {
      this.page = null;
      this.context = null;
      this.browser = null;
    }
  }

  async stopExecution(): Promise<void> {
    await this.cleanup();
  }
}
