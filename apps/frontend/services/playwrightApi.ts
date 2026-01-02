import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface PlaywrightExecution {
  id: string;
  testCaseId?: string;
  projectId?: string;
  userId: string;
  executionName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  browserType: string;
  viewportJson?: any;
  configJson?: any;
  errorMessage?: string;
  triggeredBy?: string;
  executionType: 'manual' | 'scheduled' | 'ci-cd';
  evidenceData?: EvidenceData[];
  validationResult?: ValidationResult;
  executionReport?: ExecutionReport;
}

export interface EvidenceData {
  id: string;
  playwrightExecutionId: string;
  evidenceType: 'screenshot' | 'video' | 'trace' | 'network' | 'console';
  stepNumber?: number;
  stepDescription?: string;
  timestamp: Date;
  dataUrl?: string;
  metadataJson?: any;
  fileSize?: number;
  mimeType?: string;
}

export interface ValidationResult {
  id: string;
  playwrightExecutionId: string;
  overallStatus: 'passed' | 'failed' | 'warning';
  validationType: string;
  issuesFound: number;
  issuesJson?: any[];
  visualDiffScore?: number;
  visualDiffUrl?: string;
  expectedDataJson?: any;
  actualDataJson?: any;
  diffDataJson?: any;
  aiAnalysis?: string;
  createdAt: Date;
}

export interface ExecutionReport {
  id: string;
  playwrightExecutionId: string;
  reportType: 'standard' | 'detailed' | 'summary';
  summary: string;
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  skippedSteps: number;
  performanceMetrics?: any;
  coverageData?: any;
  recommendationsJson?: any[];
  reportDataJson: any;
  createdAt: Date;
}

export interface TestStep {
  stepNumber: number;
  action: string;
  selector?: string;
  value?: string;
  expectedResult?: string;
  description?: string;
}

export interface ExecutionConfig {
  browserType?: 'chromium' | 'firefox' | 'webkit';
  headless?: boolean;
  viewport?: { width: number; height: number };
  timeout?: number;
  screenshotsEnabled?: boolean;
  videoEnabled?: boolean;
  traceEnabled?: boolean;
  validation?: {
    enableVisualDiff?: boolean;
    enableAIAnalysis?: boolean;
    baselineScreenshot?: string;
    expectedData?: any;
    validationRules?: any[];
  };
}

export const playwrightApi = {
  // Create new execution
  createExecution: async (data: {
    testCaseId?: string;
    projectId?: string;
    userId?: string;
    executionName: string;
    testSteps: TestStep[];
    startUrl: string;
    config?: ExecutionConfig;
    triggeredBy?: string;
    executionType?: string;
  }): Promise<{ success: boolean; executionId: string }> => {
    const response = await axios.post(`${API_BASE_URL}/api/playwright/executions`, data);
    return response.data;
  },

  // Start execution
  startExecution: async (
    executionId: string,
    data: {
      testSteps: TestStep[];
      startUrl: string;
      config?: ExecutionConfig;
    }
  ): Promise<{ success: boolean; executionId: string }> => {
    const response = await axios.post(
      `${API_BASE_URL}/api/playwright/executions/${executionId}/start`,
      data
    );
    return response.data;
  },

  // Get execution by ID
  getExecution: async (executionId: string): Promise<PlaywrightExecution> => {
    const response = await axios.get(`${API_BASE_URL}/api/playwright/executions/${executionId}`);
    return response.data.execution;
  },

  // Get all executions (with filters)
  getAllExecutions: async (filters?: {
    projectId?: string;
    userId?: string;
    status?: string;
    limit?: number;
  }): Promise<PlaywrightExecution[]> => {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await axios.get(`${API_BASE_URL}/api/playwright/executions?${params}`);
    return response.data.executions;
  },

  // Get evidence for execution
  getEvidence: async (executionId: string, type?: string): Promise<EvidenceData[]> => {
    const url = type
      ? `${API_BASE_URL}/api/playwright/executions/${executionId}/evidence?type=${type}`
      : `${API_BASE_URL}/api/playwright/executions/${executionId}/evidence`;
    const response = await axios.get(url);
    return response.data.evidence;
  },

  // Get validation result
  getValidationResult: async (executionId: string): Promise<ValidationResult> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/playwright/executions/${executionId}/validation`
    );
    return response.data.validation;
  },

  // Get execution report
  getExecutionReport: async (executionId: string): Promise<ExecutionReport> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/playwright/executions/${executionId}/report`
    );
    return response.data.report;
  },

  // Generate report manually
  generateReport: async (
    executionId: string,
    reportType: 'standard' | 'detailed' | 'summary' = 'standard'
  ): Promise<{ success: boolean; reportId: string }> => {
    const response = await axios.post(
      `${API_BASE_URL}/api/playwright/executions/${executionId}/report`,
      { reportType }
    );
    return response.data;
  },

  // Stop execution
  stopExecution: async (executionId: string): Promise<{ success: boolean }> => {
    const response = await axios.post(
      `${API_BASE_URL}/api/playwright/executions/${executionId}/stop`
    );
    return response.data;
  },

  // Delete execution
  deleteExecution: async (executionId: string): Promise<{ success: boolean }> => {
    const response = await axios.delete(
      `${API_BASE_URL}/api/playwright/executions/${executionId}`
    );
    return response.data;
  },

  // Quick test execution (create + start in one call)
  executeTest: async (data: {
    testCaseId?: string;
    projectId?: string;
    userId?: string;
    executionName: string;
    testSteps: TestStep[];
    startUrl: string;
    config?: ExecutionConfig;
  }): Promise<{ success: boolean; executionId: string }> => {
    const response = await axios.post(`${API_BASE_URL}/api/playwright/execute-test`, data);
    return response.data;
  },
};
