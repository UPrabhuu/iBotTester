// Project-related TypeScript types for iBotTester

export interface Branch {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  branches: Branch[];
  currentBranch: string; // branch id
  createdAt: Date;
  updatedAt: Date;
}

export interface TestExecution {
  id: string;
  suiteName: string;
  labels: string[];
  localExecution?: {
    status: 'running' | 'passed' | 'failed' | 'pending';
    timestamp: Date;
    duration?: number;
    results?: string;
  };
  gridExecution?: {
    status: 'running' | 'passed' | 'failed' | 'pending';
    timestamp: Date;
    duration?: number;
    results?: string;
    gridDetails?: string;
  };
  status: 'running' | 'passed' | 'failed' | 'pending';
  duration: number; // in milliseconds
  triggeredBy: string;
  projectId: string;
  branchId: string;
  createdAt: Date;
}

export interface TestCase {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  lastModified: Date;
  projectId: string;
  branchId: string;
  steps: TestStep[];
}

export interface TestStep {
  id: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
  elementLocator?: string;
  uiSection: string; // folder/section name (e.g., "Login Page", "Checkout Flow")
  testCaseId: string;
}

export interface TestStepGroup {
  sectionName: string;
  steps: TestStep[];
}

export interface ProjectConfiguration {
  id: string;
  projectId: string;
  environment: {
    baseUrl: string;
    credentials?: {
      username?: string;
      password?: string;
    };
  };
  browser: {
    type: 'chromium' | 'firefox' | 'webkit';
    headless: boolean;
    viewport?: {
      width: number;
      height: number;
    };
  };
  execution: {
    timeout: number;
    retries: number;
    screenshots: boolean;
    video: boolean;
  };
  integrations?: {
    [key: string]: any;
  };
  variables?: {
    [key: string]: string;
  };
}

export type TabType = 'test-execution' | 'test-list' | 'test-editor' | 'configuration';
