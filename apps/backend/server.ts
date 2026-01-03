import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { chromium } from 'playwright';
import OpenAI from 'openai';
import passport from './src/config/passport';
import { createServer } from 'http';
import { setupWebSocketRoutes } from './src/routes/websocket';

// Import routes
import authRoutes from './src/routes/auth';
import projectRoutes from './src/routes/projects';
import testRoutes, { testStepRouter } from './src/routes/tests';
import executionRoutes from './src/routes/executions';
import batchExecutionRoutes from './src/routes/batch-executions';
import chatRoutes from './src/routes/chat';
import dashboardRoutes from './src/routes/dashboard';
import configRoutes from './src/routes/config';
import settingsRoutes from './src/routes/settings';
import intentRoutes from './src/routes/intent';
import workflowRoutes from './src/routes/workflow.routes';
import playwrightRoutes from './src/routes/playwright.routes';

// Import agent services
import { AIAgentService } from './src/services/aiAgentService';
import { ExecutionAgentService } from './src/services/executionAgentService';
import { OrchestratorAgent } from './src/agents/OrchestratorAgent';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI (optional - will only work if API key is provided)
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Initialize AI Agent Service
const aiAgentService = new AIAgentService(process.env.OPENAI_API_KEY);

// Initialize Orchestrator Agent
const orchestratorAgent = new OrchestratorAgent(process.env.OPENAI_API_KEY);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Session configuration for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'ibottester-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'iBotTester API Server',
    version: '2.0.0',
    status: 'running',
    features: {
      playwright: true,
      openai: !!openai,
      aiAgent: aiAgentService.isAIAvailable(),
      capabilities: {
        testPlanGeneration: true,
        autonomousExecution: true,
        selfHealing: true,
        evidenceCapture: true,
        flowDetection: true
      }
    },
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      tests: '/api/test-cases',
      executions: '/api/executions',
      chat: '/api/chat',
      dashboard: '/api/dashboard',
      config: '/api/config',
      settings: '/api/settings',
      intent: '/api/intent',
      testPlan: '/api/test-plan',
      executeTest: '/api/execute-test',
      executeTestPlan: '/api/execute-test-plan',
      runTest: '/api/run-test',
      orchestratedTest: '/api/orchestrated-test'
    }
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: 'running',
      playwright: 'available',
      openai: openai ? 'configured' : 'not configured',
      aiAgent: aiAgentService.isAIAvailable() ? 'active' : 'fallback mode'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/test-cases', testRoutes);
app.use('/api/test-steps', testStepRouter);
app.use('/api/executions', executionRoutes);
app.use('/api/batch-executions', batchExecutionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config', configRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/intent', intentRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/playwright', playwrightRoutes);

app.post('/api/test-plan', async (req: Request, res: Response) => {
  const { prompt, environment = 'staging', runType = 'single', options = {} } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ 
      success: false, 
      error: 'Prompt is required' 
    });
  }

  try {
    // Use the AI Agent Service to generate structured test plan
    const testPlan = await aiAgentService.generateTestPlan({
      prompt,
      environment,
      runType,
      options,
    });

    res.json({
      success: true,
      testPlan,
      aiEnabled: aiAgentService.isAIAvailable(),
    });
  } catch (error) {
    console.error('Error creating test plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create test plan'
    });
  }
});

app.post('/api/execute-test', async (req: Request, res: Response) => {
  const { testPlanId, url } = req.body;
  
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      error: 'URL is required' 
    });
  }

  let browser;
  try {
    // Launch browser
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to URL with a more reliable wait condition
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Take screenshot
    const screenshot = await page.screenshot();
    const screenshotBase64 = screenshot.toString('base64');
    
    // Get page title
    const title = await page.title();

    await browser.close();

    res.json({
      success: true,
      execution: {
        id: `exec-${Date.now()}`,
        testPlanId,
        url,
        title,
        screenshot: `data:image/png;base64,${screenshotBase64}`,
        status: 'completed',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Error executing test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute test'
    });
  }
});

