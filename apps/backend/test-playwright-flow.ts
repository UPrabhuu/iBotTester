/**
 * Test the Playwright Execution Flow
 * 
 * This script demonstrates the complete flow:
 * Playwright Runner → Evidence Collector → Diff & Validation → Report
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Sample test steps for a simple login flow
const testSteps = [
  {
    stepNumber: 1,
    action: 'navigate',
    value: 'https://example.com',
    description: 'Navigate to example.com'
  },
  {
    stepNumber: 2,
    action: 'screenshot',
    description: 'Capture initial page'
  },
  {
    stepNumber: 3,
    action: 'wait',
    value: '2000',
    description: 'Wait for page to load'
  }
];

// Test configuration
const testConfig = {
  browserType: 'chromium',
  headless: false,
  viewport: { width: 1920, height: 1080 },
  timeout: 30000,
  screenshotsEnabled: true,
  videoEnabled: false,
  traceEnabled: true,
  validation: {
    enableAIAnalysis: false, // Set to true if ANTHROPIC_API_KEY is configured
    enableVisualDiff: false,
    validationRules: [
      {
        type: 'element',
        selector: 'body',
        expected: true,
        message: 'Body element should be visible'
      }
    ]
  }
};

async function runTest() {
  try {
    console.log('🚀 Starting Playwright Execution Flow Test...\n');

    // Step 1: Create and start execution
    console.log('📝 Creating test execution...');
    const createResponse = await axios.post(`${API_BASE_URL}/api/playwright/execute-test`, {
      executionName: 'Example.com Test - ' + new Date().toISOString(),
      projectId: null,
      userId: 'test-user',
      testSteps,
      startUrl: 'https://example.com',
      config: testConfig
    });

    const executionId = createResponse.data.executionId;
    console.log(`✅ Execution created: ${executionId}\n`);

    // Step 2: Poll for completion
    console.log('⏳ Waiting for execution to complete...');
    let execution;
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const statusResponse = await axios.get(
        `${API_BASE_URL}/api/playwright/executions/${executionId}`
      );
      
      execution = statusResponse.data.execution;
      console.log(`   Status: ${execution.status}`);

      if (execution.status === 'completed' || execution.status === 'failed') {
        break;
      }

      attempts++;
    }

    if (!execution) {
      throw new Error('Failed to get execution status');
    }

    console.log(`\n✅ Execution ${execution.status}!`);
    console.log(`   Duration: ${(execution.duration / 1000).toFixed(2)}s\n`);

    // Step 3: Get Evidence
    console.log('📸 Fetching evidence...');
    const evidenceResponse = await axios.get(
      `${API_BASE_URL}/api/playwright/executions/${executionId}/evidence`
    );
    
    const evidence = evidenceResponse.data.evidence;
    console.log(`   Screenshots: ${evidence.filter((e: any) => e.evidenceType === 'screenshot').length}`);
    console.log(`   Traces: ${evidence.filter((e: any) => e.evidenceType === 'trace').length}`);
    console.log(`   Total evidence items: ${evidence.length}\n`);

    // Step 4: Get Validation Results
    console.log('🔍 Fetching validation results...');
    try {
      const validationResponse = await axios.get(
        `${API_BASE_URL}/api/playwright/executions/${executionId}/validation`
      );
      
      const validation = validationResponse.data.validation;
      console.log(`   Overall Status: ${validation.overallStatus}`);
      console.log(`   Issues Found: ${validation.issuesFound}`);
      
      if (validation.issuesJson && validation.issuesJson.length > 0) {
        console.log('\n   Issues:');
        validation.issuesJson.forEach((issue: any, idx: number) => {
          console.log(`     ${idx + 1}. [${issue.severity}] ${issue.message}`);
        });
      }
      console.log('');
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('   ⚠️  Validation not yet available\n');
      } else {
        throw error;
      }
    }

    // Step 5: Get Report
    console.log('📊 Fetching execution report...');
    try {
      const reportResponse = await axios.get(
        `${API_BASE_URL}/api/playwright/executions/${executionId}/report`
      );
      
      const report = reportResponse.data.report;
      console.log(`\n📋 Report Summary:`);
      console.log(`   ${report.summary}`);
      console.log(`\n   Steps: ${report.passedSteps}/${report.totalSteps} passed`);
      console.log(`   Failed: ${report.failedSteps}`);
      console.log(`   Skipped: ${report.skippedSteps}`);
      
      if (report.recommendationsJson && report.recommendationsJson.length > 0) {
        console.log(`\n   💡 Recommendations:`);
        report.recommendationsJson.forEach((rec: any, idx: number) => {
          console.log(`     ${idx + 1}. [${rec.priority}] ${rec.message}`);
        });
      }
      console.log('');
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('   ⚠️  Report not yet available\n');
      } else {
        throw error;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST EXECUTION FLOW COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`\nExecution ID: ${executionId}`);
    console.log(`Status: ${execution.status}`);
    console.log(`Duration: ${(execution.duration / 1000).toFixed(2)}s`);
    console.log(`Evidence Collected: ${evidence.length} items`);
    console.log('\nYou can view this execution in the UI at:');
    console.log(`http://localhost:3000 (look for execution: ${executionId.substring(0, 8)}...)`);

  } catch (error: any) {
    console.error('\n❌ Error during test execution:');
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
runTest();
