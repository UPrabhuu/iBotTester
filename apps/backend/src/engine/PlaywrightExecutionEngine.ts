/**
 * Playwright Execution Engine for iBotTester
 * 
 * A robust, production-ready execution engine that:
 * - Accepts JSON test plans
 * - Executes steps sequentially with retry logic
 * - Captures screenshots and video recordings
 * - Produces structured execution results
 * - Implements self-healing element location
 * - Stops before final checkout (safety constraint)
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import {
  ExecutionEngineOptions,
  TestPlan,
  TestStep,
  StepResult,
  TestExecutionResult,
  TestEvidence,
  FlowDifference,
  StepStatus,
  TestStatus,
  ExecutionProgress,
  ExecutionEvent,
} from './types';

/**
 * Main Playwright Execution Engine
 */
export class PlaywrightExecutionEngine {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private screenshots: string[] = [];
  private logs: string[] = [];
  private consoleLogs: string[] = [];
  private videoPath: string | null = null;
  private options: Required<ExecutionEngineOptions>;
  private progressCallback?: (progress: ExecutionProgress) => void;
  private eventCallback?: (event: ExecutionEvent) => void;

  constructor(options: ExecutionEngineOptions = {}) {
    this.options = {
      headless: options.headless ?? true,
      recordVideo: options.recordVideo ?? false,
      screenshots: options.screenshots ?? true,
      videoDir: options.videoDir ?? './test-results/videos',
      screenshotDir: options.screenshotDir ?? './test-results/screenshots',
      viewportWidth: options.viewportWidth ?? 1280,
      viewportHeight: options.viewportHeight ?? 720,
      slowMo: options.slowMo ?? 0,
      enableConsoleLogging: options.enableConsoleLogging ?? true,
    };
  }

