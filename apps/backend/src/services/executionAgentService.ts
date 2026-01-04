// Test Execution Agent Service
import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { TestPlan, TestStep, StepResult, TestOutput, TestEvidence, FlowDifference } from '../models/agentTypes';
import { createLogger } from '../utils/logger';

const logger = createLogger('ExecutionAgent');

export class ExecutionAgentService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private screenshots: string[] = [];
  private logs: string[] = [];

  /**
   * Execute a test plan using Playwright
   */
  async executeTestPlan(
    testPlan: TestPlan,
    options: { headless?: boolean; recordVideo?: boolean; screenshots?: boolean } = {}
  ): Promise<TestOutput> {
    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    
    try {
      // Launch browser
      await this.launchBrowser(options);

      // Execute each step
      for (const step of testPlan.steps) {
        const result = await this.executeStep(step, options.screenshots !== false);
        stepResults.push(result);

        // Stop on critical failure
        if (result.status === 'FAIL' && this.isCriticalFailure(step)) {
          this.log(`Critical failure at step ${step.step}, stopping execution`);
          break;
        }
      }

      // Determine overall status
      const status = this.determineStatus(stepResults);

      // Generate summary
      const summary = this.generateExecutionSummary(testPlan, stepResults);

      const evidence: TestEvidence = {
        screenshots: this.screenshots,
        logs: this.logs,
      };

      return {
        testId: testPlan.testId,
        status,
        steps: stepResults,
        evidence,
        diff: [], // Flow diff detection to be implemented
        summary,
      };
    } catch (error: any) {
      this.log(`Execution error: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Launch browser with specified options
   */
  private async launchBrowser(options: { headless?: boolean; recordVideo?: boolean }) {
    this.browser = await chromium.launch({
      headless: options.headless !== false,
    });

    const contextOptions: any = {
      viewport: { width: 1280, height: 720 },
    };

    if (options.recordVideo) {
      contextOptions.recordVideo = {
        dir: './test-results/videos',
        size: { width: 1280, height: 720 },
      };
    }

    this.context = await this.browser.newContext(contextOptions);
    this.page = await this.context.newPage();

    // Setup page logging
    this.page.on('console', msg => this.log(`Browser console: ${msg.text()}`));
    this.page.on('pageerror', error => this.log(`Page error: ${error.message}`));
  }

  /**
   * Execute a single test step
   */
  private async executeStep(step: TestStep, captureScreenshot: boolean): Promise<StepResult> {
    const startTime = Date.now();
    this.log(`Executing step ${step.step}: ${step.action}`);

    const result: StepResult = {
      step: step.step,
      status: 'PASS',
      action: step.action,
      timestamp: new Date().toISOString(),
    };

    try {
      const retryPolicy = step.retryPolicy || { maxRetries: 2, timeout: 30000 };
      let lastError: Error | null = null;

      // Retry logic
      for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
        try {
          await this.performAction(step, retryPolicy.timeout);
          lastError = null;
          break;
        } catch (error: any) {
          lastError = error;
          this.log(`Step ${step.step} attempt ${attempt + 1} failed: ${error.message}`);
          
          if (attempt < retryPolicy.maxRetries) {
            await this.page?.waitForTimeout(1000); // Wait before retry
          }
        }
      }

      if (lastError) {
        throw lastError;
      }

      // Capture screenshot after successful step
      if (captureScreenshot && this.page) {
        const screenshot = await this.page.screenshot();
        const screenshotBase64 = `data:image/png;base64,${screenshot.toString('base64')}`;
        this.screenshots.push(screenshotBase64);
        result.screenshot = screenshotBase64;
      }

      this.log(`Step ${step.step} completed successfully`);
    } catch (error: any) {
      result.status = 'FAIL';
      result.error = error.message;
      this.log(`Step ${step.step} failed: ${error.message}`);

      // Try to capture screenshot on failure
      try {
        if (this.page) {
          const screenshot = await this.page.screenshot();
          const screenshotBase64 = `data:image/png;base64,${screenshot.toString('base64')}`;
          this.screenshots.push(screenshotBase64);
          result.screenshot = screenshotBase64;
        }
      } catch (screenshotError) {
        this.log('Failed to capture error screenshot');
      }
    }

    return result;
  }

  /**
   * Perform the actual action based on step type
   */
  private async performAction(step: TestStep, timeout: number): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    switch (step.action) {
      case 'navigate':
        if (!step.url) throw new Error('URL required for navigate action');
        await this.page.goto(step.url, { waitUntil: 'domcontentloaded', timeout });
        break;

      case 'search':
        if (!step.query) throw new Error('Query required for search action');
        // Try common search input selectors
        const searchSelector = await this.findSearchInput();
        await this.page.fill(searchSelector, step.query);
        await this.page.keyboard.press('Enter');
        await this.page.waitForLoadState('domcontentloaded');
        break;

      case 'click':
        if (!step.target) throw new Error('Target required for click action');
        const clickSelector = await this.findElement(step.target);
        await this.page.click(clickSelector, { timeout });
        break;

      case 'type':
        if (!step.target || !step.value) throw new Error('Target and value required for type action');
        const typeSelector = await this.findElement(step.target);
        await this.page.fill(typeSelector, step.value);
        break;

      case 'validate':
        if (!step.rule) throw new Error('Rule required for validate action');
        await this.validateCondition(step.rule);
        break;

      case 'add_to_cart':
        const addToCartSelector = await this.findAddToCartButton();
        await this.page.click(addToCartSelector, { timeout });
        break;

      case 'proceed_to_checkout':
        const checkoutSelector = await this.findCheckoutButton();
        await this.page.click(checkoutSelector, { timeout });
        break;

      case 'wait':
        const waitTime = parseInt(step.value || '2000');
        await this.page.waitForTimeout(waitTime);
        break;

      default:
        throw new Error(`Unknown action: ${step.action}`);
    }
  }

  /**
   * Self-healing: Find search input using multiple strategies
   */
  private async findSearchInput(): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');

    const selectors = [
      'input[type="search"]',
      'input[name*="search" i]',
      'input[placeholder*="search" i]',
      'input[aria-label*="search" i]',
      '#search',
      '[role="searchbox"]',
      'input[id*="query" i]',
      'input[name*="q" i]',
      'input[placeholder*="find" i]',
      'input[placeholder*="query" i]',
    ];

    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          this.log(`Found search input using selector: ${selector}`);
          return selector;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    // Last resort: try to find any visible input on the page
    try {
      const inputs = await this.page.$$('input:visible, input:not([style*="display:none"])');
      if (inputs.length > 0) {
        this.log('Falling back to first visible input element');
        return 'input:first-of-type';
      }
    } catch (e) {
      // Continue to error handling
    }

    throw new Error('Could not find search input');
  }

  /**
   * Self-healing: Find element using semantic matching
   */
  private async findElement(description: string): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');

    // Try text content matching
    const textSelector = `text="${description}"`;
    try {
      const element = await this.page.$(textSelector);
      if (element) {
        this.log(`Found element using text: ${description}`);
        return textSelector;
      }
    } catch (e) {
      // Continue to other strategies
    }

    // Try partial text matching
    const partialTextSelector = `text=/${description.replace(/\s+/g, '.*')}/i`;
    try {
      const element = await this.page.$(partialTextSelector);
      if (element) {
        this.log(`Found element using partial text match`);
        return partialTextSelector;
      }
    } catch (e) {
      // Continue
    }

    throw new Error(`Could not find element: ${description}`);
  }

  /**
   * Find add to cart button using common patterns
   */
  private async findAddToCartButton(): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');

    const patterns = [
      'text="Add to Cart"',
      'text=/add.*cart/i',
      '[id*="add-to-cart" i]',
      'button:has-text("Add to Cart")',
    ];

    for (const pattern of patterns) {
      try {
        const element = await this.page.$(pattern);
        if (element) {
          this.log(`Found add to cart button: ${pattern}`);
          return pattern;
        }
      } catch (e) {
        // Continue
      }
    }

    throw new Error('Could not find add to cart button');
  }

  /**
   * Find checkout button using common patterns
   */
  private async findCheckoutButton(): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');

    const patterns = [
      'text=/proceed.*checkout/i',
      'text=/checkout/i',
      '[id*="checkout" i]',
      'button:has-text("Checkout")',
    ];

    for (const pattern of patterns) {
      try {
        const element = await this.page.$(pattern);
        if (element) {
          this.log(`Found checkout button: ${pattern}`);
          return pattern;
        }
      } catch (e) {
        // Continue
      }
    }

    throw new Error('Could not find checkout button');
  }

  /**
   * Validate a condition
   */
  private async validateCondition(rule: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    if (rule.includes('page loaded')) {
      await this.page.waitForLoadState('domcontentloaded');
      return;
    }

    // Add more validation rules as needed
    this.log(`Validation rule processed: ${rule}`);
  }

  /**
   * Check if a step failure is critical
   */
  private isCriticalFailure(step: TestStep): boolean {
    // Navigation and initial steps are critical
    return step.action === 'navigate' || step.step <= 2;
  }

  /**
   * Determine overall test status
   */
  private determineStatus(stepResults: StepResult[]): 'PASS' | 'FAIL' | 'PARTIAL' {
    const failedSteps = stepResults.filter(r => r.status === 'FAIL').length;
    const totalSteps = stepResults.length;

    if (failedSteps === 0) return 'PASS';
    if (failedSteps === totalSteps) return 'FAIL';
    return 'PARTIAL';
  }

  /**
   * Generate execution summary
   */
  private generateExecutionSummary(testPlan: TestPlan, stepResults: StepResult[]): string {
    const passed = stepResults.filter(r => r.status === 'PASS').length;
    const failed = stepResults.filter(r => r.status === 'FAIL').length;
    const total = stepResults.length;

    const firstFailure = stepResults.find(r => r.status === 'FAIL');
    
    if (failed === 0) {
      return `Test "${testPlan.name}" completed successfully. All ${total} steps passed.`;
    } else if (firstFailure) {
      return `Test "${testPlan.name}" failed at step ${firstFailure.step} (${firstFailure.action}). Error: ${firstFailure.error}. ${passed}/${total} steps passed.`;
    } else {
      return `Test "${testPlan.name}" completed with ${failed} failures. ${passed}/${total} steps passed.`;
    }
  }

  /**
   * Log a message
   */
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    logger.info(logMessage);
    this.logs.push(logMessage);
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
    } catch (error) {
      logger.error('Cleanup error', { error });
    }
  }
}
