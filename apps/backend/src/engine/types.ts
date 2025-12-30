/**
 * Playwright Execution Engine Type Definitions
 * 
 * This file contains all type definitions for the iBotTester Playwright-based
 * test execution engine.
 */

/**
 * Configuration options for the execution engine
 */
export interface ExecutionEngineOptions {
  /** Run browser in headless mode (default: true) */
  headless?: boolean;
  /** Record video of the execution (default: false) */
  recordVideo?: boolean;
  /** Capture screenshots after each step (default: true) */
  screenshots?: boolean;
  /** Video output directory (default: './test-results/videos') */
  videoDir?: string;
  /** Screenshot output directory (default: './test-results/screenshots') */
  screenshotDir?: string;
  /** Browser viewport width (default: 1280) */
  viewportWidth?: number;
  /** Browser viewport height (default: 720) */
  viewportHeight?: number;
  /** Slow down operations by specified milliseconds (default: 0) */
  slowMo?: number;
  /** Enable browser console logging (default: true) */
  enableConsoleLogging?: boolean;
}

/**
 * Retry policy for individual test steps
 */
export interface RetryPolicy {
  /** Maximum number of retry attempts (default: 2) */
  maxRetries: number;
  /** Timeout in milliseconds for each attempt (default: 30000) */
  timeout: number;
  /** Delay between retries in milliseconds (default: 1000) */
  retryDelay?: number;
}

/**
 * Test step action types
 */
export type StepAction = 
  | 'navigate'
  | 'click'
  | 'type'
  | 'search'
  | 'validate'
  | 'wait'
  | 'add_to_cart'
  | 'proceed_to_checkout'
  | 'select'
  | 'hover'
  | 'scroll'
  | 'screenshot';

/**
 * Individual test step definition
 */
export interface TestStep {
  /** Step number/order */
  step: number;
  /** Action to perform */
  action: StepAction;
  /** Description of the step */
  description?: string;
  /** Target element selector or description */
  target?: string;
  /** URL for navigation */
  url?: string;
  /** Search query */
  query?: string;
  /** Validation rule */
  rule?: string;
  /** Value to type or select */
  value?: string;
  /** Retry policy for this step */
  retryPolicy?: RetryPolicy;
  /** Whether this is a critical step (stops execution on failure) */
  critical?: boolean;
}

/**
 * Complete test plan
 */
export interface TestPlan {
  /** Unique test identifier */
  testId: string;
  /** Human-readable test name */
  name: string;
  /** Test description */
  description?: string;
  /** List of steps to execute */
  steps: TestStep[];
  /** Creation timestamp */
  createdAt: string;
  /** Test metadata */
  metadata?: Record<string, any>;
}

/**
 * Result status for individual steps
 */
export type StepStatus = 'PASS' | 'FAIL' | 'SKIPPED';

/**
 * Result of a single test step execution
 */
export interface StepResult {
  /** Step number */
  step: number;
  /** Execution status */
  status: StepStatus;
  /** Action that was performed */
  action: StepAction;
  /** Timestamp of execution */
  timestamp: string;
  /** Screenshot data (base64) if captured */
  screenshot?: string;
  /** Error message if failed */
  error?: string;
  /** Duration in milliseconds */
  duration?: number;
  /** Whether a fallback strategy was used */
  fallbackUsed?: boolean;
  /** Number of retry attempts made */
  retryAttempts?: number;
}

/**
 * Overall test execution status
 */
export type TestStatus = 'PASS' | 'FAIL' | 'PARTIAL' | 'ERROR';

/**
 * Test evidence collected during execution
 */
export interface TestEvidence {
  /** Array of screenshot URLs or base64 data */
  screenshots: string[];
  /** Video recording path or URL */
  video?: string;
  /** Execution logs */
  logs: string[];
  /** Browser console logs */
  consoleLogs?: string[];
}

/**
 * Flow difference detection result
 */
export interface FlowDifference {
  /** Type of change detected */
  type: 'breaking' | 'non-breaking' | 'cosmetic';
  /** Description of the difference */
  description: string;
  /** Element that changed */
  element?: string;
  /** Previous value */
  oldValue?: string;
  /** New value */
  newValue?: string;
  /** Confidence score (0-1) */
  confidence?: number;
}

/**
 * Complete test execution output
 */
export interface TestExecutionResult {
  /** Test identifier */
  testId: string;
  /** Overall execution status */
  status: TestStatus;
  /** Results for each step */
  steps: StepResult[];
  /** Collected evidence */
  evidence: TestEvidence;
  /** Detected flow differences */
  diff: FlowDifference[];
  /** Human-readable summary */
  summary: string;
  /** Total execution duration in milliseconds */
  duration?: number;
  /** Execution start time */
  startTime?: string;
  /** Execution end time */
  endTime?: string;
  /** Confidence score (0-1) */
  confidence?: number;
  /** Suggested fixes for failures */
  suggestedFixes?: string[];
}

/**
 * Execution progress event
 */
export interface ExecutionProgress {
  /** Current step being executed */
  currentStep: number;
  /** Total steps */
  totalSteps: number;
  /** Current action */
  action: string;
  /** Progress status */
  status: 'running' | 'completed' | 'failed';
  /** Message */
  message?: string;
}

/**
 * Execution engine event types
 */
export type ExecutionEventType = 
  | 'start'
  | 'step_start'
  | 'step_complete'
  | 'step_fail'
  | 'complete'
  | 'error';

/**
 * Execution engine event
 */
export interface ExecutionEvent {
  /** Event type */
  type: ExecutionEventType;
  /** Event timestamp */
  timestamp: string;
  /** Event data */
  data?: any;
}

/**
 * Element locator strategy
 */
export interface ElementLocator {
  /** Locator strategy */
  strategy: 'text' | 'selector' | 'xpath' | 'role' | 'placeholder' | 'label';
  /** Locator value */
  value: string;
  /** Whether to match exactly or partially */
  exact?: boolean;
}
