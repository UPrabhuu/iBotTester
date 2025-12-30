// Seed script for the database
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

// Create PostgreSQL pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create adapter
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: hashedPassword,
      phone: '+1 (555) 123-4567',
      company: 'Tech Corp',
      role: 'QA Engineer',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: hashedPassword,
      phone: '+1 (555) 987-6543',
      company: 'Digital Solutions',
      role: 'Test Manager',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
      phone: '+1 (555) 555-5555',
      company: 'Demo Corp',
      role: 'Developer',
    },
  });

  console.log('✅ Created users:', user1.email, user2.email, user3.email);

  // Create user settings
  await prisma.userSettings.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      integrationsJson: {
        jira: { connected: true, url: 'https://techcorp.atlassian.net' },
        slack: { connected: true, workspace: 'techcorp' },
      },
      preferencesJson: {
        theme: 'light',
        notifications: { email: true, slack: true },
      },
    },
  });

  console.log('✅ Created user settings');

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      userId: user1.id,
      name: 'E-commerce Testing',
      description: 'Comprehensive testing suite for e-commerce platform',
      baseUrl: 'https://example-shop.com',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      userId: user1.id,
      name: 'Social Media Automation',
      description: 'Automated tests for social media features',
      baseUrl: 'https://social-app.com',
    },
  });

  const project3 = await prisma.project.create({
    data: {
      userId: user2.id,
      name: 'Payment Gateway Tests',
      description: 'Testing payment flows and integrations',
      baseUrl: 'https://payment-gateway.com',
    },
  });

  const project4 = await prisma.project.create({
    data: {
      userId: user1.id,
      name: 'Mobile App Backend',
      description: 'API testing for mobile application',
      baseUrl: 'https://api.mobile-app.com',
    },
  });

  const project5 = await prisma.project.create({
    data: {
      userId: user3.id,
      name: 'Demo Project',
      description: 'Sample project for demonstration',
      baseUrl: 'https://demo.example.com',
    },
  });

  console.log('✅ Created projects:', project1.name, project2.name, project3.name, project4.name, project5.name);

  // Create test cases
  const testCase1 = await prisma.testCase.create({
    data: {
      projectId: project1.id,
      name: 'User Login Flow',
      description: 'Test user login with valid credentials',
      status: 'active',
      stepsJson: {
        steps: [
          { action: 'Navigate to login page', expectedResult: 'Login form displayed' },
          { action: 'Enter credentials', expectedResult: 'Credentials accepted' },
          { action: 'Click login button', expectedResult: 'User redirected to dashboard' },
        ],
      },
    },
  });

  const testCase2 = await prisma.testCase.create({
    data: {
      projectId: project1.id,
      name: 'Product Search',
      description: 'Search for products and verify results',
      status: 'active',
      stepsJson: {
        steps: [
          { action: 'Navigate to home page', expectedResult: 'Search bar visible' },
          { action: 'Enter search term', expectedResult: 'Suggestions appear' },
          { action: 'Submit search', expectedResult: 'Results page shows matching products' },
        ],
      },
    },
  });

  const testCase3 = await prisma.testCase.create({
    data: {
      projectId: project1.id,
      name: 'Add to Cart',
      description: 'Add product to shopping cart',
      status: 'active',
      stepsJson: {
        steps: [
          { action: 'View product details', expectedResult: 'Product page loads' },
          { action: 'Click add to cart', expectedResult: 'Cart icon updates' },
          { action: 'View cart', expectedResult: 'Product appears in cart' },
        ],
      },
    },
  });

  const testCase4 = await prisma.testCase.create({
    data: {
      projectId: project1.id,
      name: 'Checkout Process',
      description: 'Complete checkout flow',
      status: 'active',
      stepsJson: {
        steps: [
          { action: 'Proceed to checkout', expectedResult: 'Checkout page loads' },
          { action: 'Enter shipping info', expectedResult: 'Info validated' },
          { action: 'Enter payment details', expectedResult: 'Payment form accepted' },
          { action: 'Place order', expectedResult: 'Order confirmation displayed' },
        ],
      },
    },
  });

  const testCase5 = await prisma.testCase.create({
    data: {
      projectId: project2.id,
      name: 'Post Creation',
      description: 'Create and publish a social media post',
      status: 'active',
      stepsJson: {
        steps: [
          { action: 'Click new post button', expectedResult: 'Post editor opens' },
          { action: 'Enter post content', expectedResult: 'Content saved' },
          { action: 'Add media', expectedResult: 'Media uploaded' },
          { action: 'Publish post', expectedResult: 'Post appears in feed' },
        ],
      },
    },
  });

  const testCase6 = await prisma.testCase.create({
    data: {
      projectId: project2.id,
      name: 'Follow User',
      description: 'Follow another user',
      status: 'active',
    },
  });

  const testCase7 = await prisma.testCase.create({
    data: {
      projectId: project3.id,
      name: 'Payment Processing',
      description: 'Process a credit card payment',
      status: 'active',
    },
  });

  const testCase8 = await prisma.testCase.create({
    data: {
      projectId: project3.id,
      name: 'Refund Flow',
      description: 'Process a customer refund',
      status: 'draft',
    },
  });

  const testCase9 = await prisma.testCase.create({
    data: {
      projectId: project4.id,
      name: 'API Authentication',
      description: 'Test API token authentication',
      status: 'active',
    },
  });

  const testCase10 = await prisma.testCase.create({
    data: {
      projectId: project5.id,
      name: 'Demo Test Case',
      description: 'Sample test case for demo',
      status: 'active',
    },
  });

  console.log('✅ Created 10 test cases');

  // Create test steps for some test cases
  await prisma.testStep.createMany({
    data: [
      {
        testCaseId: testCase1.id,
        stepNumber: 1,
        action: 'Navigate to login page',
        expectedResult: 'Login form is displayed',
        selector: '#login-form',
        uiSection: 'Authentication',
      },
      {
        testCaseId: testCase1.id,
        stepNumber: 2,
        action: 'Enter valid email',
        expectedResult: 'Email field accepts input',
        selector: 'input[type="email"]',
        uiSection: 'Authentication',
      },
      {
        testCaseId: testCase1.id,
        stepNumber: 3,
        action: 'Enter valid password',
        expectedResult: 'Password field accepts input',
        selector: 'input[type="password"]',
        uiSection: 'Authentication',
      },
      {
        testCaseId: testCase1.id,
        stepNumber: 4,
        action: 'Click login button',
        expectedResult: 'User is redirected to dashboard',
        selector: 'button[type="submit"]',
        uiSection: 'Authentication',
      },
      {
        testCaseId: testCase2.id,
        stepNumber: 1,
        action: 'Navigate to home page',
        expectedResult: 'Home page loads successfully',
        selector: null,
        uiSection: 'Navigation',
      },
      {
        testCaseId: testCase2.id,
        stepNumber: 2,
        action: 'Enter search term in search bar',
        expectedResult: 'Search suggestions appear',
        selector: '#search-input',
        uiSection: 'Search',
      },
      {
        testCaseId: testCase2.id,
        stepNumber: 3,
        action: 'Click search button',
        expectedResult: 'Search results page displays',
        selector: '#search-button',
        uiSection: 'Search',
      },
    ],
  });

  console.log('✅ Created test steps');

  // Create test executions
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  await prisma.execution.createMany({
    data: [
      {
        testCaseId: testCase1.id,
        status: 'passed',
        startedAt: oneHourAgo,
        completedAt: new Date(oneHourAgo.getTime() + 45000),
        duration: 45000,
        resultsJson: {
          steps: [
            { step: 1, status: 'passed' },
            { step: 2, status: 'passed' },
            { step: 3, status: 'passed' },
            { step: 4, status: 'passed' },
          ],
        },
        screenshotsJson: {
          screenshots: [
            { step: 1, url: '/screenshots/exec1-step1.png' },
            { step: 4, url: '/screenshots/exec1-step4.png' },
          ],
        },
      },
      {
        testCaseId: testCase1.id,
        status: 'passed',
        startedAt: twoDaysAgo,
        completedAt: new Date(twoDaysAgo.getTime() + 42000),
        duration: 42000,
      },
      {
        testCaseId: testCase2.id,
        status: 'passed',
        startedAt: oneHourAgo,
        completedAt: new Date(oneHourAgo.getTime() + 30000),
        duration: 30000,
      },
      {
        testCaseId: testCase3.id,
        status: 'failed',
        startedAt: twoDaysAgo,
        completedAt: new Date(twoDaysAgo.getTime() + 25000),
        duration: 25000,
        errorMessage: 'Element not found: .add-to-cart-button',
        resultsJson: {
          steps: [
            { step: 1, status: 'passed' },
            { step: 2, status: 'failed', error: 'Element not found' },
          ],
        },
      },
      {
        testCaseId: testCase4.id,
        status: 'passed',
        startedAt: threeDaysAgo,
        completedAt: new Date(threeDaysAgo.getTime() + 120000),
        duration: 120000,
      },
      {
        testCaseId: testCase5.id,
        status: 'passed',
        startedAt: twoDaysAgo,
        completedAt: new Date(twoDaysAgo.getTime() + 50000),
        duration: 50000,
      },
      {
        testCaseId: testCase6.id,
        status: 'failed',
        startedAt: oneHourAgo,
        completedAt: new Date(oneHourAgo.getTime() + 15000),
        duration: 15000,
        errorMessage: 'Follow button not clickable',
      },
      {
        testCaseId: testCase7.id,
        status: 'passed',
        startedAt: threeDaysAgo,
        completedAt: new Date(threeDaysAgo.getTime() + 35000),
        duration: 35000,
      },
    ],
  });

  console.log('✅ Created execution history');

  // Create chat conversations
  const conversation1 = await prisma.chatConversation.create({
    data: {
      userId: user1.id,
      title: 'Test automation for checkout flow',
    },
  });

  const conversation2 = await prisma.chatConversation.create({
    data: {
      userId: user1.id,
      title: 'Debug failing login test',
    },
  });

  const conversation3 = await prisma.chatConversation.create({
    data: {
      userId: user2.id,
      title: 'Payment gateway integration',
    },
  });

  console.log('✅ Created chat conversations');

  // Create chat messages
  await prisma.chatMessage.createMany({
    data: [
      {
        conversationId: conversation1.id,
        role: 'user',
        content: 'Create a test for the checkout flow on our e-commerce site',
        timestamp: new Date(now.getTime() - 10 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        role: 'agent',
        content: 'I can help you create a comprehensive checkout flow test. I\'ll create test steps for: 1) Adding items to cart, 2) Entering shipping information, 3) Selecting payment method, 4) Completing the order.',
        timestamp: new Date(now.getTime() - 9 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        role: 'user',
        content: 'Great! Also verify the order confirmation email is sent',
        timestamp: new Date(now.getTime() - 8 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        role: 'user',
        content: 'The login test is failing. Can you help me debug it?',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        role: 'agent',
        content: 'I\'ll analyze the test execution. It appears the login button selector has changed. The test is looking for "#login-btn" but the current button has id "submit-login".',
        timestamp: new Date(now.getTime() - 29 * 60 * 1000),
      },
      {
        conversationId: conversation3.id,
        role: 'user',
        content: 'How do I test the Stripe payment integration?',
        timestamp: new Date(now.getTime() - 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Created chat messages');

  // Create configurations
  await prisma.configuration.createMany({
    data: [
      {
        projectId: project1.id,
        environmentJson: {
          baseUrl: 'https://example-shop.com',
          apiUrl: 'https://api.example-shop.com',
        },
        browserJson: {
          type: 'chromium',
          headless: true,
          viewport: { width: 1920, height: 1080 },
        },
        executionJson: {
          timeout: 30000,
          retries: 2,
          screenshots: true,
          video: false,
        },
      },
      {
        projectId: project2.id,
        environmentJson: {
          baseUrl: 'https://social-app.com',
        },
        browserJson: {
          type: 'chromium',
          headless: false,
        },
        executionJson: {
          timeout: 60000,
          retries: 1,
          screenshots: true,
          video: true,
        },
      },
      {
        projectId: project3.id,
        environmentJson: {
          baseUrl: 'https://payment-gateway.com',
          apiKey: 'test_key_123456',
        },
        browserJson: {
          type: 'firefox',
          headless: true,
        },
        executionJson: {
          timeout: 45000,
          retries: 3,
          screenshots: true,
          video: false,
        },
      },
    ],
  });

  console.log('✅ Created configurations');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
