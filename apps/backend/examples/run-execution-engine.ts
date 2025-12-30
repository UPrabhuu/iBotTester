/**
 * Example Usage: Playwright Execution Engine
 * 
 * This file demonstrates how to use the iBotTester Playwright Execution Engine
 * to run automated tests from JSON test plans.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PlaywrightExecutionEngine, TestPlan, ExecutionEngineOptions } from '../src/engine';

/**
 * Example 1: Basic test execution
 */
async function runBasicTest() {
  console.log('\n=== Example 1: Basic Test Execution ===\n');

  // Load test plan from JSON file
  const testPlanPath = path.join(__dirname, 'basic-test-plan.json');
  const testPlan: TestPlan = JSON.parse(fs.readFileSync(testPlanPath, 'utf-8'));

  // Configure execution options
  const options: ExecutionEngineOptions = {
    headless: true,
    screenshots: true,
    recordVideo: false,
  };

  // Create engine instance
  const engine = new PlaywrightExecutionEngine(options);

  try {
    // Execute test plan
    const result = await engine.executeTestPlan(testPlan);

    // Display results
    console.log('\n--- Execution Results ---');
    console.log(`Status: ${result.status}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Summary: ${result.summary}`);
    console.log(`\nSteps executed: ${result.steps.length}`);
    console.log(`Screenshots captured: ${result.evidence.screenshots.length}`);

    // Save results to file
    const resultsPath = path.join(__dirname, '../test-results/basic-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(result, null, 2));
    console.log(`\nResults saved to: ${resultsPath}`);

    return result;
  } catch (error: any) {
    console.error('Test execution failed:', error.message);
    throw error;
  }
}

/**
 * Example 2: E-commerce test with progress tracking
 */
async function runEcommerceTest() {
  console.log('\n=== Example 2: E-commerce Test with Progress Tracking ===\n');

  // Load test plan
  const testPlanPath = path.join(__dirname, 'ecommerce-test-plan.json');
  const testPlan: TestPlan = JSON.parse(fs.readFileSync(testPlanPath, 'utf-8'));

  // Configure with video recording
  const options: ExecutionEngineOptions = {
    headless: true,
    screenshots: true,
    recordVideo: true,
    videoDir: './test-results/videos',
  };

  const engine = new PlaywrightExecutionEngine(options);

  // Set up progress callback
  engine.onProgress((progress) => {
    console.log(
      `Progress: Step ${progress.currentStep}/${progress.totalSteps} - ${progress.action} (${progress.status})`
    );
  });

  // Set up event callback
  engine.onEvent((event) => {
    console.log(`Event: ${event.type} at ${event.timestamp}`);
  });

  try {
    const result = await engine.executeTestPlan(testPlan);

    console.log('\n--- Execution Results ---');
    console.log(`Status: ${result.status}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Summary: ${result.summary}`);
    
    if (result.evidence.video) {
      console.log(`Video saved: ${result.evidence.video}`);
    }

    // Save results
    const resultsPath = path.join(__dirname, '../test-results/ecommerce-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(result, null, 2));
    console.log(`\nResults saved to: ${resultsPath}`);

    return result;
  } catch (error: any) {
    console.error('Test execution failed:', error.message);
    throw error;
  }
}

/**
 * Example 3: Form submission test with custom retry policy
 */
async function runFormTest() {
  console.log('\n=== Example 3: Form Submission Test ===\n');

  const testPlanPath = path.join(__dirname, 'form-test-plan.json');
  const testPlan: TestPlan = JSON.parse(fs.readFileSync(testPlanPath, 'utf-8'));

  const options: ExecutionEngineOptions = {
    headless: false, // Run in headed mode to see the browser
    screenshots: true,
    recordVideo: true,
    slowMo: 100, // Slow down operations for visibility
  };

  const engine = new PlaywrightExecutionEngine(options);

  try {
    const result = await engine.executeTestPlan(testPlan);

    console.log('\n--- Execution Results ---');
    console.log(`Status: ${result.status}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Summary: ${result.summary}`);

    // Analyze step results
    console.log('\n--- Step Details ---');
    result.steps.forEach((step) => {
      console.log(
        `Step ${step.step}: ${step.action} - ${step.status} (${step.duration}ms, ${step.retryAttempts} retries)`
      );
      if (step.error) {
        console.log(`  Error: ${step.error}`);
      }
    });

    // Save results
    const resultsPath = path.join(__dirname, '../test-results/form-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(result, null, 2));
    console.log(`\nResults saved to: ${resultsPath}`);

    return result;
  } catch (error: any) {
    console.error('Test execution failed:', error.message);
    throw error;
  }
}

/**
 * Example 4: Programmatic test plan creation
 */
async function runProgrammaticTest() {
  console.log('\n=== Example 4: Programmatic Test Plan Creation ===\n');

  // Create test plan programmatically
  const testPlan: TestPlan = {
    testId: 'programmatic-001',
    name: 'Programmatic GitHub Test',
    description: 'Test created programmatically without JSON file',
    steps: [
      {
        step: 1,
        action: 'navigate',
        url: 'https://github.com',
        description: 'Navigate to GitHub',
        retryPolicy: { maxRetries: 2, timeout: 30000 },
      },
      {
        step: 2,
        action: 'validate',
        rule: 'page loaded successfully',
        description: 'Verify GitHub loaded',
      },
      {
        step: 3,
        action: 'screenshot',
        description: 'Capture GitHub homepage',
      },
    ],
    createdAt: new Date().toISOString(),
  };

  const options: ExecutionEngineOptions = {
    headless: true,
    screenshots: true,
  };

  const engine = new PlaywrightExecutionEngine(options);

  try {
    const result = await engine.executeTestPlan(testPlan);

    console.log('\n--- Execution Results ---');
    console.log(`Status: ${result.status}`);
    console.log(`Summary: ${result.summary}`);

    return result;
  } catch (error: any) {
    console.error('Test execution failed:', error.message);
    throw error;
  }
}

/**
 * Main function - runs all examples
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   iBotTester Playwright Execution Engine - Examples      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  try {
    // Ensure test-results directory exists
    const resultsDir = path.join(__dirname, '../test-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    // Run example 1: Basic test
    await runBasicTest();

    // Uncomment to run other examples:
    // await runEcommerceTest();
    // await runFormTest();
    // await runProgrammaticTest();

    console.log('\n✅ All examples completed successfully!\n');
  } catch (error: any) {
    console.error('\n❌ Example execution failed:', error.message);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main();
}

// Export functions for use in other files
export {
  runBasicTest,
  runEcommerceTest,
  runFormTest,
  runProgrammaticTest,
};
