# Quick Start Guide - Agent Workflow

## Get Started in 5 Minutes

### 1. Install Dependencies

```bash
cd apps/backend
npm install playwright
```

### 2. Set Up Environment Variables

Create or update `.env` file:

```bash
OPENAI_API_KEY=your_api_key_here
PORT=3001
```

### 3. Register API Routes

Add to your `server.ts` or main Express app:

```typescript
import workflowRoutes from "./routes/workflow.routes";

// ... other routes
app.use("/api/workflow", workflowRoutes);
```

### 4. Test the Installation

#### Option A: Run Test Suite

```bash
npx ts-node src/agents/examples/test-workflow.ts
```

Expected output:

```
🧪 Testing Agent Workflow Implementation
============================================================

📝 Test 1: Intent Parser - Basic functionality
✅ PASS - Intent parsed correctly
   Primary Action: CREATE
   Confidence: 95.0%

...

📊 Test Summary:
   Total Tests: 7
   ✅ Passed: 7
   ❌ Failed: 0
   Success Rate: 100.0%
```

#### Option B: Run Examples

```bash
npx ts-node src/agents/examples/workflow-examples.ts
```

### 5. Start the Server

```bash
npm run dev
```

### 6. Test the API

#### Health Check

```bash
curl http://localhost:3001/api/workflow/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "intentParser": true,
    "discoveryAgent": true,
    "testGenerator": true,
    "openAI": true
  }
}
```

#### Execute Workflow

```bash
curl -X POST http://localhost:3001/api/workflow/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userPrompt": "Create a test for the login page",
    "targetUrl": "https://example.com/login"
  }'
```

## Your First Test Generation

### Using TypeScript

```typescript
import { AgentWorkflow } from "./agents";

async function generateTest() {
  const workflow = new AgentWorkflow({
    openaiApiKey: process.env.OPENAI_API_KEY,
    verbose: true,
  });

  const result = await workflow.execute(
    "Create a test to fill out the contact form",
    "https://example.com/contact"
  );

  if (result.success) {
    console.log("✅ Test generated!");
    console.log(`Test Cases: ${result.testModel?.testCases.length}`);
    console.log(`Total Steps: ${result.testModel?.testCases[0].steps.length}`);
  } else {
    console.error("❌ Error:", result.error);
  }
}

generateTest();
```

### Using REST API

```javascript
const response = await fetch("http://localhost:3001/api/workflow/execute", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userPrompt: "Test the login functionality",
    targetUrl: "https://example.com/login",
  }),
});

const data = await response.json();
console.log("Test Model:", data.data.testModel);
```

### Using cURL

```bash
curl -X POST http://localhost:3001/api/workflow/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userPrompt": "Test navigation through menu",
    "targetUrl": "https://example.com"
  }' | jq .
```

## Common Use Cases

### 1. Generate Form Test

```typescript
const result = await workflow.execute(
  "Create a test to submit the registration form",
  "https://example.com/register"
);
```

### 2. Generate Navigation Test

```typescript
const result = await workflow.execute(
  "Test all navigation links",
  "https://example.com"
);
```

### 3. Batch Generation

```typescript
const results = await workflow.executeBatch([
  { prompt: "Test login", url: "https://example.com/login" },
  { prompt: "Test signup", url: "https://example.com/signup" },
  { prompt: "Test checkout", url: "https://example.com/checkout" },
]);
```

### 4. Export to File

```typescript
const json = await workflow.executeAndGetJSON(
  "Create comprehensive tests for the user profile page",
  "https://example.com/profile"
);

fs.writeFileSync("profile-tests.json", json);
```

## Understanding the Output

### Test Model Structure

```json
{
  "modelVersion": "1.0.0",
  "generatedAt": "2026-01-01T12:00:00.000Z",
  "intent": {
    "userPrompt": "...",
    "primaryAction": "CREATE",
    "confidence": 0.95
  },
  "testCases": [
    {
      "testName": "Form Submission Test",
      "steps": [
        {
          "action": "navigate",
          "description": "Navigate to page"
        },
        {
          "action": "type",
          "element": {
            "locator": "page.getByLabel('Email')",
            "strategy": "label"
          },
          "data": { "value": "test@example.com" }
        }
      ]
    }
  ]
}
```

### Step Actions

- `navigate` - Go to URL
- `click` - Click element
- `type` - Enter text
- `check` - Check checkbox
- `uncheck` - Uncheck checkbox
- `select` - Select from dropdown
- `wait` - Wait for condition
- `assert` - Validate condition
- `screenshot` - Capture screenshot

## Tips for Better Results

### 1. Be Specific in Prompts

❌ Bad: "Test the page"
✅ Good: "Create a test to fill out the contact form and verify submission"

### 2. Include Context

❌ Bad: "Test login"
✅ Good: "Test the login functionality with valid credentials and verify dashboard loads"

### 3. Specify Requirements

```typescript
const result = await workflow.execute(
  "Test checkout process with screenshots at each step",
  "https://example.com/checkout",
  {
    generatorOptions: {
      includeScreenshots: true,
      includeValidations: true,
      priority: "critical",
    },
  }
);
```

## Troubleshooting

### Issue: "OpenAI API key not found"

**Solution:** Set `OPENAI_API_KEY` in your environment variables

### Issue: "Page discovery timeout"

**Solution:** Increase timeout in options:

```typescript
{
  discoveryOptions: {
    waitTimeout: 60000; // 60 seconds
  }
}
```

### Issue: "No elements discovered"

**Solution:** Check if page requires authentication:

```typescript
{
  discoveryOptions: {
    storageState: "./auth-state.json";
  }
}
```

### Issue: "Unable to find element"

**Solution:** Enable hidden elements:

```typescript
{
  discoveryOptions: {
    includeHidden: true;
  }
}
```

## Next Steps

1. ✅ Read the [complete documentation](./README_WORKFLOW.md)
2. ✅ Explore [API endpoints](../docs/WORKFLOW_API.md)
3. ✅ Review [architecture diagrams](../docs/WORKFLOW_ARCHITECTURE.md)
4. ✅ Try the [example scripts](./examples/workflow-examples.ts)
5. ✅ Integrate with your test execution engine

## Need Help?

- Check the [examples](./examples/workflow-examples.ts)
- Review the [API documentation](../docs/WORKFLOW_API.md)
- Read the [implementation summary](../docs/IMPLEMENTATION_SUMMARY_WORKFLOW.md)

## What's Next?

Once you're comfortable with basic usage, explore:

- Custom test scenarios
- Advanced locator strategies
- Batch processing
- API integration
- CI/CD integration

Happy testing! 🚀
