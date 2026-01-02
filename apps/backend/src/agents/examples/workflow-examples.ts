/**
 * Example: Using the Agent Workflow
 * 
 * This example demonstrates the complete flow:
 * User Prompt → Agent (Intent + Plan) → Playwright Discover Tool → Test Model (JSON)
 */

import { AgentWorkflow } from '../AgentWorkflow';
import * as fs from 'fs';
import * as path from 'path';

// Example 1: Simple form submission test
async function example1_FormSubmission() {
  console.log('\n=== Example 1: Form Submission Test ===\n');

  const workflow = new AgentWorkflow({
    openaiApiKey: process.env.OPENAI_API_KEY,
    verbose: true,
  });

  const result = await workflow.execute(
    'Create a test to fill out the contact form and submit it',
    'https://example.com/contact',
    {
      generatorOptions: {
        includeScreenshots: true,
        includeValidations: true,
        priority: 'high',
      },
    }
  );

  if (result.success && result.testModel) {
    // Save test model to file
    const outputPath = path.join(__dirname, 'output', 'form-submission-test.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result.testModel, null, 2));
    console.log(`\n✅ Test model saved to: ${outputPath}`);
  } else {
    console.error(`\n❌ Error: ${result.error}`);
  }

  return result;
}

// Example 2: Navigation test
async function example2_Navigation() {
  console.log('\n=== Example 2: Navigation Test ===\n');

  const workflow = new AgentWorkflow({
    openaiApiKey: process.env.OPENAI_API_KEY,
    verbose: true,
  });

  const result = await workflow.execute(
    'Test navigation through the main menu items',
    'https://example.com',
    {
      generatorOptions: {
        includeScreenshots: true,
        priority: 'medium',
      },
    }
  );

  if (result.success && result.testModel) {
    console.log('\n📊 Test Model Summary:');
    console.log(`   - Test Cases: ${result.testModel.testCases.length}`);
    result.testModel.testCases.forEach((tc, idx) => {
      console.log(`   - Test ${idx + 1}: ${tc.testName} (${tc.steps.length} steps)`);
    });
  }

  return result;
}

// Example 3: Using individual steps
async function example3_IndividualSteps() {
  console.log('\n=== Example 3: Individual Steps ===\n');

  const workflow = new AgentWorkflow({
    openaiApiKey: process.env.OPENAI_API_KEY,
    verbose: false,
  });

  // Step 1: Parse intent
  console.log('Step 1: Parsing intent...');
  const intent = await workflow.parseIntentOnly('Create tests for the login page');
  console.log(`✅ Primary Action: ${intent.primaryAction}`);
  console.log(`✅ Confidence: ${(intent.confidence * 100).toFixed(1)}%`);

  // Step 2: Discover page
  console.log('\nStep 2: Discovering page...');
  const discoveredPage = await workflow.discoverPageOnly('https://example.com/login', {
    waitTimeout: 30000,
    captureScreenshots: true,
  });
  console.log(`✅ Found ${discoveredPage.metadata.elementCount} elements`);
  console.log(`✅ Inputs: ${discoveredPage.elements.inputs.length}`);
  console.log(`✅ Buttons: ${discoveredPage.elements.buttons.length}`);

  // Step 3: Generate test model
  console.log('\nStep 3: Generating test model...');
  const testModel = await workflow.generateTestModelOnly(
    'Create tests for the login page',
    intent,
    discoveredPage,
    {
      includeScreenshots: true,
      includeValidations: true,
      priority: 'critical',
    }
  );
  console.log(`✅ Generated ${testModel.testCases.length} test case(s)`);

  // Export to JSON
  const outputPath = path.join(__dirname, 'output', 'login-test.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(testModel, null, 2));
  console.log(`\n✅ Test model saved to: ${outputPath}`);

  return { intent, discoveredPage, testModel };
}

// Example 4: Batch processing
async function example4_BatchProcessing() {
  console.log('\n=== Example 4: Batch Processing ===\n');

  const workflow = new AgentWorkflow({
    openaiApiKey: process.env.OPENAI_API_KEY,
    verbose: false,
  });

  const prompts = [
    { prompt: 'Test the login functionality', url: 'https://example.com/login' },
    { prompt: 'Test the registration form', url: 'https://example.com/register' },
    { prompt: 'Test the checkout process', url: 'https://example.com/checkout' },
  ];

  const results = await workflow.executeBatch(prompts, {
    generatorOptions: {
      includeScreenshots: true,
      priority: 'high',
    },
  });

  console.log('\n📊 Batch Results:');
  results.forEach((result, idx) => {
    console.log(`\n${idx + 1}. ${prompts[idx].prompt}`);
    console.log(`   Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
    if (result.testModel) {
      console.log(`   Test Cases: ${result.testModel.testCases.length}`);
      console.log(`   Total Steps: ${result.testModel.testCases.reduce((sum, tc) => sum + tc.steps.length, 0)}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  return results;
}

// Example 5: URL extraction from prompt
async function example5_UrlFromPrompt() {
  console.log('\n=== Example 5: URL Extraction from Prompt ===\n');

  const workflow = new AgentWorkflow({
    openaiApiKey: process.env.OPENAI_API_KEY,
    verbose: true,
  });

  // URL is embedded in the prompt
  const result = await workflow.execute(
    'Create a test for https://example.com/products page to verify all products load correctly'
  );

  if (result.success && result.testModel) {
    console.log(`\n✅ Successfully extracted URL and generated test`);
    console.log(`   - URL: ${result.testModel.pageContext.url}`);
    console.log(`   - Test Cases: ${result.testModel.testCases.length}`);
  }

  return result;
}

// Example 6: Health check
async function example6_HealthCheck() {
  console.log('\n=== Example 6: Health Check ===\n');

  const workflow = new AgentWorkflow({
    openaiApiKey: process.env.OPENAI_API_KEY,
  });

  const health = workflow.healthCheck();
  console.log('🏥 System Health:');
  console.log(`   - Intent Parser: ${health.intentParser ? '✅' : '❌'}`);
  console.log(`   - Discovery Agent: ${health.discoveryAgent ? '✅' : '❌'}`);
  console.log(`   - Test Generator: ${health.testGenerator ? '✅' : '❌'}`);
  console.log(`   - OpenAI: ${health.openAI ? '✅' : '❌'}`);

  return health;
}

// Example 7: Get JSON output directly
async function example7_DirectJSON() {
  console.log('\n=== Example 7: Direct JSON Output ===\n');

  const workflow = new AgentWorkflow({
    openaiApiKey: process.env.OPENAI_API_KEY,
    verbose: false,
  });

  try {
    const json = await workflow.executeAndGetJSON(
      'Create a test to search for products',
      'https://example.com'
    );

    console.log('✅ Test Model JSON:');
    console.log(json.substring(0, 500) + '...');

    // Save to file
    const outputPath = path.join(__dirname, 'output', 'search-test.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, json);
    console.log(`\n✅ Saved to: ${outputPath}`);

    return json;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Main execution function
async function main() {
  console.log('🚀 Agent Workflow Examples\n');
  console.log('=' .repeat(60));

  try {
    // Run health check first
    await example6_HealthCheck();

    // Run examples based on environment
    const runAll = process.env.RUN_ALL_EXAMPLES === 'true';

    if (runAll) {
      await example1_FormSubmission();
      await example2_Navigation();
      await example3_IndividualSteps();
      await example4_BatchProcessing();
      await example5_UrlFromPrompt();
      await example7_DirectJSON();
    } else {
      console.log('\n💡 Tip: Set RUN_ALL_EXAMPLES=true to run all examples');
      console.log('Running example 3 (Individual Steps) only...\n');
      await example3_IndividualSteps();
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ All examples completed successfully!');
  } catch (error) {
    console.error('\n❌ Example failed:', error);
    process.exit(1);
  }
}

// Export examples for individual use
export {
  example1_FormSubmission,
  example2_Navigation,
  example3_IndividualSteps,
  example4_BatchProcessing,
  example5_UrlFromPrompt,
  example6_HealthCheck,
  example7_DirectJSON,
};

// Run if executed directly
if (require.main === module) {
  main();
}