// New endpoint: Execute a complete test plan with AI agent
app.post('/api/execute-test-plan', async (req: Request, res: Response) => {
  const { testPlan, options = {} } = req.body;
  
  if (!testPlan || !testPlan.steps) {
    return res.status(400).json({ 
      success: false, 
      error: 'Test plan with steps is required' 
    });
  }

  try {
    const executionAgent = new ExecutionAgentService();
    
    const result = await executionAgent.executeTestPlan(testPlan, {
      headless: options.headless !== false,
      recordVideo: options.recordVideo || false,
      screenshots: options.screenshots !== false,
    });

    // Generate AI summary if available
    if (aiAgentService.isAIAvailable()) {
      const aiSummary = await aiAgentService.generateTestSummary(testPlan, result.steps);
      result.summary = aiSummary;
    }

    res.json({
      success: true,
      execution: result,
    });
  } catch (error: any) {
    console.error('Error executing test plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute test plan',
      details: error.message,
    });
  }
});

// New endpoint: Generate and execute test in one call
app.post('/api/run-test', async (req: Request, res: Response) => {
  const { prompt, environment = 'staging', runType = 'single', options = {} } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ 
      success: false, 
      error: 'Prompt is required' 
    });
  }

  try {
    // Step 1: Generate test plan
    const testPlan = await aiAgentService.generateTestPlan({
      prompt,
      environment,
      runType,
      options,
    });

    // Step 2: Execute test plan
    const executionAgent = new ExecutionAgentService();
    const result = await executionAgent.executeTestPlan(testPlan, {
      headless: options.headless !== false,
      recordVideo: options.recordVideo || false,
      screenshots: options.screenshots !== false,
    });

    // Step 3: Generate AI summary
    if (aiAgentService.isAIAvailable()) {
      const aiSummary = await aiAgentService.generateTestSummary(testPlan, result.steps);
      result.summary = aiSummary;
    }

    res.json({
      success: true,
      testPlan,
      execution: result,
      aiEnabled: aiAgentService.isAIAvailable(),
    });
  } catch (error: any) {
    console.error('Error running test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run test',
      details: error.message,
    });
  }
});

// New endpoint: Full orchestrated test flow with all agents
app.post('/api/orchestrated-test', async (req: Request, res: Response) => {
  const { prompt, environment = 'staging', runType = 'single', options = {} } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ 
      success: false, 
      error: 'Prompt is required' 
    });
  }

  try {
    console.log(`\n🚀 Starting orchestrated test flow for: "${prompt}"\n`);
    
    // Execute complete agent flow
    const result = await orchestratorAgent.executeTestFlow({
      prompt,
      environment,
      runType,
      options,
    });

    const agentStatus = orchestratorAgent.getAgentStatus();

    res.json({
      success: result.status !== 'FAIL',
      execution: result,
      agentStatus,
      message: result.status === 'PASS' 
        ? '✅ Test completed successfully' 
        : result.status === 'PARTIAL'
        ? '⚠️ Test completed with partial success'
        : '❌ Test failed',
    });
  } catch (error: any) {
    console.error('Error in orchestrated test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute orchestrated test',
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Create HTTP server with WebSocket support
const server = createServer(app);

// Setup WebSocket routes
setupWebSocketRoutes(server);

server.listen(PORT, () => {
  console.log(`✅ iBotTester API Server running on port ${PORT}`);
  console.log(`📊 Playwright: Available`);
  console.log(`🤖 OpenAI: ${openai ? 'Configured' : 'Not configured (set OPENAI_API_KEY)'}`);
  console.log(`🧠 AI Agent: ${aiAgentService.isAIAvailable() ? 'Active' : 'Fallback mode'}`);
  console.log(`🔌 WebSocket: Ready at ws://localhost:${PORT}/ws/executions/:executionId`);
  console.log(`\n🚀 Agent Endpoints:`);
  console.log(`   POST /api/test-plan - Generate test plan from prompt`);
  console.log(`   POST /api/execute-test-plan - Execute existing test plan`);
  console.log(`   POST /api/run-test - Generate and execute in one call`);
  console.log(`   POST /api/orchestrated-test - Full agent flow (Intent → Plan → Execute → Evidence → Diff → Report)`);
  console.log(`\n🤖 Agent Flow:`);
  console.log(`   User Prompt → Intent Parser → Test Planner → Execution → Evidence → Diff/Validation → Report`);
});
