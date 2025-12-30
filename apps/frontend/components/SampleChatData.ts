import { Message } from './ChatPanel';

// Sample chat data demonstrating chat conversation
export const sampleMessages: Message[] = [
  {
    id: '1',
    type: 'user',
    content: 'I want to create a test for login functionality on my website',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
  },
  {
    id: '2',
    type: 'agent',
    content: `I'll help you create a comprehensive login test. Let me break this down into steps:

1. Navigate to the login page
2. Enter valid credentials
3. Click the login button
4. Verify successful login

What's the URL of your login page?`,
    timestamp: new Date(Date.now() - 295000),
  },
  {
    id: '3',
    type: 'user',
    content: 'https://example.com/login',
    timestamp: new Date(Date.now() - 280000),
  },
  {
    id: '4',
    type: 'agent',
    content: `Perfect! I've created a test that will:

✓ Navigate to https://example.com/login
✓ Enter test credentials (username: test@example.com)
✓ Submit the login form
✓ Verify redirect to dashboard
✓ Check for welcome message

The test is ready to run. Would you like me to execute it now?`,
    timestamp: new Date(Date.now() - 275000),
    status: 'completed',
    hasExecution: true,
    executionId: 'exec-1',
    steps: [
      {
        id: 's1',
        description: 'Open browser and navigate to login page',
        status: 'done',
      },
      {
        id: 's2',
        description: 'Enter username and password',
        status: 'done',
      },
      {
        id: 's3',
        description: 'Click login button',
        status: 'done',
      },
      {
        id: 's4',
        description: 'Verify successful authentication',
        status: 'success',
      },
    ],
  },
  {
    id: '5',
    type: 'user',
    content: 'Yes, please run the test',
    timestamp: new Date(Date.now() - 260000),
  },
  {
    id: '6',
    type: 'agent',
    content: `Running your login test now...

✓ Browser launched successfully
✓ Navigated to login page
✓ Form fields located
⚡ Entering credentials...`,
    timestamp: new Date(Date.now() - 255000),
    isStreaming: false,
    status: 'wip',
    steps: [
      {
        id: 'r1',
        description: 'Launch Chrome browser',
        status: 'success',
      },
      {
        id: 'r2',
        description: 'Navigate to https://example.com/login',
        status: 'success',
      },
      {
        id: 'r3',
        description: 'Fill login credentials',
        status: 'in-progress',
      },
      {
        id: 'r4',
        description: 'Submit form and verify',
        status: 'pending',
      },
    ],
  },
];

// Example of a streaming message (WIP - Work In Progress)
export const streamingMessage: Message = {
  id: '7',
  type: 'agent',
  content: 'Let me analyze your test requirements and generate the automation script',
  timestamp: new Date(),
  isStreaming: true,
};

// Example conversation starters
export const conversationStarters = [
  {
    icon: '🔍',
    title: 'Search Functionality',
    description: 'Test search feature with multiple keywords and filters',
  },
  {
    icon: '🛒',
    title: 'E-commerce Checkout',
    description: 'Verify complete purchase flow from cart to confirmation',
  },
  {
    icon: '📝',
    title: 'Form Validation',
    description: 'Test form inputs with valid and invalid data',
  },
  {
    icon: '🔐',
    title: 'Authentication Flow',
    description: 'Test login, logout, and password reset',
  },
];

// Sample execution steps for different scenarios
export const sampleExecutionSteps = {
  ecommerce: [
    { id: 'e1', description: 'Navigate to product page', status: 'success' as const },
    { id: 'e2', description: 'Select size and color', status: 'success' as const },
    { id: 'e3', description: 'Add to cart', status: 'success' as const },
    { id: 'e4', description: 'Proceed to checkout', status: 'in-progress' as const },
    { id: 'e5', description: 'Enter shipping information', status: 'pending' as const },
    { id: 'e6', description: 'Complete payment', status: 'pending' as const },
  ],
  formValidation: [
    { id: 'f1', description: 'Locate form elements', status: 'success' as const },
    { id: 'f2', description: 'Test empty field validation', status: 'success' as const },
    { id: 'f3', description: 'Test invalid email format', status: 'in-progress' as const },
    { id: 'f4', description: 'Test password strength requirements', status: 'pending' as const },
    { id: 'f5', description: 'Verify error messages', status: 'pending' as const },
  ],
};

// Example of agent responses for different scenarios
export const agentResponses = {
  greeting: `Hi, I'm your AI Assistant! 👋

I can help you create, run, and manage functional tests for your web applications. Just describe what you want to test in plain English, and I'll handle the rest.

What would you like to test today?`,
  
  testCreated: `Great! I've created your test with the following steps:

✓ Navigate to the target page
✓ Interact with page elements
✓ Validate expected outcomes
✓ Generate detailed report

Would you like me to run this test now or make any modifications?`,
  
  testRunning: `🚀 Running your test...

I'll update you on the progress in real-time. This typically takes 30-60 seconds depending on the complexity.`,
  
  testCompleted: `✅ Test completed successfully!

All assertions passed. Your application is working as expected. Would you like to:

1. View detailed test results
2. Run another test
3. Export this test for CI/CD`,
  
  error: `❌ Test encountered an error

Don't worry, I've captured the details. Let me help you troubleshoot:

• Element selector might have changed
• Page load timeout exceeded
• Network connectivity issue

Would you like me to retry with adjusted parameters?`,
};
