/**
 * Example: LangGraph-Style Orchestrator Test Flow
 * 
 * Demonstrates a state machine approach to executing complete test flows
 * with better state management, retry logic, and error handling.
 * 
 * Note: This uses SimplifiedLangGraphOrchestrator which implements
 * state machine concepts without the complex LangGraph typing.
 */

import { SimplifiedLangGraphOrchestrator } from './src/agents/SimplifiedLangGraphOrchestrator';
import { TestInput } from './src/models/agentTypes';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🌟 LangGraph-Style Orchestrator Example\n');

  // Initialize the orchestrator
  const orchestrator = new SimplifiedLangGraphOrchestrator(process.env.OPENAI_API_KEY);

  // Check agent health
  const status = orchestrator.getAgentStatus();
  console.log('📊 Agent Status:', status);
  
  const stats = orchestrator.getFlowStats();
  console.log('⚙️  Flow Features:', stats.features);
  console.log('🔄 Max Retries:', stats.maxRetries);
  console.log('');

  // Define test input
  const testInput: TestInput = {
    prompt: 'Test login functionality on example.com at https://example.com',
    options: {
      headless: false,
      recordVideo: false,
      screenshots: true,
    },
  };

  try {
    console.log('🚀 Executing test flow with retry logic...\n');
    console.log('Input:', testInput);
    console.log('');

    // Execute the test flow with automatic retry
    const startTime = Date.now();
    const result = await orchestrator.executeTestFlowWithRetry(testInput);
    const duration = Date.now() - startTime;

    console.log('\n' + '='.repeat(80));
    console.log('📋 EXECUTION RESULTS');
    console.log('='.repeat(80));
    console.log(`Test ID: ${result.testId}`);
    console.log(`Status: ${result.status}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Steps Executed: ${result.steps?.length || 0}`);
    console.log(`Differences Found: ${result.diff?.length || 0}`);
    
    if (result.confidence !== undefined) {
      console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    }

    console.log('\n📸 Evidence:');
    console.log(`  - Screenshots: ${result.evidence?.screenshots?.length || 0}`);
    console.log(`  - Logs: ${result.evidence?.logs?.length || 0}`);
    console.log(`  - Video: ${result.evidence?.video ? 'Yes' : 'No'}`);

    if (result.summary) {
      console.log('\n📝 Summary:');
      console.log(result.summary);
    }

    if (result.suggestedFixes && result.suggestedFixes.length > 0) {
      console.log('\n💡 Suggested Fixes:');
      result.suggestedFixes.forEach((fix, idx) => {
        console.log(`  ${idx + 1}. ${fix}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Test flow completed successfully!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ Error executing test flow:');
    console.error(error);
    process.exit(1);
  }
}

// Run the example
main().catch(console.error);
