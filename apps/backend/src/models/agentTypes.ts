// Agent Types and Interfaces for iBotTester

export interface TestInput {
  prompt: string;
  environment?: 'staging' | 'prod';
  runType?: 'regression' | 'single';
  options?: {
    headless?: boolean;
    recordVideo?: boolean;
    screenshots?: boolean;
  };
}

export interface TestStep {
  step: number;
  action: string;
  target?: string;
  url?: string;
  query?: string;
  rule?: string;
  value?: string;
  retryPolicy?: {
    maxRetries: number;
    timeout: number;
  };
}

export interface TestPlan {
  name: string;
  testId: string;
  steps: TestStep[];
  createdAt: string;
}

export interface StepResult {
  step: number;
  status: 'PASS' | 'FAIL' | 'SKIPPED';
  action: string;
  timestamp: string;
  screenshot?: string;
  error?: string;
  fallbackUsed?: boolean;
}

export interface FlowDifference {
  type: 'breaking' | 'non-breaking' | 'cosmetic';
  description: string;
  element?: string;
  oldValue?: string;
  newValue?: string;
}

export interface TestEvidence {
  screenshots: string[];
  video?: string;
  logs: string[];
}

export interface TestOutput {
  testId: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL';
  steps: StepResult[];
  evidence: TestEvidence;
  diff: FlowDifference[];
  summary: string;
  confidence?: number;
  suggestedFixes?: string[];
}
