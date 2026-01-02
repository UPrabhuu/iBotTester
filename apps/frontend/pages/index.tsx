import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import HomeView from '@/components/HomeView';
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
import { authApi, chatApi, projectsApi, testCasesApi, executionsApi } from '@/services/api';
import { useAlert } from '@/contexts/AlertContext';
import {
  Project,
  TestExecution,
  TestCase,
  TestStep,
  ProjectConfiguration,
  TabType,
} from '@/types/project';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

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
  const { showError } = useAlert();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  
  // Debug authentication state changes
  useEffect(() => {
    console.log('🔐 Authentication state changed:', { isAuthenticated, user });
  }, [isAuthenticated, user]);
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
  
  // Data state - will be loaded from API
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  // Get selected project
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Test executions - will be loaded from API
  const [testExecutions, setTestExecutions] = useState<TestExecution[]>([]);
  const [isLoadingExecutions, setIsLoadingExecutions] = useState(true);

  // Test cases - will be loaded from API
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoadingTestCases, setIsLoadingTestCases] = useState(true);

  // Test steps - will be loaded from API when test case is selected
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const [isLoadingTestSteps, setIsLoadingTestSteps] = useState(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [testCaseData, setTestCaseData] = useState<Record<string, string>>({});

  // Configuration - will be loaded from API
  const [configuration, setConfiguration] = useState<ProjectConfiguration>({
    id: 'config-1',
    projectId: selectedProjectId || '',
    environment: {
      baseUrl: '',
      credentials: {},
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
      video: false,
    },
    integrations: {},
    variables: {},
  });
  const [isLoadingConfiguration, setIsLoadingConfiguration] = useState(true);

  // Chat history - will be loaded from API
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  // Fetch projects on mount and when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoadingProjects(false);
      return;
    }

    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        // Run migration to add default steps to existing test cases
        const migrationResult = await testCasesApi.migrateDefaultSteps();
        if (migrationResult.success) {
          console.log('✅ Migration completed:', migrationResult.data);
        }

        const response = await projectsApi.getAll();
        if (response.success && response.data) {
          // Transform API data to match frontend format
          const transformedProjects = response.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            branches: [
              { id: 'main', name: 'main', isDefault: true },
            ],
            currentBranch: 'main',
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
          setProjects(transformedProjects);
          
          // Set first project as selected if none selected
          if (transformedProjects.length > 0) {
            const savedProjectId = localStorage.getItem('selectedProjectId');
            const validProject = transformedProjects.find(p => p.id === savedProjectId);
            
            if (validProject) {
              console.log('✅ Using saved project:', validProject.name);
              setSelectedProjectId(validProject.id);
            } else {
              console.log('✅ Auto-selecting first project:', transformedProjects[0].name);
              setSelectedProjectId(transformedProjects[0].id);
              localStorage.setItem('selectedProjectId', transformedProjects[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated]);

  // Function to fetch test cases (can be called anytime to refresh)
  const fetchTestCases = async () => {
    if (!isAuthenticated || !selectedProjectId) {
      setIsLoadingTestCases(false);
      return;
    }

    console.log('📋 Fetching test cases for project:', selectedProjectId);
    setIsLoadingTestCases(true);
    try {
      const response = await testCasesApi.getAll(selectedProjectId);
      if (response.success && response.data) {
        // Transform API data to match frontend format
        const transformedTestCases = response.data.map((tc: any) => ({
          id: tc.id,
          name: tc.name,
          description: tc.description || '',
          status: tc.status,
          createdAt: new Date(tc.createdAt),
          lastModified: new Date(tc.updatedAt),
          projectId: tc.projectId,
          branchId: 'main',
          steps: [],
        }));
        console.log(`✅ Loaded ${transformedTestCases.length} test cases`);
        setTestCases(transformedTestCases);
      }
    } catch (error) {
      console.error('Error fetching test cases:', error);
    } finally {
      setIsLoadingTestCases(false);
    }
  };

  // Fetch test cases when project changes
  useEffect(() => {
    fetchTestCases();
  }, [isAuthenticated, selectedProjectId]);

  // Fetch test executions when project changes
  useEffect(() => {
    if (!isAuthenticated || !selectedProjectId) {
      setIsLoadingExecutions(false);
      return;
    }

    const fetchExecutions = async () => {
      setIsLoadingExecutions(true);
      try {
        const response = await executionsApi.getAll();
        if (response.success && response.data) {
          // Transform API data to match frontend format
          const transformedExecutions = response.data
            .filter((e: any) => e.testCase?.projectId === selectedProjectId)
            .map((e: any) => ({
              id: e.id,
              executionName: e.testCase?.name || 'Test Execution',
              labels: [],
              status: e.status,
              timestamp: new Date(e.startedAt || e.createdAt),
              duration: e.duration || 0,
              results: e.resultsJson?.summary || '',
              triggeredBy: 'user',
              executionType: 'manual',
              projectId: selectedProjectId,
              branchId: 'main',
              createdAt: new Date(e.startedAt || e.createdAt),
            }));
          setTestExecutions(transformedExecutions);
        }
      } catch (error) {
        console.error('Error fetching executions:', error);
      } finally {
        setIsLoadingExecutions(false);
      }
    };

    fetchExecutions();
  }, [isAuthenticated, selectedProjectId]);

  // Fetch chat history when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchChatHistory = async () => {
      try {
        const response = await chatApi.getHistory();
        if (response.success && response.data) {
          const transformedHistory = response.data.map((ch: any) => ({
            id: ch.id,
            title: ch.title,
            timestamp: new Date(ch.createdAt),
          }));
          setChatHistory(transformedHistory);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, [isAuthenticated]);

  // Load saved project and tab from localStorage
  useEffect(() => {
    // Check for OAuth callback with token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      showError('Authentication failed. Please try again.');
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
    console.log('🔐 Checking authentication:', { hasToken: !!savedToken, hasUser: !!savedUser });
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('✅ User authenticated from localStorage:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('❌ Error parsing saved user:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('⚠️ No authentication found - please login');
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
    setActiveTab('live-execution');
  };

  const handleRerunExecution = async (executionId: string) => {
    try {
      const execution = testExecutions.find(e => e.id === executionId);
      if (execution) {
        const response = await executionsApi.execute(execution.id);
        if (response.success) {
          // Refresh executions list
          const updatedExecutions = await executionsApi.getAll();
          if (updatedExecutions.success && updatedExecutions.data) {
            const transformedExecutions = updatedExecutions.data
              .filter((e: any) => e.testCase?.projectId === selectedProjectId)
              .map((e: any) => ({
                id: e.id,
                executionName: e.testCase?.name || 'Test Execution',
                labels: [],
                status: e.status,
                timestamp: new Date(e.startedAt || e.createdAt),
                duration: e.duration || 0,
                results: e.resultsJson?.summary || '',
                triggeredBy: 'user',
                executionType: 'manual',
                projectId: selectedProjectId,
                branchId: 'main',
                createdAt: new Date(e.startedAt || e.createdAt),
              }));
            setTestExecutions(transformedExecutions);
          }
        }
      }
    } catch (error) {
      console.error('Error rerunning execution:', error);
    }
  };

  const handleDeleteExecution = async (executionId: string) => {
    try {
      // TODO: Implement delete execution API
      setTestExecutions(prev => prev.filter(e => e.id !== executionId));
      console.log('Deleted execution:', executionId);
    } catch (error) {
      console.error('Error deleting execution:', error);
    }
  };

  // Handlers for test list
  const handleOpenTestCase = async (testCaseId: string) => {
    setActiveTab('editor');
    setSelectedTestCaseId(testCaseId);
    
    // Load test case details with steps
    setIsLoadingTestSteps(true);
    try {
      const response = await testCasesApi.getById(testCaseId);
      if (response.success && response.data) {
        const testCase = response.data;
        console.log('📄 Loaded test case:', testCase.name, 'with', testCase.testSteps?.length || 0, 'steps');
        
        // Set selected test case
        const transformed: TestCase = {
          id: testCase.id,
          name: testCase.name,
          description: testCase.description || '',
          status: testCase.status,
          createdAt: new Date(testCase.createdAt),
          lastModified: new Date(testCase.updatedAt),
          projectId: testCase.projectId,
          branchId: 'main',
          steps: [],
        };
        setSelectedTestCase(transformed);
        
        // Transform test steps
        if (testCase.testSteps && Array.isArray(testCase.testSteps)) {
          const transformedSteps = testCase.testSteps.map((step: any) => ({
            id: step.id,
            stepNumber: step.stepNumber,
            description: step.action, // Use action as description
            action: step.action || '',
            selector: step.selector || '',
            value: step.value || '',
            uiSection: step.uiSection || 'Default',
            dataMapping: step.dataMapping || {},
            expectedResult: step.expectedResult || '',
            testCaseId: step.testCaseId || testCaseId,
          }));
          setTestSteps(transformedSteps);
          console.log('✅ Loaded', transformedSteps.length, 'test steps');
        } else {
          setTestSteps([]);
          console.log('ℹ️ No test steps found');
        }
        
        // Load test data if available
        if (testCase.stepsJson) {
          try {
            const parsedData = typeof testCase.stepsJson === 'string' 
              ? JSON.parse(testCase.stepsJson) 
              : testCase.stepsJson;
            setTestCaseData(parsedData);
          } catch (e) {
            console.log('Could not parse test data');
            setTestCaseData({});
          }
        }
      } else {
        console.error('Failed to load test case:', response.error);
        showError('Failed to load test case');
      }
    } catch (error) {
      console.error('Error loading test steps:', error);
      showError('Error loading test case details');
    } finally {
      setIsLoadingTestSteps(false);
    }
  };

  const handleOpenAllTestCases = () => {
    console.log('Open all test cases');
    setActiveTab('test-list');
  };

  const handleCreateNewTest = () => {
    setActiveTab('editor');
    setTestSteps([]);
  };

  // Handlers for test editor
  const handleEditStep = (stepId: string) => {
    console.log('Edit step:', stepId);
    // TODO: Implement edit step
  };

  const handleDeleteStep = (stepId: string) => {
    setTestSteps(prev => prev.filter(s => s.id !== stepId));
  };

  const handleAddStep = (uiSection: string) => {
    console.log('Add step to section:', uiSection);
    // TODO: Implement add step with API
  };

  // Handler for configuration
  const handleSaveConfiguration = async (config: ProjectConfiguration) => {
    try {
      // TODO: Implement save configuration API
      setConfiguration(config);
      console.log('Configuration saved:', config);
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  // Handler for viewing execution from chat
  const handleViewExecutionFromChat = (executionId: string) => {
    console.log('Viewing execution:', executionId);
    setActiveTab('live-execution');
    // TODO: Load specific execution details
  };

  // Handler for new chat
  const handleNewChat = () => {
    console.log('handleNewChat called');
    setActiveChat(null);
    setMessages([]);
    setActiveTab('home');
    
    // Reset HomeView chat state
    if (typeof window !== 'undefined' && (window as any).resetChat) {
      console.log('Calling window.resetChat');
      (window as any).resetChat();
    } else {
      console.warn('window.resetChat not found');
    }
  };

  // Handler for chat
  const handleSelectChat = async (id: string) => {
    console.log('handleSelectChat called with id:', id);
    setActiveChat(id);
    setActiveTab('home'); // Switch to home tab to show chat
    
    // Trigger conversation load in HomeView via window method
    try {
      console.log('window.loadConversation exists?', !!(window as any).loadConversation);
      if (typeof window !== 'undefined' && (window as any).loadConversation) {
        console.log('Calling window.loadConversation');
        await (window as any).loadConversation(id);
        console.log('window.loadConversation completed');
      } else {
        console.error('window.loadConversation not found!');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
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

  const filteredTestCases = testCases.filter((tc) => {
    const matchesProject = tc.projectId === selectedProjectId;
    const matchesBranch = tc.branchId === selectedProject?.currentBranch;
    return matchesProject && matchesBranch;
  });

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
        return (
          <HomeView 
            projects={projects}
            selectedProject={selectedProject}
            onProjectChange={handleProjectChange}
            onTestCaseCreated={fetchTestCases}
          />
        );
      
      case 'dashboard':
        if (isLoadingProjects || isLoadingExecutions) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard...</p>
              </div>
            </div>
          );
        }
        
        // Calculate metrics from loaded data
        const dashboardMetrics = {
          totalTests: testCases.length,
          passRate: testExecutions.length > 0 
            ? (testExecutions.filter(e => e.status === 'passed').length / testExecutions.length) * 100 
            : 0,
          avgDuration: testExecutions.length > 0
            ? testExecutions.reduce((sum, e) => sum + (e.duration || 0), 0) / testExecutions.length
            : 0,
          activeSuites: projects.length,
          executionTrends: [],
          recentActivity: testExecutions.slice(0, 10).map(e => ({
            id: e.id,
            testName: e.executionName,
            status: e.status,
            timestamp: e.timestamp,
            duration: e.duration,
          })),
          slowestTests: testExecutions
            .filter(e => e.duration > 0)
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 5)
            .map(e => ({
              id: e.id,
              name: e.executionName,
              duration: e.duration,
            })),
          testDistribution: {
            passed: testExecutions.filter(e => e.status === 'passed').length,
            failed: testExecutions.filter(e => e.status === 'failed').length,
            skipped: 0,
            running: testExecutions.filter(e => e.status === 'running').length,
          },
        };
        
        return (
          <DashboardView 
            metrics={dashboardMetrics as any}
            selectedProject={selectedProject} 
            onBranchChange={handleBranchChange}
            projects={projects}
            onProjectChange={handleProjectChange}
          />
        );
      
      case 'test-execution':
        if (isLoadingExecutions) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading executions...</p>
              </div>
            </div>
          );
        }
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
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
        if (isLoadingTestCases) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading test cases...</p>
              </div>
            </div>
          );
        }
        return (
          <div>
            <TestListView
              testCases={filteredTestCases}
              onOpenTestCase={handleOpenTestCase}
              onOpenAllTestCases={handleOpenAllTestCases}
              onCreateNewTest={handleCreateNewTest}
              onTestDeleted={fetchTestCases}
            />
          </div>
        );
      
      case 'editor':
        return (
          <div>
            {isLoadingTestSteps ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading test case...</p>
                </div>
              </div>
            ) : (
              <TestEditorView
                testSteps={filteredTestSteps}
                onEditStep={handleEditStep}
                onDeleteStep={handleDeleteStep}
                onAddStep={handleAddStep}
                testCaseName={selectedTestCase?.name || 'Test Case'}
                testCaseData={testCaseData}
                onTestDataChange={(data) => setTestCaseData(data)}
              />
            )}
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
        return null;
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
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
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
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
            <div className="flex-1">
              {/* Left side - breadcrumbs or page title if needed */}
            </div>
            <div className="flex items-center gap-4">
              {/* Docs Button */}
              <button
                onClick={() => setActiveTab('docs')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-medium">Docs</span>
              </button>

              {/* User Info */}
              {user && (
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 dark:border dark:border-gray-600 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">{user.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{user.email}</div>
                  </div>
                </div>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
        <div className={`flex-1 overflow-y-auto ${activeTab === 'home' ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 p-6'}`}>
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
}
