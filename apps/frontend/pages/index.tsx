import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiveExecutionPanel from '@/components/LiveExecutionPanel';
import HomeView from '@/components/HomeView';
import DashboardView from '@/components/DashboardView';
import TestExecutionTable from '@/components/TestExecutionTable';
import TestListView from '@/components/TestListView';
import TestEditorView from '@/components/TestEditorView';
import ConfigurationView from '@/components/ConfigurationView';
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
  // Execution state (for future integration with live execution)
  const [isExecuting] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [logs] = useState<string[]>([]);
  const [screenshots] = useState<Screenshot[]>([]);

  // Active tab state
  const [activeTab, setActiveTab] = useState<TabType>('home');
  
  // Mock projects data
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'project-1',
      name: 'Project 1',
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
      name: 'Project 2',
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
      suiteName: 'Nike Checkout Flow',
      labels: ['checkout', 'e2e'],
      localExecution: {
        status: 'passed',
        timestamp: new Date(Date.now() - 3600000),
        duration: 45000,
        results: 'All tests passed',
      },
      gridExecution: {
        status: 'passed',
        timestamp: new Date(Date.now() - 3600000),
        duration: 48000,
        results: 'All tests passed',
        gridDetails: 'Chrome 120',
      },
      status: 'passed',
      duration: 45000,
      triggeredBy: 'john@example.com',
      projectId: 'project-1',
      branchId: 'branch-1',
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: 'exec-2',
      suiteName: 'Login Flow Test',
      labels: ['authentication', 'smoke'],
      localExecution: {
        status: 'running',
        timestamp: new Date(Date.now() - 300000),
        duration: 15000,
      },
      status: 'running',
      duration: 15000,
      triggeredBy: 'jane@example.com',
      projectId: 'project-1',
      branchId: 'branch-1',
      createdAt: new Date(Date.now() - 300000),
    },
    {
      id: 'exec-3',
      suiteName: 'Product Search',
      labels: ['search', 'regression'],
      localExecution: {
        status: 'failed',
        timestamp: new Date(Date.now() - 7200000),
        duration: 32000,
        results: '2 of 5 tests failed',
      },
      status: 'failed',
      duration: 32000,
      triggeredBy: 'admin@example.com',
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
      steps: [],
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
      steps: [],
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
    const savedProjectId = localStorage.getItem('selectedProjectId');
    const savedTab = localStorage.getItem('activeTab') as TabType;
    if (savedProjectId && projects.find((p) => p.id === savedProjectId)) {
      setSelectedProjectId(savedProjectId);
    }
    if (savedTab && ['home', 'dashboard', 'test-list', 'test-execution', 'editor', 'config'].includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, [projects]);

  // Save selected project and tab to localStorage
  useEffect(() => {
    localStorage.setItem('selectedProjectId', selectedProjectId);
    localStorage.setItem('activeTab', activeTab);
  }, [selectedProjectId, activeTab]);

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

  // Handler for chat
  const handleSelectChat = (id: string) => {
    setActiveChat(id);
    // In a real app, this would load the chat history
    console.log('Loading chat:', chatHistory.find(c => c.id === id)?.title);
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
        return <HomeView />;
      
      case 'dashboard':
        return <DashboardView />;
      
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
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Test Cases
            </h2>
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
      
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Left Sidebar */}
      <Sidebar
        chatHistory={chatHistory}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        projects={projects}
        selectedProject={selectedProject}
        onProjectChange={handleProjectChange}
        onBranchChange={handleBranchChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {renderMainContent()}
        </div>
      </div>

      {/* Right Execution Panel */}
      <LiveExecutionPanel
        isExecuting={isExecuting}
        currentUrl="https://www.amazon.com"
        screenshots={screenshots}
        logs={logs}
      />
    </div>
  );
}