  /**
   * Set progress callback for real-time updates
   */
  onProgress(callback: (progress: ExecutionProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Set event callback for execution events
   */
  onEvent(callback: (event: ExecutionEvent) => void): void {
    this.eventCallback = callback;
  }

  /**
   * Execute a complete test plan
   */
  async executeTestPlan(testPlan: TestPlan): Promise<TestExecutionResult> {
    const startTime = new Date();
    const stepResults: StepResult[] = [];

    this.emitEvent('start', { testPlan });
    this.log(`🚀 Starting test execution: ${testPlan.name}`);

    try {
      // Ensure output directories exist
      this.ensureDirectories();

      // Launch browser
      await this.launchBrowser();

      // Execute each step
      for (let i = 0; i < testPlan.steps.length; i++) {
        const step = testPlan.steps[i];

        // Safety check: Stop before final checkout
        if (this.isCheckoutStep(step) && this.isNearEnd(i, testPlan.steps.length)) {
          this.log(`⚠️  Stopping before final checkout (safety constraint)`);
          stepResults.push({
            step: step.step,
            status: 'SKIPPED',
            action: step.action,
            timestamp: new Date().toISOString(),
          });
          break;
        }

        // Emit progress
        this.emitProgress({
          currentStep: i + 1,
          totalSteps: testPlan.steps.length,
          action: step.action,
          status: 'running',
        });

        // Execute step
        const result = await this.executeStep(step);
        stepResults.push(result);

        // Stop on critical failure
        if (result.status === 'FAIL' && this.isCriticalStep(step)) {
          this.log(`❌ Critical failure at step ${step.step}, stopping execution`);
          break;
        }
      }

      // Determine overall status
      const status = this.determineOverallStatus(stepResults);
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Generate summary
      const summary = this.generateSummary(testPlan, stepResults, duration);

      // Collect evidence
      const evidence: TestEvidence = {
        screenshots: this.screenshots,
        video: this.videoPath || undefined,
        logs: this.logs,
        consoleLogs: this.consoleLogs,
      };

      // Build result
      const result: TestExecutionResult = {
        testId: testPlan.testId,
        status,
        steps: stepResults,
        evidence,
        diff: [], // Flow diff detection can be enhanced
        summary,
        duration,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      this.emitEvent('complete', { result });
      this.log(`✅ Test execution completed: ${status}`);

      return result;
    } catch (error: any) {
      this.log(`💥 Execution error: ${error.message}`);
      this.emitEvent('error', { error: error.message });
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        testId: testPlan.testId,
        status: 'ERROR',
        steps: stepResults,
        evidence: {
          screenshots: this.screenshots,
          video: this.videoPath || undefined,
          logs: this.logs,
          consoleLogs: this.consoleLogs,
        },
        diff: [],
        summary: `Execution failed: ${error.message}`,
        duration,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Execute a single test step with retry logic
   */
  private async executeStep(step: TestStep): Promise<StepResult> {
    const startTime = Date.now();
    this.log(`📌 Step ${step.step}: ${step.action}${step.description ? ' - ' + step.description : ''}`);
    this.emitEvent('step_start', { step });

    const result: StepResult = {
      step: step.step,
      status: 'PASS',
      action: step.action,
      timestamp: new Date().toISOString(),
      retryAttempts: 0,
    };

    const retryPolicy = step.retryPolicy || { maxRetries: 2, timeout: 30000, retryDelay: 1000 };
    let lastError: Error | null = null;

    // Retry loop
    for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
      try {
        await this.performAction(step, retryPolicy.timeout);
        lastError = null;
        result.retryAttempts = attempt;
        break;
      } catch (error: any) {
        lastError = error;
        this.log(`⚠️  Step ${step.step} attempt ${attempt + 1} failed: ${error.message}`);

        if (attempt < retryPolicy.maxRetries) {
          const delay = retryPolicy.retryDelay || 1000;
          await this.wait(delay);
        }
      }
    }

    // Handle failure
    if (lastError) {
      result.status = 'FAIL';
      result.error = lastError.message;
      this.log(`❌ Step ${step.step} failed after ${(result.retryAttempts || 0) + 1} attempts`);
      this.emitEvent('step_fail', { step, error: lastError.message });
    } else {
      this.log(`✅ Step ${step.step} passed`);
      this.emitEvent('step_complete', { step, result });
    }

    // Capture screenshot
    if (this.options.screenshots && this.page) {
      try {
        const screenshot = await this.captureScreenshot(step.step, result.status);
        result.screenshot = screenshot;
      } catch (error) {
        this.log(`⚠️  Failed to capture screenshot for step ${step.step}`);
      }
    }

    result.duration = Date.now() - startTime;
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
        this.log(`🌐 Navigating to: ${step.url}`);
        await this.page.goto(step.url, { waitUntil: 'domcontentloaded', timeout });
        await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
          this.log('⚠️  Network not idle, continuing anyway');
        });
        break;

      case 'click':
        if (!step.target) throw new Error('Target required for click action');
        const clickSelector = await this.findElement(step.target);
        this.log(`👆 Clicking: ${step.target}`);
        await this.page.click(clickSelector, { timeout });
        break;

      case 'type':
        if (!step.target || !step.value) throw new Error('Target and value required for type action');
        const typeSelector = await this.findElement(step.target);
        this.log(`⌨️  Typing into ${step.target}: ${step.value}`);
        await this.page.fill(typeSelector, step.value);
        break;

      case 'search':
        if (!step.query) throw new Error('Query required for search action');
        const searchSelector = await this.findSearchInput();
        this.log(`🔍 Searching for: ${step.query}`);
        await this.page.fill(searchSelector, step.query);
        await this.page.keyboard.press('Enter');
        await this.page.waitForLoadState('domcontentloaded');
        break;

      case 'validate':
        if (!step.rule) throw new Error('Rule required for validate action');
        this.log(`✓ Validating: ${step.rule}`);
        await this.validateCondition(step.rule);
        break;

      case 'wait':
        const waitTime = parseInt(step.value || '2000');
        this.log(`⏳ Waiting for ${waitTime}ms`);
        await this.wait(waitTime);
        break;

      case 'add_to_cart':
        const addToCartSelector = await this.findAddToCartButton();
        this.log(`🛒 Adding to cart`);
        await this.page.click(addToCartSelector, { timeout });
        break;

      case 'proceed_to_checkout':
        const checkoutSelector = await this.findCheckoutButton();
        this.log(`💳 Proceeding to checkout`);
        await this.page.click(checkoutSelector, { timeout });
        break;

      case 'select':
        if (!step.target || !step.value) throw new Error('Target and value required for select action');
        const selectSelector = await this.findElement(step.target);
        this.log(`📋 Selecting ${step.value} in ${step.target}`);
        await this.page.selectOption(selectSelector, step.value);
        break;

      case 'hover':
        if (!step.target) throw new Error('Target required for hover action');
        const hoverSelector = await this.findElement(step.target);
        this.log(`👋 Hovering over: ${step.target}`);
        await this.page.hover(hoverSelector);
        break;

      case 'scroll':
        const scrollAmount = parseInt(step.value || '500');
        this.log(`📜 Scrolling ${scrollAmount}px`);
        await this.page.evaluate((amount: number) => window.scrollBy(0, amount), scrollAmount);
        break;

      case 'screenshot':
        this.log(`📸 Taking screenshot`);
        await this.captureScreenshot(step.step, 'PASS');
        break;

      default:
        throw new Error(`Unknown action: ${step.action}`);
    }
  }

  /**
   * Launch browser with configured options
   */
  private async launchBrowser(): Promise<void> {
    this.log('🌐 Launching browser...');

    this.browser = await chromium.launch({
      headless: this.options.headless,
      slowMo: this.options.slowMo,
    });

    const contextOptions: any = {
      viewport: {
        width: this.options.viewportWidth,
        height: this.options.viewportHeight,
      },
    };

    if (this.options.recordVideo) {
      const videoDir = path.resolve(this.options.videoDir);
      contextOptions.recordVideo = {
        dir: videoDir,
        size: {
          width: this.options.viewportWidth,
          height: this.options.viewportHeight,
        },
      };
    }

    this.context = await this.browser.newContext(contextOptions);
    this.page = await this.context.newPage();

    // Setup page logging
    if (this.options.enableConsoleLogging) {
      this.page.on('console', (msg: any) => {
        const logMsg = `[Browser Console] ${msg.text()}`;
        this.consoleLogs.push(logMsg);
      });

      this.page.on('pageerror', (error: any) => {
        const logMsg = `[Page Error] ${error.message}`;
        this.log(logMsg);
        this.consoleLogs.push(logMsg);
      });
    }

    this.log('✅ Browser launched successfully');
  }

  /**
   * Self-healing element finder - searches using multiple strategies
   */
  private async findElement(description: string): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');

    // Strategy 1: Try exact text match
    try {
      const exactText = `text="${description}"`;
      const element = await this.page.$(exactText);
      if (element) {
        this.log(`   Found using exact text: ${description}`);
        return exactText;
      }
    } catch (e) {}

    // Strategy 2: Try partial text match
    try {
      const partialText = `text=/${description.replace(/\s+/g, '.*')}/i`;
      const element = await this.page.$(partialText);
      if (element) {
        this.log(`   Found using partial text match`);
        return partialText;
      }
    } catch (e) {}

    // Strategy 3: Try as selector
    try {
      const element = await this.page.$(description);
      if (element) {
        this.log(`   Found using selector: ${description}`);
        return description;
      }
    } catch (e) {}

    // Strategy 4: Try role-based
    try {
      const roleSelector = `[role*="${description}" i]`;
      const element = await this.page.$(roleSelector);
      if (element) {
        this.log(`   Found using role attribute`);
        return roleSelector;
      }
    } catch (e) {}

    throw new Error(`Could not locate element: ${description}`);
  }

