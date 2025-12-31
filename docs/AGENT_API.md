# iBotTester Agent API Documentation

## Agent Architecture

The iBotTester platform uses a multi-agent architecture to provide intelligent, self-healing test automation:

```
User Prompt
   ↓
Intent Parser Agent
   ↓
Test Planner Agent (JSON)
   ↓
Execution Agent (Playwright)
   ↓
Evidence Collector
   ↓
Diff & Validation Agent
   ↓
Report Generator
```

## Agent Endpoints

### 1. Orchestrated Test (Complete Flow)

**Endpoint:** `POST /api/orchestrated-test`

**Description:** Executes the complete agent flow from intent parsing to report generation.

**Request Body:**
```json
{
  "prompt": "Purchase Nike shoes size 9 under $150 on amazon.com",
  "environment": "staging",  // optional: "staging" | "prod"
  "runType": "single",       // optional: "single" | "regression"
  "options": {
    "headless": true,        // optional: run browser in headless mode
    "recordVideo": false,    // optional: record video of execution
    "screenshots": true      // optional: capture screenshots
  }
}
```

**Response:**
```json
{
  "success": true,
  "execution": {
    "testId": "test-123...",
    "status": "PASS",  // "PASS" | "FAIL" | "PARTIAL"
    "steps": [
      {
        "step": 1,
        "status": "PASS",
        "action": "navigate",
        "timestamp": "2025-12-31T...",
        "screenshot": "data:image/png;base64,...",
        "fallbackUsed": false
      }
    ],
    "evidence": {
      "screenshots": ["data:image/png;base64,..."],
      "logs": ["[timestamp] Log message"],
      "video": "path/to/video.webm"
    },
    "diff": [
      {
        "type": "non-breaking",
        "description": "Button label changed from 'Checkout' to 'Proceed'",
        "element": "checkout button"
      }
    ],
    "summary": "Test completed successfully. Self-healing was used on step 3...",
    "confidence": 0.9,
    "suggestedFixes": [
      "Update test plan to use new button label"
    ],
    "intent": {
      "action": "purchase",
      "target": "Nike shoes",
      "url": "https://amazon.com",
      "constraints": ["under $150", "size 9"],
      "confidence": 0.9
    },
    "report": {
      "summary": "Test completed successfully...",
      "status": "PASS",
      "confidence": 0.9,
      "executionDetails": {
        "totalSteps": 7,
        "passedSteps": 7,
        "failedSteps": 0,
        "skippedSteps": 0
      },
      "changes": {
        "breaking": 0,
        "nonBreaking": 1,
        "cosmetic": 0,
        "summary": "Flow adapted successfully using self-healing"
      }
    },
    "agentFlow": {
      "intentParser": { "completed": true, "timestamp": "..." },
      "testPlanner": { "completed": true, "timestamp": "..." },
      "execution": { "completed": true, "timestamp": "..." },
      "evidenceCollector": { "completed": true, "timestamp": "..." },
      "diffValidation": { "completed": true, "timestamp": "..." },
      "reportGenerator": { "completed": true, "timestamp": "..." }
    }
  },
  "agentStatus": {
    "intentParser": true,  // AI-powered
    "testPlanner": true,   // AI-powered
    "reportGenerator": true  // AI-powered
  },
  "message": "✅ Test completed successfully"
}
```

### 2. Test Plan Generation

**Endpoint:** `POST /api/test-plan`

**Description:** Generates a structured JSON test plan from a natural language prompt.

**Request Body:**
```json
{
  "prompt": "Test login functionality on example.com"
}
```

**Response:**
```json
{
  "success": true,
  "testPlan": {
    "testId": "test-123...",
    "name": "Login Functionality Test",
    "steps": [
      {
        "step": 1,
        "action": "navigate",
        "url": "https://example.com"
      },
      {
        "step": 2,
        "action": "click",
        "target": "login button"
      }
    ],
    "createdAt": "2025-12-31T..."
  },
  "aiEnabled": true
}
```

### 3. Execute Test Plan

**Endpoint:** `POST /api/execute-test-plan`

**Description:** Executes an existing test plan.

**Request Body:**
```json
{
  "testPlan": {
    "testId": "test-123",
    "name": "Example Test",
    "steps": [...]
  },
  "options": {
    "headless": true,
    "recordVideo": false,
    "screenshots": true
  }
}
```

### 4. Run Test (Generate + Execute)

**Endpoint:** `POST /api/run-test`

**Description:** Generates a test plan and executes it in one call (without full agent orchestration).

## Agent Behavior

### Self-Healing

When a selector fails, the execution agent:
1. Attempts alternative semantic selectors (aria-label, role, data-testid)
2. Uses visible text similarity matching
3. Tries partial text and fuzzy matching
4. Logs fallback usage
5. Marks step as using fallback for diff detection

### Retry Policy

- Maximum retries: 2
- Default timeout: 30 seconds
- Retry delay: 1 second

### Diff Classification

Differences are classified as:
- **Breaking:** Test fails, requires manual intervention
- **Non-breaking:** Test passes with self-healing adaptation
- **Cosmetic:** Visual changes only, no functional impact

### Agent Personality

The agents behave like a senior QA engineer:
- Calm and methodical
- Deterministic and repeatable
- Clear and precise in communication
- Honest about limitations and uncertainties
- Focused on root cause analysis
- Provides actionable suggestions

**Never:**
- Hallucinates results
- Claims success without evidence
- Hides uncertainties

**Always:**
- States confidence level explicitly
- Backs up claims with evidence
- Admits when uncertain
- Provides specific recommendations

## Example Usage

### cURL Example

```bash
curl -X POST http://localhost:3001/api/orchestrated-test \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test checkout flow on example.com",
    "options": {
      "headless": true,
      "screenshots": true
    }
  }'
```

### JavaScript Example

```javascript
const response = await fetch('http://localhost:3001/api/orchestrated-test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Purchase Nike shoes size 9 under $150 on amazon.com',
    options: {
      headless: true,
      recordVideo: true,
      screenshots: true
    }
  })
});

const result = await response.json();
console.log('Test Status:', result.execution.status);
console.log('Confidence:', result.execution.confidence);
console.log('Summary:', result.execution.summary);
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad request (missing required fields)
- `500` - Internal server error
