// Mock data store for development/testing
import {
  User,
  Project,
  TestCase,
  TestStep,
  TestExecution,
  ProjectConfiguration,
  ChatHistory,
  ChatMessage,
  Integration,
} from '../models/types';

// Mock Users
export const users: User[] = [
  {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123', // In real app, this would be hashed
    phone: '+1 (555) 123-4567',
    company: 'Tech Corp',
    role: 'QA Engineer',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    id: 'user-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    phone: '+1 (555) 987-6543',
    company: 'Digital Solutions',
    role: 'Test Manager',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
  },
];

// Mock Projects
export const projects: Project[] = [
  {
    id: 'project-1',
    name: 'E-commerce Testing',
    description: 'E-commerce testing suite',
    branches: [
      { id: 'branch-1', name: 'main', isDefault: true },
      { id: 'branch-2', name: 'develop', isDefault: false },
      { id: 'branch-3', name: 'feature/checkout-flow', isDefault: false },
    ],
    currentBranch: 'branch-1',
    userId: 'user-1',
    createdAt: new Date(Date.now() - 30 * 86400000),
    updatedAt: new Date(),
  },
  {
    id: 'project-2',
    name: 'Social Media Automation',
    description: 'Social media automation tests',
    branches: [
      { id: 'branch-4', name: 'main', isDefault: true },
      { id: 'branch-5', name: 'staging', isDefault: false },
    ],
    currentBranch: 'branch-4',
    userId: 'user-1',
    createdAt: new Date(Date.now() - 60 * 86400000),
    updatedAt: new Date(),
  },
];

// Mock Test Cases
export const testCases: TestCase[] = [
  {
    id: 'test-1',
    name: 'Nike Checkout Flow',
    description: 'Purchase Nike shoes under $150',
    status: 'active',
    createdAt: new Date(Date.now() - 7 * 86400000),
    lastModified: new Date(Date.now() - 86400000),
    projectId: 'project-1',
    branchId: 'branch-1',
    steps: ['step-5', 'step-6', 'step-7'],
  },
  {
    id: 'test-2',
    name: 'Login with Valid Credentials',
    description: 'Test user login functionality',
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 86400000),
    lastModified: new Date(Date.now() - 2 * 86400000),
    projectId: 'project-1',
    branchId: 'branch-1',
    steps: ['step-1', 'step-2', 'step-3', 'step-4'],
  },
  {
    id: 'test-3',
    name: 'Product Search and Filter',
    description: 'Search for products and apply filters',
    status: 'draft',
    createdAt: new Date(Date.now() - 3 * 86400000),
    lastModified: new Date(Date.now() - 3600000),
    projectId: 'project-1',
    branchId: 'branch-1',
    steps: [],
  },
];

// Mock Test Steps
export const testSteps: TestStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    action: 'Navigate to login URL',
    expectedResult: 'Login page should load successfully',
    elementLocator: 'https://example.com/login',
    uiSection: 'Login Page',
    testCaseId: 'test-2',
  },
  {
    id: 'step-2',
    stepNumber: 2,
    action: 'Enter username in username field',
    expectedResult: 'Username should be entered',
    elementLocator: '#username',
    uiSection: 'Login Page',
    testCaseId: 'test-2',
  },
  {
    id: 'step-3',
    stepNumber: 3,
    action: 'Enter password in password field',
    expectedResult: 'Password should be entered',
    elementLocator: '#password',
    uiSection: 'Login Page',
    testCaseId: 'test-2',
  },
  {
    id: 'step-4',
    stepNumber: 4,
    action: 'Click login button',
    expectedResult: 'User should be logged in and redirected to dashboard',
    elementLocator: 'button[type="submit"]',
    uiSection: 'Login Page',
    testCaseId: 'test-2',
  },
  {
    id: 'step-5',
    stepNumber: 1,
    action: 'Add item to cart',
    expectedResult: 'Item should be added to cart',
    elementLocator: '.add-to-cart-btn',
    uiSection: 'Checkout Flow',
    testCaseId: 'test-1',
  },
  {
    id: 'step-6',
    stepNumber: 2,
    action: 'Proceed to checkout',
    expectedResult: 'Checkout page should load',
    elementLocator: '.checkout-btn',
    uiSection: 'Checkout Flow',
    testCaseId: 'test-1',
  },
  {
    id: 'step-7',
    stepNumber: 3,
    action: 'Complete payment',
    expectedResult: 'Payment should be processed',
    elementLocator: '#complete-payment',
    uiSection: 'Checkout Flow',
    testCaseId: 'test-1',
  },
];

