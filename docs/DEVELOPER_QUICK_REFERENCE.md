# Developer Quick Reference - Backend Flow

## TL;DR

**The backend already implements the required flow. No changes needed. All UI APIs remain unchanged.**

## Quick Links

- **Main Orchestrator**: `apps/backend/src/agents/AgentWorkflow.ts`
- **Controllers**: `apps/backend/src/controllers/workflowController.ts`
- **API Routes**: `apps/backend/src/routes/workflow.routes.ts`
- **Full Documentation**: `docs/FINAL_REPORT.md`

## How to Use the Flow

### Option 1: Execute Complete Workflow

```typescript
// API Call
POST /api/workflows/execute
{
  "prompt": "Create a login test for example.com",
  "url": "https://example.com",
  "projectId": "optional-project-id",
  "options": {
    "verbose": true,
    "discoveryOptions": { "captureScreenshots": true },
    "generatorOptions": { "includeScreenshots": true }
  }
}

// Response
{
  "success": true,
  "workflow": {
    "id": "workflow-id",
    "status": "completed",
    "activities": [
      { "activityType": "intent", "status": "completed" },
      { "activityType": "discovery", "status": "completed" },
      { "activityType": "generation", "status": "completed" }
    ]
  },
  "result": {
    "testModel": { /* Generated test model JSON */ },
    "metadata": { /* Timing info */ }
  }
}
```

### Option 2: Parse Intent Only

```typescript
// API Call
POST /api/intent/parse
{
  "prompt": "Create a login test",
  "projectId": "optional-project-id"
}

// Response
{
  "success": true,
  "intent": {
    "id": "intent-id",
    "action": "CREATE",
    "target": "login test",
    "confidence": 0.95,
    "aiUsed": true
  }
}
```

### Option 3: Execute Playwright Test

```typescript
// Step 1: Create execution
POST /api/playwright/executions
{
  "executionName": "Login Test",
  "testSteps": [
    { "stepNumber": 1, "action": "navigate", "value": "https://example.com" },
    { "stepNumber": 2, "action": "fill", "selector": "#username", "value": "user@example.com" },
    { "stepNumber": 3, "action": "fill", "selector": "#password", "value": "password123" },
    { "stepNumber": 4, "action": "click", "selector": "button[type='submit']" }
  ],
  "startUrl": "https://example.com",
  "userId": "user-id",
  "config": {
    "browserType": "chromium",
    "headless": true,
    "screenshotsEnabled": true,
    "videoEnabled": true
  }
}

// Step 2: Start execution
POST /api/playwright/executions/:executionId/start
{
  "testSteps": [ /* same as above */ ],
  "startUrl": "https://example.com",
  "config": { /* same as above */ }
}

// Step 3: Get results
GET /api/playwright/executions/:executionId
GET /api/playwright/executions/:executionId/evidence
GET /api/playwright/executions/:executionId/report
```

## Code Examples

### Using AgentWorkflow Directly

```typescript
import { AgentWorkflow } from "./agents/AgentWorkflow";

const workflow = new AgentWorkflow({
  openaiApiKey: process.env.OPENAI_API_KEY,
  verbose: true,
});

const result = await workflow.execute(
  "Create a login test for example.com",
  "https://example.com"
);

if (result.success) {
  console.log("Test Model:", result.testModel);
  console.log("Metadata:", result.metadata);
}
```

### Using Individual Agents

```typescript
// Intent Parsing Only
import { IntentParserAgent } from "./agents/IntentParserAgent";

const intentParser = new IntentParserAgent(process.env.OPENAI_API_KEY);
const intent = await intentParser.parseIntent("Create a login test");

// Page Discovery Only
import { PlaywrightDiscoveryAgent } from "./agents/PlaywrightDiscoveryAgent";

const discoveryAgent = new PlaywrightDiscoveryAgent();
const page = await discoveryAgent.discoverPage({
  url: "https://example.com",
  captureScreenshots: true,
});

// Test Model Generation Only
import { TestModelGenerator } from "./agents/TestModelGenerator";

const generator = new TestModelGenerator();
const testModel = await generator.generateTestModel(
  "Create a login test",
  intent,
  page
);
```

## Frontend Integration

### HomeView.tsx (Intent Parsing)

```typescript
import { intentApi } from "../services/api";

// Parse user prompt
const response = await intentApi.parseIntent(prompt, selectedProject?.id);

if (response.success) {
  console.log("Intent:", response.data.intent);
}
```

### PlaywrightExecutionView.tsx (Test Execution)

```typescript
import { playwrightApi } from "../services/playwrightApi";

// List executions
const executions = await playwrightApi.getAllExecutions({
  projectId: selectedProject?.id,
});

// View execution details
const execution = await playwrightApi.getExecution(executionId);
const evidence = await playwrightApi.getEvidence(executionId);
const report = await playwrightApi.getExecutionReport(executionId);
```

## Database Queries

### Get Complete Workflow with All Data

```typescript
const workflow = await prisma.workflowExecution.findUnique({
  where: { id: workflowId },
  include: {
    activities: {
      include: {
        discoveredPageSnapshot: true,
        generatedTestModel: true,
      },
    },
    parsedIntent: true,
  },
});
```

### Get Test Execution with Evidence

```typescript
const execution = await prisma.playwrightExecution.findUnique({
  where: { id: executionId },
  include: {
    evidenceData: { orderBy: { timestamp: "asc" } },
    validationResult: true,
    executionReport: true,
  },
});
```

## Environment Variables

Required for full functionality:

```env
# OpenAI (for intent parsing)
OPENAI_API_KEY=sk-...

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ibottester

# Optional: Anthropic (for validation)
ANTHROPIC_API_KEY=sk-ant-...
```

## Testing the Flow

### Manual Test via API

```bash
# 1. Parse intent
curl -X POST http://localhost:3001/api/intent/parse \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"prompt": "Create a login test"}'

# 2. Execute complete workflow
curl -X POST http://localhost:3001/api/workflows/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "Create a login test for example.com",
    "url": "https://example.com"
  }'

# 3. Get workflow results
curl http://localhost:3001/api/workflows/:workflowId \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Programmatic Test

```typescript
// Test file: apps/backend/test-workflow.ts
import { AgentWorkflow } from "./src/agents/AgentWorkflow";

async function testWorkflow() {
  const workflow = new AgentWorkflow({
    openaiApiKey: process.env.OPENAI_API_KEY,
    verbose: true,
  });

  const result = await workflow.execute(
    "Create a login test with email and password fields",
    "https://example.com/login"
  );

  console.log("Success:", result.success);
  console.log("Test Cases:", result.testModel?.testCases?.length);
  console.log("Total Time:", result.metadata.totalTime + "ms");
}

testWorkflow();
```

## Common Issues

### Issue: "OpenAI API key not configured"

**Solution**: Add `OPENAI_API_KEY` to `.env` file

### Issue: "Page discovery failed"

**Solution**: Check URL is accessible and valid

### Issue: "Intent parsing returned a question"

**Solution**: Prompt is too vague, be more specific about the action

### Issue: "No elements discovered"

**Solution**: Page might need more time to load, increase `waitTimeout`

## Next Steps

1. ✅ Flow is already implemented
2. ✅ All APIs are working
3. ✅ Frontend is compatible
4. ⚠️ Optional: Add Code Generator service
5. ⚠️ Optional: Add more test generators for different frameworks

## Support

- **Documentation**: `docs/FINAL_REPORT.md`
- **Architecture**: `docs/ARCHITECTURE_FLOW_DIAGRAM.md`
- **API Reference**: `docs/API.md`
- **Issues**: GitHub Issues
