/**
 * Quick verification script for the Playwright Execution Engine
 * This ensures all types are correct and the engine compiles
 */

import { PlaywrightExecutionEngine, TestPlan, ExecutionEngineOptions } from './src/engine';

// Verify types compile correctly
const testPlan: TestPlan = {
  testId: 'verify-001',
  name: 'Verification Test',
  steps: [
    {
      step: 1,
      action: 'navigate',
      url: 'https://example.com',
    },
  ],
  createdAt: new Date().toISOString(),
};

const options: ExecutionEngineOptions = {
  headless: true,
  screenshots: false,
  recordVideo: false,
};

async function verify() {
  console.log('✅ Type definitions verified successfully');
  console.log('✅ Execution engine imports correctly');
  console.log('\nTo run a real test, use:');
  console.log('  npx ts-node examples/run-execution-engine.ts');
}

verify();
