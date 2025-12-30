// Backend TypeScript types for iBotTester

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Only for authentication, not returned in API
  phone?: string;
  company?: string;
  role?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestExecution {
  id: string;
  suiteName: string;
  labels: string[];
  status: 'running' | 'passed' | 'failed' | 'pending';
  timestamp: Date;
  duration: number; // in milliseconds
  results?: string;
  triggeredBy: string;
  projectId: string;
  branchId: string;
  testCaseId?: string;
  logs?: string[];
  screenshots?: Screenshot[];
  createdAt: Date;
}

export interface Screenshot {
  id: string;
  label: string;
  url: string;
  timestamp: Date;
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
  steps: string[]; // Array of step IDs
}

export interface TestStep {
  id: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
  elementLocator?: string;
  uiSection: string; // folder/section name
  testCaseId: string;
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

export interface ChatMessage {
  id: string;
  chatId: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  steps?: ExecutionStep[];
  isStreaming?: boolean;
  status?: 'completed' | 'wip' | 'pending';
  hasExecution?: boolean;
  executionId?: string;
}

export interface ExecutionStep {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'done' | 'success' | 'error';
}

export interface ChatHistory {
  id: string;
  title: string;
  userId: string;
  projectId?: string;
  timestamp: Date;
  lastMessageAt: Date;
}

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

export interface Integration {
  name: string;
  icon: string;
  connected: boolean;
  config?: {
    url?: string;
    apiKey?: string;
    workspace?: string;
    [key: string]: any;
  };
}

export interface UserSettings {
  userId: string;
  profile: User;
  integrations: Integration[];
  notifications: {
    email: boolean;
    slack: boolean;
    testFailures: boolean;
  };
}