// Mock Test Executions
export const testExecutions: TestExecution[] = [
  {
    id: 'exec-1',
    suiteName: 'Nike Checkout Flow',
    labels: ['checkout', 'e2e'],
    status: 'passed',
    timestamp: new Date(Date.now() - 3600000),
    duration: 45000,
    results: 'All tests passed',
    triggeredBy: 'john.doe@example.com',
    projectId: 'project-1',
    branchId: 'branch-1',
    testCaseId: 'test-1',
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'exec-2',
    suiteName: 'Login Flow Test',
    labels: ['authentication', 'smoke'],
    status: 'running',
    timestamp: new Date(Date.now() - 300000),
    duration: 15000,
    triggeredBy: 'jane.smith@example.com',
    projectId: 'project-1',
    branchId: 'branch-1',
    testCaseId: 'test-2',
    createdAt: new Date(Date.now() - 300000),
  },
  {
    id: 'exec-3',
    suiteName: 'Product Search',
    labels: ['search', 'regression'],
    status: 'failed',
    timestamp: new Date(Date.now() - 7200000),
    duration: 32000,
    results: '2 of 5 tests failed',
    triggeredBy: 'john.doe@example.com',
    projectId: 'project-1',
    branchId: 'branch-2',
    createdAt: new Date(Date.now() - 7200000),
  },
];

// Mock Project Configurations
export const configurations: ProjectConfiguration[] = [
  {
    id: 'config-1',
    projectId: 'project-1',
    environment: {
      baseUrl: 'https://example.com',
      credentials: {
        username: 'test@example.com',
        password: '********',
      },
    },
    browser: {
      type: 'chromium',
      headless: false,
      viewport: {
        width: 1280,
        height: 720,
      },
    },
    execution: {
      timeout: 30000,
      retries: 2,
      screenshots: true,
      video: true,
    },
    integrations: {},
    variables: {},
  },
  {
    id: 'config-2',
    projectId: 'project-2',
    environment: {
      baseUrl: 'https://social-media.com',
    },
    browser: {
      type: 'chromium',
      headless: true,
      viewport: {
        width: 1920,
        height: 1080,
      },
    },
    execution: {
      timeout: 60000,
      retries: 3,
      screenshots: true,
      video: false,
    },
    integrations: {},
    variables: {},
  },
];

// Mock Chat History
export const chatHistory: ChatHistory[] = [
  {
    id: 'chat-1',
    title: 'Nike Checkout Flow',
    userId: 'user-1',
    projectId: 'project-1',
    timestamp: new Date(Date.now() - 86400000),
    lastMessageAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'chat-2',
    title: 'Login Flow',
    userId: 'user-1',
    projectId: 'project-1',
    timestamp: new Date(Date.now() - 172800000),
    lastMessageAt: new Date(Date.now() - 172800000),
  },
  {
    id: 'chat-3',
    title: 'Real Estate Flow',
    userId: 'user-1',
    projectId: 'project-1',
    timestamp: new Date(Date.now() - 259200000),
    lastMessageAt: new Date(Date.now() - 259200000),
  },
];

// Mock Chat Messages
export const chatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    chatId: 'chat-1',
    type: 'user',
    content: 'Create a test for Nike shoes checkout on Amazon',
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    id: 'msg-2',
    chatId: 'chat-1',
    type: 'agent',
    content: 'I\'ll help you create a comprehensive test for the Nike shoes checkout flow.',
    timestamp: new Date(Date.now() - 86390000),
    steps: [
      { id: 'step1', description: 'Navigate to Amazon', status: 'success' },
      { id: 'step2', description: 'Search for Nike shoes', status: 'success' },
      { id: 'step3', description: 'Add to cart', status: 'done' },
    ],
    status: 'completed',
  },
];

// Mock Integrations
export const integrations: Integration[] = [
  {
    name: 'Jira',
    icon: '🎯',
    connected: false,
    config: { url: '', apiKey: '' },
  },
  {
    name: 'GitLab',
    icon: '🦊',
    connected: false,
    config: { url: '', apiKey: '' },
  },
  {
    name: 'Slack',
    icon: '💬',
    connected: true,
    config: { workspace: 'tech-corp', apiKey: 'xoxb-****' },
  },
  {
    name: 'GitHub',
    icon: '🐙',
    connected: false,
    config: { url: '', apiKey: '' },
  },
];

// Helper functions to generate IDs
let idCounter = Date.now();
export const generateId = (prefix: string = 'id'): string => {
  idCounter++;
  return `${prefix}-${idCounter}`;
};
