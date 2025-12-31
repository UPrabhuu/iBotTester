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
  executionName: string;
  labels: string[];
  status: 'running' | 'passed' | 'failed' | 'pending';
  timestamp: Date;
  duration: number; // in milliseconds
  results?: string;
  triggeredBy: string;
  executionType: 'Local' | 'CLI' | 'CI/CD' | 'Scheduled';
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

export type TabType = 'home' | 'dashboard' | 'test-list' | 'test-execution' | 'editor' | 'config' | 'live-execution' | 'settings' | 'docs' | 'login' | 'register';

// Sidebar navigation state
export interface SidebarNavigation {
  home: boolean;
  selectedProject: string | null;
  selectedBranch: string | null;
  activeTab: 'dashboard' | 'test-list' | 'test-execution' | 'editor' | 'config' | null;
}

// Dashboard metrics and analytics
export interface DashboardMetrics {
  totalTests: number;
  passRate: number;
  avgDuration: number;
  activeSuites: number;
  executionTrends: ExecutionTrendData[];
  recentActivity: ActivityItem[];
  slowestTests: SlowTestItem[];
  testDistribution: TestDistribution;
}

export interface ExecutionTrendData {
  date: string;
  passed: number;
  failed: number;
  total: number;
}

export interface ActivityItem {
  id: string;
  testName: string;
  status: 'passed' | 'failed' | 'running';
  timestamp: Date;
  duration?: number;
}

export interface SlowTestItem {
  id: string;
  name: string;
  duration: number;
}

export interface TestDistribution {
  passed: number;
  failed: number;
  skipped: number;
  running: number;
}
