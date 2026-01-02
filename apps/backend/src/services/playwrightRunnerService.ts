import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { EvidenceCollectorService } from './evidenceCollectorService';

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

  constructor() {
    this.evidenceCollector = new EvidenceCollectorService();
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

    try {
      // Initialize browser
      await this.initializeBrowser(config);

      // Navigate to start URL
      if (this.page) {
        await this.page.goto(startUrl, { waitUntil: 'networkidle' });
        
        // Capture initial screenshot
        if (config.screenshotsEnabled !== false) {
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
        const stepResult = await this.executeStep(executionId, step, config);
        stepResults.push(stepResult);

        if (stepResult.status === 'failed') {
          break; // Stop execution on first failure
        }

        // Collect evidence for this step
        if (config.screenshotsEnabled !== false && this.page) {
          const evidenceId = await this.evidenceCollector.captureScreenshot(
            executionId,
            this.page,
            step.stepNumber,
            step.description || step.action
          );
          evidenceIds.push(evidenceId);
        }
      }

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

      return {
        executionId,
        status: allPassed ? 'completed' : 'failed',
        duration,
        steps: stepResults,
        evidenceIds,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        executionId,
        status: 'failed',
        duration,
        steps: stepResults,
        evidenceIds,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      await this.cleanup();
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
          console.warn(`Unknown action: ${step.action}`);
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
      console.error('Error during cleanup:', error);
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