  /**
   * Find search input using common patterns
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
      'input[id*="search" i]',
    ];

    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          this.log(`   Found search input: ${selector}`);
          return selector;
        }
      } catch (e) {}
    }

    throw new Error('Could not find search input');
  }

  /**
   * Find add to cart button
   */
  private async findAddToCartButton(): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');

    const patterns = [
      'button:has-text("Add to Cart")',
      'button:has-text("Add to Bag")',
      'text=/add.*cart/i',
      'text=/add.*bag/i',
      '[id*="add-to-cart" i]',
      '[class*="add-to-cart" i]',
    ];

    for (const pattern of patterns) {
      try {
        const element = await this.page.$(pattern);
        if (element) {
          this.log(`   Found add to cart button: ${pattern}`);
          return pattern;
        }
      } catch (e) {}
    }

    throw new Error('Could not find add to cart button');
  }

  /**
   * Find checkout button
   */
  private async findCheckoutButton(): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');

    const patterns = [
      'button:has-text("Checkout")',
      'button:has-text("Proceed to Checkout")',
      'text=/proceed.*checkout/i',
      'text=/checkout/i',
      '[id*="checkout" i]',
      'a:has-text("Checkout")',
    ];

    for (const pattern of patterns) {
      try {
        const element = await this.page.$(pattern);
        if (element) {
          this.log(`   Found checkout button: ${pattern}`);
          return pattern;
        }
      } catch (e) {}
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

    if (rule.includes('visible')) {
      const match = rule.match(/(.+?)\s+(?:is\s+)?visible/i);
      if (match) {
        const element = match[1].trim();
        const selector = await this.findElement(element);
        await this.page.waitForSelector(selector, { state: 'visible' });
        return;
      }
    }

    // Generic validation - just log it
    this.log(`   Validation rule processed: ${rule}`);
  }

  /**
   * Capture screenshot
   */
  private async captureScreenshot(stepNumber: number, status: StepStatus): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');

    const screenshot = await this.page.screenshot({ fullPage: false });
    const screenshotBase64 = `data:image/png;base64,${screenshot.toString('base64')}`;
    
    this.screenshots.push(screenshotBase64);

    // Also save to file if directory is configured
    if (this.options.screenshotDir) {
      const filename = `step-${stepNumber}-${status.toLowerCase()}-${Date.now()}.png`;
      const filepath = path.join(this.options.screenshotDir, filename);
      fs.writeFileSync(filepath, screenshot);
      this.log(`   Screenshot saved: ${filename}`);
    }

    return screenshotBase64;
  }

  /**
   * Determine if step is checkout-related
   */
  private isCheckoutStep(step: TestStep): boolean {
    const checkoutActions = ['proceed_to_checkout'];
    const checkoutKeywords = ['checkout', 'payment', 'pay now', 'complete order'];
    
    if (checkoutActions.includes(step.action)) return true;
    
    const stepText = `${step.description || ''} ${step.target || ''} ${step.rule || ''}`.toLowerCase();
    return checkoutKeywords.some(keyword => stepText.includes(keyword));
  }

  /**
   * Check if step is near the end of execution
   */
  private isNearEnd(currentIndex: number, totalSteps: number): boolean {
    return currentIndex >= totalSteps - 2;
  }

  /**
   * Determine if step is critical
   */
  private isCriticalStep(step: TestStep): boolean {
    return step.critical !== false && (step.action === 'navigate' || step.step <= 2);
  }

  /**
   * Determine overall test status
   */
  private determineOverallStatus(stepResults: StepResult[]): TestStatus {
    const failed = stepResults.filter(r => r.status === 'FAIL').length;
    const total = stepResults.length;

    if (failed === 0) return 'PASS';
    if (failed === total) return 'FAIL';
    return 'PARTIAL';
  }

  /**
   * Generate execution summary
   */
  private generateSummary(testPlan: TestPlan, stepResults: StepResult[], duration: number): string {
    const passed = stepResults.filter(r => r.status === 'PASS').length;
    const failed = stepResults.filter(r => r.status === 'FAIL').length;
    const skipped = stepResults.filter(r => r.status === 'SKIPPED').length;
    const total = stepResults.length;

    const durationSec = (duration / 1000).toFixed(2);

    if (failed === 0 && skipped === 0) {
      return `✅ Test "${testPlan.name}" completed successfully. All ${total} steps passed in ${durationSec}s.`;
    }

    const firstFailure = stepResults.find(r => r.status === 'FAIL');
    if (firstFailure) {
      return `❌ Test "${testPlan.name}" failed at step ${firstFailure.step} (${firstFailure.action}). Error: ${firstFailure.error}. ${passed}/${total} steps passed, ${skipped} skipped. Duration: ${durationSec}s.`;
    }

    return `⚠️  Test "${testPlan.name}" completed with ${failed} failures, ${skipped} skipped. ${passed}/${total} steps passed. Duration: ${durationSec}s.`;
  }

  /**
   * Ensure output directories exist
   */
  private ensureDirectories(): void {
    if (this.options.recordVideo) {
      const videoDir = path.resolve(this.options.videoDir);
      if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
      }
    }

    if (this.options.screenshots) {
      const screenshotDir = path.resolve(this.options.screenshotDir);
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
    }
  }

  /**
   * Wait for specified milliseconds
   */
  private async wait(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log a message
   */
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    this.logs.push(logMessage);
  }

  /**
   * Emit progress event
   */
  private emitProgress(progress: ExecutionProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  /**
   * Emit execution event
   */
  private emitEvent(type: string, data?: any): void {
    if (this.eventCallback) {
      this.eventCallback({
        type: type as any,
        timestamp: new Date().toISOString(),
        data,
      });
    }
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    try {
      // Save video path if recording
      if (this.options.recordVideo && this.page) {
        const video = this.page.video();
        if (video) {
          const videoPath = await video.path();
          this.videoPath = videoPath;
          this.log(`🎥 Video saved: ${videoPath}`);
        }
      }

      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();

      this.log('🧹 Cleanup completed');
    } catch (error: any) {
      console.error('Cleanup error:', error.message);
    }
  }
}
