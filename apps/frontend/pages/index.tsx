import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import HomeView from '@/components/HomeView';
import ChatPanel, { Message } from '@/components/ChatPanel';
import DashboardView from '@/components/DashboardView';
import TestExecutionTable from '@/components/TestExecutionTable';
import TestListView from '@/components/TestListView';
import TestEditorView from '@/components/TestEditorView';
import ConfigurationView from '@/components/ConfigurationView';
import LiveExecutionView from '@/components/LiveExecutionView';
import SettingsView from '@/components/SettingsView';
import PricingView from '@/components/PricingView';
import DocsView from '@/components/DocsView';
import LoginView from '@/components/LoginView';
import RegisterView from '@/components/RegisterView';
import { sampleMessages, agentResponses } from '@/components/SampleChatData';
import { authApi } from '@/services/api';
import {
  Project,
  TestExecution,
  TestCase,
  TestStep,
  ProjectConfiguration,
  TabType,
} from '@/types/project';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
}

interface Screenshot {
  id: string;
  label: string;
  url: string;
  timestamp: Date;
}

export default function Home() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  // Execution state (for future integration with live execution)
  const [isExecuting] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [logs] = useState<string[]>([]);
  const [screenshots] = useState<Screenshot[]>([]);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState<TabType>('home');
  
  // Mock projects data
  const [projects, setProjects] = useState<Project[]>([
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
      createdAt: new Date(Date.now() - 60 * 86400000),
      updatedAt: new Date(),
    },
  ]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('project-1');
  
  // Get selected project
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Mock test executions
  const [testExecutions] = useState<TestExecution[]>([
    {
      id: 'exec-1',
      executionName: 'Nike Checkout Flow',
      labels: ['checkout', 'e2e'],
      status: 'passed',
      timestamp: new Date(Date.now() - 3600000),
      duration: 45000,
      results: 'All tests passed',
      triggeredBy: 'john@example.com',
      executionType: 'Local',
      projectId: 'project-1',
      branchId: 'branch-1',
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: 'exec-2',
      executionName: 'Login Flow Test',
      labels: ['authentication', 'smoke'],
      status: 'running',
      timestamp: new Date(Date.now() - 300000),
      duration: 15000,
      triggeredBy: 'jane@example.com',
      executionType: 'CLI',
      projectId: 'project-1',
      branchId: 'branch-1',
      createdAt: new Date(Date.now() - 300000),
    },
    {
      id: 'exec-3',
      executionName: 'Product Search',
      labels: ['search', 'regression'],
      status: 'failed',
      timestamp: new Date(Date.now() - 7200000),
      duration: 32000,
      results: '2 of 5 tests failed',
      triggeredBy: 'admin@example.com',
      executionType: 'CI/CD',
      projectId: 'project-1',
      branchId: 'branch-2',
      createdAt: new Date(Date.now() - 7200000),
    },
  ]);

  // Mock test cases
  const [testCases] = useState<TestCase[]>([
    {
      id: 'test-1',
      name: 'Nike Checkout Flow',
      description: 'Purchase Nike shoes under $150',
      status: 'active',
      createdAt: new Date(Date.now() - 7 * 86400000),
      lastModified: new Date(Date.now() - 86400000),
      projectId: 'project-1',
      branchId: 'branch-1',
      steps: [{} as TestStep, {} as TestStep, {} as TestStep],
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
      steps: [{} as TestStep, {} as TestStep, {} as TestStep, {} as TestStep],
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
      steps: [{} as TestStep, {} as TestStep],
    },
    {
      id: 'test-4',
      name: 'User Registration Flow',
      description: 'Complete user registration with email verification',
      status: 'active',
      createdAt: new Date(Date.now() - 10 * 86400000),
      lastModified: new Date(Date.now() - 4 * 86400000),
      projectId: 'project-1',
      branchId: 'branch-1',
      steps: [{} as TestStep, {} as TestStep, {} as TestStep, {} as TestStep, {} as TestStep],
    },
    {
      id: 'test-5',
      name: 'Password Reset Workflow',
      description: 'Test forgot password and reset password functionality',
      status: 'active',
      createdAt: new Date(Date.now() - 12 * 86400000),
      lastModified: new Date(Date.now() - 5 * 86400000),
      projectId: 'project-1',
      branchId: 'branch-1',
      steps: [{} as TestStep, {} as TestStep, {} as TestStep],
    },
    {
      id: 'test-6',
      name: 'Add to Cart Functionality',
      description: 'Test adding multiple products to shopping cart',
      status: 'active',
      createdAt: new Date(Date.now() - 8 * 86400000),
      lastModified: new Date(Date.now() - 3 * 86400000),
      projectId: 'project-1',
      branchId: 'branch-1',
      steps: [{} as TestStep, {} as TestStep, {} as TestStep, {} as TestStep],
    },
    {
      id: 'test-7',
      name: 'Wishlist Management',
      description: 'Add, remove, and manage items in wishlist',
      status: 'inactive',
      createdAt: new Date(Date.now() - 15 * 86400000),
      lastModified: new Date(Date.now() - 10 * 86400000),
      projectId: 'project-1',
      branchId: 'branch-1',
      steps: [{} as TestStep, {} as TestStep],
    },
    {
      id: 'test-8',
      name: 'Apply Discount Coupon',
      description: 'Test discount coupon validation and application',
      status: 'active',
      createdAt: new Date(Date.now() - 6 * 86400000),
      lastModified: new Date(Date.now() - 2 * 86400000),
      projectId: 'project-1',
      branchId: 'branch-1',
      steps: [{} as TestStep, {} as TestStep, {} as TestStep],
    },
    {
      id: 'test-9',
      name: 'Product Review Submission',
      description: 'Submit and edit product reviews with ratings',
      status: 'draft',
      createdAt: new Date(Date.now() - 4 * 86400000),
      lastModified: new Date(Date.now() - 1 * 86400000),
      projectId: 'project-1',
      branchId: 'branch-1',
      steps: [{} as TestStep, {} as TestStep, {} as TestStep, {} as TestStep],
    },
    {
      id: 'test-10',
      name: 'Order History Verification',
      description: 'Verify order history displays correctly with all details',
      status: 'active',
      createdAt: new Date(Date.now() - 20 * 86400000),
      lastModified: new Date(Date.now() - 8 * 86400000),
      projectId: 'project-1',
      branchId: 'branch-1',
      steps: [{} as TestStep, {} as TestStep, {} as TestStep],
    },
    {
      id: 'test-11',
      name: 'Payment Gateway Integration',
      description: 'Test payment processing with different payment methods',
      status: 'active',
      createdAt: new Date(Date.now() - 9 * 86400000),
      lastModified: new Date(Date.now() - 3 * 86400000),
      projectId: 'project-1',
      branchId: 'branch-1',
      steps: [{} as TestStep, {} as TestStep, {} as TestStep, {} as TestStep, {} as TestStep],
    },
    {
      id: 'test-12',
      name: 'Profile Update Workflow',
      description: 'Update user profile information and avatar',
      status: 'active',
      createdAt: new Date(Date.now() - 11 * 86400000),
      lastModified: new Date(Date.now() - 6 * 86400000),
      projectId: 'project-1',
      branchId: 'branch-1',
      steps: [{} as TestStep, {} as TestStep, {} as TestStep],
    },
    {
      id: 'test-13',
      name: 'Multi-Language Support',
      description: 'Test language switching and content translation',
      status: 'inactive',
      createdAt: new Date(Date.now() - 25 * 86400000),
      lastModified: new Date(Date.now() - 15 * 86400000),
      projectId: 'project-1',
      branchId: 'branch-1',
      steps: [{} as TestStep, {} as TestStep],
    },
    {
      id: 'test-14',
      name: 'Newsletter Subscription',
      description: 'Subscribe and unsubscribe from newsletter',
      status: 'draft',
      createdAt: new Date(Date.now() - 2 * 86400000),
      lastModified: new Date(Date.now() - 1 * 86400000),
      projectId: 'project-1',
      branchId: 'branch-1',
      steps: [{} as TestStep, {} as TestStep],
    },
    {
      id: 'test-15',
      name: 'Advanced Search Filters',
      description: 'Test all search filters and sorting options',
      status: 'active',
      createdAt: new Date(Date.now() - 14 * 86400000),
      lastModified: new Date(Date.now() - 7 * 86400000),
      projectId: 'project-1',
      branchId: 'branch-1',
      steps: [{} as TestStep, {} as TestStep, {} as TestStep, {} as TestStep, {} as TestStep, {} as TestStep],
    },
    {
      id: 'test-16',
      name: 'Mobile Responsive Testing',
      description: 'Verify mobile responsive design across different screen sizes',
      status: 'active',
      createdAt: new Date(Date.now() - 13 * 86400000),
      lastModified: new Date(Date.now() - 5 * 86400000),
      projectId: 'project-1',
      branchId: 'branch-1',
      steps: [{} as TestStep, {} as TestStep, {} as TestStep, {} as TestStep],
    },
  ]);

  // Mock test steps
  const [testSteps] = useState<TestStep[]>([
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
  ]);

  // Mock configuration
  const [configuration] = useState<ProjectConfiguration>({
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
  });

  // Mock chat history
  const [chatHistory] = useState<ChatHistory[]>([
    { id: '1', title: 'Nike Checkout Flow', timestamp: new Date(Date.now() - 86400000) },
    { id: '2', title: 'Login Flow', timestamp: new Date(Date.now() - 172800000) },
    { id: '3', title: 'Real Estate Flow', timestamp: new Date(Date.now() - 259200000) },
  ]);

  // Load saved project and tab from localStorage
  useEffect(() => {
    // Check for OAuth callback with token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      alert('Authentication failed. Please try again.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (token && userParam) {
      try {
        // Store token and user data
        localStorage.setItem('token', token);
        const userData = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
      }
      return;
    }

    // Check if user is authenticated from localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }

    const savedProjectId = localStorage.getItem('selectedProjectId');
    const savedTab = localStorage.getItem('activeTab') as TabType;
    if (savedProjectId && projects.find((p) => p.id === savedProjectId)) {
      setSelectedProjectId(savedProjectId);
    }
    if (savedTab && ['home', 'dashboard', 'test-list', 'test-execution', 'editor', 'config', 'settings', 'docs', 'login'].includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, [projects]);

  // Save selected project and tab to localStorage
  useEffect(() => {
    localStorage.setItem('selectedProjectId', selectedProjectId);
    localStorage.setItem('activeTab', activeTab);
  }, [selectedProjectId, activeTab]);

  // Clear active chat when navigating away from home tab
  useEffect(() => {
    if (activeTab !== 'home') {
      setActiveChat(null);
    }
  }, [activeTab]);

  // Handlers for project selector
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleBranchChange = (branchId: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === selectedProjectId
          ? { ...project, currentBranch: branchId }
          : project
      )
    );
  };

  // Handlers for test execution table
  const handleViewExecution = (executionId: string) => {
    console.log('View execution:', executionId);
    // TODO: Implement view execution details
  };

  const handleRerunExecution = (executionId: string) => {
    console.log('Re-run execution:', executionId);
    // TODO: Implement re-run execution
  };

  const handleDeleteExecution = (executionId: string) => {
    console.log('Delete execution:', executionId);
    // TODO: Implement delete execution
  };

  // Handlers for test list
  const handleOpenTestCase = (testCaseId: string) => {
    console.log('Open test case:', testCaseId);
    setActiveTab('editor');
  };

  const handleOpenAllTestCases = () => {
    console.log('Open all test cases');
    // TODO: Implement open all test cases
  };

  // Handlers for test editor
  const handleEditStep = (stepId: string) => {
    console.log('Edit step:', stepId);
    // TODO: Implement edit step
  };

  const handleDeleteStep = (stepId: string) => {
    console.log('Delete step:', stepId);
    // TODO: Implement delete step
  };

  const handleAddStep = (uiSection: string) => {
    console.log('Add step to section:', uiSection);
    // TODO: Implement add step
  };

  // Handler for configuration
  const handleSaveConfiguration = (config: ProjectConfiguration) => {
    console.log('Save configuration:', config);
    // TODO: Implement save configuration
  };

  // Handler for viewing execution from chat
  const handleViewExecutionFromChat = (executionId: string) => {
    console.log('Viewing execution:', executionId);
    setActiveTab('live-execution');
    // TODO: Load specific execution details
  };

  // Handler for new chat
  const handleNewChat = () => {
    setActiveChat(null);
    setMessages([]);
    setActiveTab('home');
  };

  // Handler for chat
  const handleSelectChat = (id: string) => {
    setActiveChat(id);
    setActiveTab('home'); // Switch to home tab to show chat
    
    // Load messages based on chat selection
    const chatTitle = chatHistory.find(c => c.id === id)?.title;
    console.log('Loading chat:', chatTitle);
    
    // Load different demo chats based on ID
    if (id === '1') {
      // Nike Checkout Flow chat
      setMessages(sampleMessages);
    } else if (id === '2') {
      // Login Flow chat
      setMessages([
        {
          id: 'msg-login-1',
          type: 'user',
          content: 'Create a test for the login flow on our e-commerce site',
          timestamp: new Date(Date.now() - 172800000),
        },
        {
          id: 'msg-login-2',
          type: 'agent',
          content: 'I\'ll create a comprehensive login flow test for you. This will include testing valid credentials, invalid credentials, and error handling.',
          timestamp: new Date(Date.now() - 172790000),
          steps: [
            {
              id: 'login-step1',
              description: 'Navigate to login page',
              status: 'success',
            },
            {
              id: 'login-step2',
              description: 'Test valid login credentials',
              status: 'success',
            },
            {
              id: 'login-step3',
              description: 'Test invalid credentials handling',
              status: 'success',
            },
            {
              id: 'login-step4',
              description: 'Verify redirect after successful login',
              status: 'done',
            },
          ],
        },
        {
          id: 'msg-login-3',
          type: 'user',
          content: 'Can you add a test for the forgot password flow as well?',
          timestamp: new Date(Date.now() - 172780000),
        },
        {
          id: 'msg-login-4',
          type: 'agent',
          content: 'I\'ve added the forgot password flow test. It includes:\n\n1. Clicking the "Forgot Password" link\n2. Entering email address\n3. Verifying password reset email is sent\n4. Confirming success message is displayed',
          timestamp: new Date(Date.now() - 172770000),
          steps: [
            {
              id: 'forgot-step1',
              description: 'Click forgot password link',
              status: 'success',
            },
            {
              id: 'forgot-step2',
              description: 'Enter email and submit',
              status: 'done',
            },
          ],
        },
      ]);
    } else if (id === '3') {
      // Real Estate Flow chat
      setMessages([
        {
          id: 'msg-realestate-1',
          type: 'user',
          content: 'I need to test a real estate property search and filtering workflow',
          timestamp: new Date(Date.now() - 259200000),
        },
        {
          id: 'msg-realestate-2',
          type: 'agent',
          content: 'I\'ll create a real estate search test that covers property filtering, sorting, and detail viewing. This will ensure users can effectively find properties.',
          timestamp: new Date(Date.now() - 259190000),
          steps: [
            {
              id: 're-step1',
              description: 'Navigate to property search page',
              status: 'success',
            },
            {
              id: 're-step2',
              description: 'Apply location filter',
              status: 'success',
            },
            {
              id: 're-step3',
              description: 'Set price range filters',
              status: 'success',
            },
            {
              id: 're-step4',
              description: 'Apply bedroom/bathroom filters',
              status: 'success',
            },
            {
              id: 're-step5',
              description: 'Sort results by price',
              status: 'done',
            },
          ],
        },
        {
          id: 'msg-realestate-3',
          type: 'user',
          content: 'Great! Can you also test the property details page and contact form?',
          timestamp: new Date(Date.now() - 259180000),
        },
        {
          id: 'msg-realestate-4',
          type: 'agent',
          content: 'I\'ve extended the test to include:\n\n**Property Details:**\n- View property photos and gallery\n- Check property specifications\n- View location on map\n\n**Contact Form:**\n- Fill out inquiry form\n- Submit form with valid data\n- Verify confirmation message',
          timestamp: new Date(Date.now() - 259170000),
          steps: [
            {
              id: 're-detail-step1',
              description: 'Click on a property listing',
              status: 'success',
            },
            {
              id: 're-detail-step2',
              description: 'Verify property details load',
              status: 'success',
            },
            {
              id: 're-detail-step3',
              description: 'Fill and submit contact form',
              status: 'done',
            },
          ],
        },
        {
          id: 'msg-realestate-5',
          type: 'user',
          content: 'Perfect! Run this test now',
          timestamp: new Date(Date.now() - 259160000),
        },
        {
          id: 'msg-realestate-6',
          type: 'agent',
          content: 'Test execution completed successfully! ✓\n\nAll 15 test steps passed:\n- Property search and filtering: ✓\n- Property details page: ✓\n- Contact form submission: ✓\n\nExecution time: 2m 34s',
          timestamp: new Date(Date.now() - 259150000),
          executionId: 'exec-realestate-1',
        },
      ]);
    } else {
      // Start with an empty chat for other chats
      setMessages([]);
    }
  };

  // Handler for sending messages
  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Simulate agent response after 1.5 seconds
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: `I understand you want to: "${content}"\n\n${agentResponses.testCreated}`,
        timestamp: new Date(),
        steps: [
          {
            id: 'step1',
            description: 'Analyze test requirements',
            status: 'success',
          },
          {
            id: 'step2',
            description: 'Generate test script',
            status: 'success',
          },
          {
            id: 'step3',
            description: 'Validate test configuration',
            status: 'done',
          },
        ],
      };

      setMessages(prev => [...prev, agentMessage]);
      setIsProcessing(false);
    }, 1500);
  };

  // Authentication handlers
  const handleLogin = async (email: string, password: string): Promise<string | void> => {
    try {
      const response = await authApi.login({ email, password });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        setActiveTab('home');
        console.log('Login successful:', email);
        return; // Success, no error
      } else {
        return response.error || 'Login failed';
      }
    } catch (error) {
      console.error('Login error:', error);
      return 'An error occurred during login';
    }
  };

  const handleGoogleLogin = () => {
    // Simulate Google OAuth
    const mockUser = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setActiveTab('home');
    console.log('Google login successful');
  };

  const handleGithubLogin = () => {
    // Simulate GitHub OAuth
    const mockUser = {
      name: 'John Doe',
      email: 'john.doe@github.com',
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setActiveTab('home');
    console.log('GitHub login successful');
  };

  const handleRegister = async (email: string, password: string, firstName: string, lastName: string): Promise<string | void> => {
    try {
      const response = await authApi.register({ email, password, firstName, lastName });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        setShowRegister(false);
        setActiveTab('home');
        console.log('Registration successful:', email);
        return; // Success, no error
      } else {
        return response.error || 'Registration failed';
      }
    } catch (error) {
      console.error('Registration error:', error);
      return 'An error occurred during registration';
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    setActiveTab('login');
    console.log('Logout successful');
  };

  const handleForgotPassword = (email: string) => {
    console.log('Password reset requested for:', email);
    // TODO: Implement password reset logic
  };


  // Filter data by selected project and branch
  const filteredExecutions = testExecutions.filter(
    (exec) =>
      exec.projectId === selectedProjectId &&
      exec.branchId === selectedProject.currentBranch
  );

  const filteredTestCases = testCases.filter(
    (tc) =>
      tc.projectId === selectedProjectId &&
      tc.branchId === selectedProject.currentBranch
  );

  const filteredTestSteps = testSteps.filter((step) => {
    const testCase = testCases.find((tc) => tc.id === step.testCaseId);
    return (
      testCase &&
      testCase.projectId === selectedProjectId &&
      testCase.branchId === selectedProject.currentBranch
    );
  });

  // Render main content based on active tab
  const renderMainContent = () => {
    switch (activeTab) {
      case 'home':
        // Show ChatPanel if a chat is selected, otherwise show HomeView
        if (activeChat) {
          return (
            <ChatPanel 
              messages={messages}
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
              onViewExecution={handleViewExecutionFromChat}
            />
          );
        }
        return (
          <HomeView 
            projects={projects}
            selectedProject={selectedProject}
            onProjectChange={handleProjectChange}
          />
        );
      
      case 'dashboard':
        return (
          <DashboardView 
            selectedProject={selectedProject} 
            onBranchChange={handleBranchChange}
            projects={projects}
            onProjectChange={handleProjectChange}
          />
        );
      
      case 'test-execution':
        return (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Test Execution History
            </h2>
            <TestExecutionTable
              executions={filteredExecutions}
              onView={handleViewExecution}
              onRerun={handleRerunExecution}
              onDelete={handleDeleteExecution}
            />
          </div>
        );
      
      case 'test-list':
        return (
          <div>
            <TestListView
              testCases={filteredTestCases}
              onOpenTestCase={handleOpenTestCase}
              onOpenAllTestCases={handleOpenAllTestCases}
            />
          </div>
        );
      
      case 'editor':
        return (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Test Editor
            </h2>
            <TestEditorView
              testSteps={filteredTestSteps}
              onEditStep={handleEditStep}
              onDeleteStep={handleDeleteStep}
              onAddStep={handleAddStep}
            />
          </div>
        );
      
      case 'config':
        return (
          <ConfigurationView
            configuration={configuration}
            onSave={handleSaveConfiguration}
          />
        );
      
      case 'live-execution':
        return (
          <LiveExecutionView
            isExecuting={isExecuting}
            currentUrl="https://www.amazon.com"
            screenshots={screenshots}
            logs={logs}
          />
        );
      
      case 'settings':
        return (
          <SettingsView
            onSave={(data) => {
              console.log('Settings saved:', data);
              // TODO: Implement settings save
            }}
          />
        );
      
      case 'docs':
        return <DocsView />;
      
      case 'login':
        return (
          <LoginView
            onLogin={handleLogin}
            onGoogleLogin={handleGoogleLogin}
            onGithubLogin={handleGithubLogin}
            onForgotPassword={handleForgotPassword}
            onNavigateToRegister={() => setShowRegister(true)}
          />
        );
      
      case 'register':
        return (
          <RegisterView
            onRegister={handleRegister}
            onGoogleRegister={handleGoogleLogin}
            onGithubRegister={handleGithubLogin}
            onNavigateToLogin={() => setShowRegister(false)}
          />
        );
      
      default:
        return (
          <ChatPanel 
            messages={messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            onViewExecution={handleViewExecutionFromChat}
          />
        );
    }
  };

  // Show register page if requested
  if (showRegister && !isAuthenticated) {
    return (
      <RegisterView
        onRegister={handleRegister}
        onGoogleRegister={handleGoogleLogin}
        onGithubRegister={handleGithubLogin}
        onNavigateToLogin={() => setShowRegister(false)}
      />
    );
  }

  // Show login page if not authenticated (unless already on login or docs)
  if (!isAuthenticated && !['login', 'docs'].includes(activeTab)) {
    return (
      <LoginView
        onLogin={handleLogin}
        onGoogleLogin={handleGoogleLogin}
        onGithubLogin={handleGithubLogin}
        onForgotPassword={handleForgotPassword}
        onNavigateToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${activeTab === 'home' ? 'bg-[#1f1f1f]' : 'bg-neutral-50'}`}>
      {/* Left Sidebar - only show when authenticated */}
      {isAuthenticated && (
        <Sidebar
          chatHistory={chatHistory}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          projects={projects}
          selectedProject={selectedProject}
          onProjectChange={handleProjectChange}
          onLogout={handleLogout}
          user={user}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - only show when authenticated and not on login page */}
        {isAuthenticated && activeTab !== 'login' && (
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
            <div className="flex-1">
              {/* Left side - breadcrumbs or page title if needed */}
            </div>
            <div className="flex items-center gap-4">
              {/* Docs Button */}
              <button
                onClick={() => setActiveTab('docs')}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-medium">Docs</span>
              </button>

              {/* User Info */}
              {user && (
                <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className={`flex-1 overflow-y-auto ${activeTab === 'home' ? 'bg-[#1f1f1f]' : 'bg-white p-6'}`}>
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
}
