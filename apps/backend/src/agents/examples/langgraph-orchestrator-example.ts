// Example usage of LangGraph Orchestrator
// Demonstrates how ParsedIntent maps to executable workflows

import { IntentParserAgent } from '../IntentParserAgent';
import { IntentGraphOrchestrator, executeWorkflow } from '../IntentGraphOrchestrator';

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  console.log('='.repeat(80));
  console.log('LangGraph Orchestrator Examples');
  console.log('='.repeat(80));

  // ===========================
  // Example 1: Simple Test Creation
  // ===========================
  console.log('\n📝 Example 1: Simple Test Creation\n');
  
  const result1 = await executeWorkflow(
    'create a login test for demo.app',
    apiKey
  );
  
  console.log('Status:', result1.status);
  console.log('Tests Created:', result1.testDefinitions.length);
  console.log('Audit Trail Entries:', result1.auditTrail.length);
  console.log('Execution Log:');
  result1.executionLogs.forEach(log => console.log('  ', log));

  // ===========================
  // Example 2: Bulk Test Creation
  // ===========================
  console.log('\n📝 Example 2: Bulk Test Creation\n');
  
  const result2 = await executeWorkflow(
    'create 5 tests for checkout flow',
    apiKey
  );
  
  console.log('Status:', result2.status);
  console.log('Tests Created:', result2.testDefinitions.length);
  console.log('Risk Level:', result2.parsedIntent?.estimatedImpact?.riskLevel);
  console.log('Estimated Duration:', result2.parsedIntent?.estimatedImpact?.estimatedDuration);

  // ===========================
  // Example 3: Bulk Test Execution
  // ===========================
  console.log('\n🚀 Example 3: Bulk Test Execution\n');
  
  const result3 = await executeWorkflow(
    'run tests [login, checkout, payment] in parallel with max concurrency 3',
    apiKey
  );
  
  console.log('Status:', result3.status);
  console.log('Tests Executed:', result3.testResults.length);
  console.log('Passed:', result3.finalResult?.passed);
  console.log('Failed:', result3.finalResult?.failed);

  // ===========================
  // Example 4: Test Update
  // ===========================
  console.log('\n✏️ Example 4: Test Update\n');
  
  const result4 = await executeWorkflow(
    'update login test step 3 to wait for dashboard',
    apiKey
  );
  
  console.log('Status:', result4.status);
  console.log('Update Scope:', result4.parsedIntent?.updateScope);
  console.log('Audit Trail:');
  result4.auditTrail.forEach(entry => {
    console.log(`  [${new Date(entry.timestamp).toISOString()}] ${entry.action} - Risk: ${entry.riskLevel}`);
  });

  // ===========================
  // Example 5: PAUSE_AND_ASK Scenario
  // ===========================
  console.log('\n⏸️ Example 5: PAUSE_AND_ASK Scenario\n');
  
  const orchestrator = new IntentGraphOrchestrator(new IntentParserAgent(apiKey));
  
  const result5 = await orchestrator.execute('update test');
  
  console.log('Status:', result5.status);
  console.log('Requires User Input:', result5.requiresUserInput);
  console.log('Question:', result5.userQuestion);
  
  if (result5.requiresUserInput) {
    console.log('\n💬 Providing user response...\n');
    const resumedResult = await orchestrator.resume(result5, 'login test, change credentials');
    console.log('Resumed Status:', resumedResult.status);
    console.log('Final Result:', resumedResult.finalResult);
  }

  // ===========================
  // Example 6: High-Risk PROD Operation
  // ===========================
  console.log('\n⚠️ Example 6: High-Risk PROD Operation\n');
  
  const result6 = await executeWorkflow(
    'delete 50 tests in production',
    apiKey
  );
  
  console.log('Status:', result6.status);
  console.log('Risk Level:', result6.parsedIntent?.estimatedImpact?.riskLevel);
  console.log('Affected Tests:', result6.parsedIntent?.estimatedImpact?.affectedTests);
  console.log('Requires Confirmation:', result6.requiresUserInput);
  console.log('Question:', result6.userQuestion);

  // ===========================
  // Example 7: Complete Workflow with Reporting
  // ===========================
  console.log('\n📊 Example 7: Complete Workflow with Reporting\n');
  
  const result7 = await executeWorkflow(
    'run all login tests with video and screenshots, email report to qa-team@example.com',
    apiKey
  );
  
  console.log('Status:', result7.status);
  console.log('Reporting Config:', result7.parsedIntent?.args.reporting);
  console.log('Secondary Actions:', result7.parsedIntent?.secondaryActions);
  console.log('Complete Execution Log:');
  result7.executionLogs.forEach(log => console.log('  ', log));

  // ===========================
  // Example 8: Workflow Visualization
  // ===========================
  console.log('\n🔍 Example 8: Workflow Visualization\n');
  console.log(orchestrator.getWorkflowVisualization());

  // ===========================
  // Example 9: Parallel Processing
  // ===========================
  console.log('\n⚡ Example 9: Batch Processing Multiple Prompts\n');
  
  const agent = new IntentParserAgent(apiKey);
  const prompts = [
    'create a login test',
    'run checkout test',
    'update report to video only',
    'schedule payment test daily at 9am',
    'delete old test data'
  ];
  
  const batchResults = await agent.parseIntentBatch(prompts);
  
  console.log('Processed Prompts:', batchResults.length);
  batchResults.forEach((result, index) => {
    console.log(`\n  ${index + 1}. "${prompts[index]}"`);
    console.log(`     Action: ${result.primaryAction}`);
    console.log(`     Confidence: ${result.confidence}`);
    console.log(`     Processing Time: ${result.metadata?.processingTime}ms`);
  });

  // ===========================
  // Example 10: Cache Performance
  // ===========================
  console.log('\n💾 Example 10: Cache Performance\n');
  
  const cachedAgent = new IntentParserAgent({
    apiKey,
    enableCache: true,
    cacheTTL: 300000
  });
  
  const startTime = Date.now();
  await cachedAgent.parseIntent('create a test for login');
  const firstCallTime = Date.now() - startTime;
  
  const cacheStartTime = Date.now();
  await cachedAgent.parseIntent('create a test for login'); // Should hit cache
  const cachedCallTime = Date.now() - cacheStartTime;
  
  console.log('First Call:', firstCallTime, 'ms');
  console.log('Cached Call:', cachedCallTime, 'ms');
  console.log('Speedup:', Math.round(firstCallTime / cachedCallTime), 'x faster');
  console.log('Cache Stats:', cachedAgent.getCacheStats());

  console.log('\n' + '='.repeat(80));
  console.log('✅ All Examples Completed');
  console.log('='.repeat(80));
}

// Run examples
if (require.main === module) {
  main().catch(console.error);
}

export { main };
