/**
 * LangGraph State Machine Visualization Script
 * 
 * This script helps visualize the LangGraph orchestrator structure.
 * Can be used for debugging and documentation.
 */

import { LangGraphOrchestrator } from './src/agents/LangGraphOrchestrator';
import * as fs from 'fs';

async function visualizeGraph() {
  console.log('🎨 Visualizing LangGraph State Machine\n');

  // Create orchestrator
  const orchestrator = new LangGraphOrchestrator(process.env.OPENAI_API_KEY);
  
  console.log('📊 Graph Structure:\n');
  console.log('Nodes:');
  console.log('  1. parseIntent');
  console.log('  2. planTest');
  console.log('  3. executeTest');
  console.log('  4. collectEvidence');
  console.log('  5. validateDiff');
  console.log('  6. generateReport');
  console.log('  7. handleError');
  console.log('  8. finalize');
  console.log('');

  console.log('Edges:');
  console.log('  START → parseIntent');
  console.log('  parseIntent → [conditional]');
  console.log('    ├─→ [continue] → planTest');
  console.log('    └─→ [error] → handleError');
  console.log('  planTest → [conditional]');
  console.log('    ├─→ [continue] → executeTest');
  console.log('    └─→ [error] → handleError');
  console.log('  executeTest → [conditional]');
  console.log('    ├─→ [continue] → collectEvidence');
  console.log('    └─→ [error] → handleError');
  console.log('  collectEvidence → validateDiff');
  console.log('  validateDiff → generateReport');
  console.log('  generateReport → finalize');
  console.log('  handleError → [conditional]');
  console.log('    ├─→ [retry] → parseIntent');
  console.log('    └─→ [end] → finalize');
  console.log('  finalize → END');
  console.log('');

  // Generate Mermaid diagram
  const mermaidDiagram = `
graph TD
    START([START]) --> parseIntent[Parse Intent]
    
    parseIntent --> intentCheck{Valid Intent?}
    intentCheck -->|Yes| planTest[Plan Test]
    intentCheck -->|No/Error| handleError[Handle Error]
    
    planTest --> planCheck{Valid Plan?}
    planCheck -->|Yes| executeTest[Execute Test]
    planCheck -->|No/Error| handleError
    
    executeTest --> execCheck{Success?}
    execCheck -->|Yes| collectEvidence[Collect Evidence]
    execCheck -->|No/Error| handleError
    
    collectEvidence --> validateDiff[Validate Diff]
    validateDiff --> generateReport[Generate Report]
    generateReport --> finalize[Finalize]
    
    handleError --> retryCheck{Retry Count < 2?}
    retryCheck -->|Yes| parseIntent
    retryCheck -->|No| finalize
    
    finalize --> END([END])
    
    style START fill:#90EE90
    style END fill:#FFB6C6
    style handleError fill:#FFD700
    style parseIntent fill:#87CEEB
    style planTest fill:#87CEEB
    style executeTest fill:#87CEEB
    style collectEvidence fill:#87CEEB
    style validateDiff fill:#87CEEB
    style generateReport fill:#87CEEB
    style finalize fill:#DDA0DD
`;

  // Write Mermaid diagram to file
  fs.writeFileSync('./docs/langgraph-diagram.mmd', mermaidDiagram.trim());
  console.log('✅ Mermaid diagram saved to: docs/langgraph-diagram.mmd');
  console.log('');
  console.log('To visualize:');
  console.log('  1. Copy the content of langgraph-diagram.mmd');
  console.log('  2. Paste into https://mermaid.live/');
  console.log('  3. Or use a Mermaid VS Code extension');
  console.log('');

  // Generate state flow documentation
  const stateFlow = `
# State Flow Through Nodes

## Initial State
\`\`\`json
{
  "input": { "prompt": "...", "url": "...", "options": {...} },
  "agentFlow": {
    "intentParser": { "completed": false, "timestamp": "" },
    "testPlanner": { "completed": false, "timestamp": "" },
    "execution": { "completed": false, "timestamp": "" },
    "evidenceCollector": { "completed": false, "timestamp": "" },
    "diffValidation": { "completed": false, "timestamp": "" },
    "reportGenerator": { "completed": false, "timestamp": "" }
  },
  "retryCount": 0
}
\`\`\`

## After parseIntent
\`\`\`json
{
  ...previousState,
  "intent": {
    "primaryAction": "test_login",
    "confidence": 0.95,
    "args": {...}
  },
  "agentFlow": {
    ...previousAgentFlow,
    "intentParser": { "completed": true, "timestamp": "2026-01-04T..." }
  }
}
\`\`\`

## After planTest
\`\`\`json
{
  ...previousState,
  "testPlan": {
    "testId": "test-123",
    "steps": [...]
  },
  "agentFlow": {
    ...previousAgentFlow,
    "testPlanner": { "completed": true, "timestamp": "2026-01-04T..." }
  }
}
\`\`\`

## After executeTest
\`\`\`json
{
  ...previousState,
  "executionResult": {
    "status": "PASS",
    "steps": [...],
    "evidence": {...}
  },
  "agentFlow": {
    ...previousAgentFlow,
    "execution": { "completed": true, "timestamp": "2026-01-04T..." }
  }
}
\`\`\`

## Final State
\`\`\`json
{
  ...allPreviousState,
  "finalOutput": {
    "testId": "test-123",
    "status": "PASS",
    "steps": [...],
    "evidence": {...},
    "diff": [...],
    "report": {...},
    "confidence": 0.92,
    "summary": "Test completed successfully"
  }
}
\`\`\`
`;

  fs.writeFileSync('./docs/langgraph-state-flow.md', stateFlow.trim());
  console.log('✅ State flow documentation saved to: docs/langgraph-state-flow.md');
  console.log('');

  // Check agent status
  const status = orchestrator.getAgentStatus();
  console.log('🔍 Agent Health Check:');
  console.log(`  Intent Parser: ${status.intentParser ? '✅' : '❌'}`);
  console.log(`  Test Planner: ${status.testPlanner ? '✅' : '❌'}`);
  console.log(`  Report Generator: ${status.reportGenerator ? '✅' : '❌'}`);
  console.log('');

  console.log('✨ Visualization complete!');
}

// Run visualization
visualizeGraph().catch(console.error);
