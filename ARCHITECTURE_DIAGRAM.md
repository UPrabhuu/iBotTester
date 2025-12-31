# iBotTester Agent Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER PROMPT                                 │
│  "Purchase Nike shoes size 9 under $150 on amazon.com"              │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  INTENT PARSER AGENT                                 │
├─────────────────────────────────────────────────────────────────────┤
│  • Parses natural language                                           │
│  • Extracts: action, target, URL, constraints                        │
│  • AI-powered (GPT-4) with rule-based fallback                       │
│  • Returns confidence score                                          │
├─────────────────────────────────────────────────────────────────────┤
│  Output: {                                                           │
│    action: "purchase",                                               │
│    target: "Nike shoes",                                             │
│    url: "https://amazon.com",                                        │
│    constraints: ["under $150", "size 9"],                            │
│    confidence: 0.9                                                   │
│  }                                                                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│              TEST PLANNER AGENT (JSON)                               │
├─────────────────────────────────────────────────────────────────────┤
│  • Converts intent to structured steps                               │
│  • Machine-readable JSON format                                      │
│  • Deterministic (temperature: 0.3)                                  │
│  • Includes retry policies                                           │
├─────────────────────────────────────────────────────────────────────┤
│  Output: {                                                           │
│    testId: "test-123...",                                            │
│    name: "Amazon Nike Purchase Flow",                                │
│    steps: [                                                          │
│      { step: 1, action: "navigate", url: "..." },                    │
│      { step: 2, action: "search", query: "Nike shoes size 9" },      │
│      { step: 3, action: "validate", rule: "price <= 150" },          │
│      ...                                                             │
│    ]                                                                 │
│  }                                                                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│            EXECUTION AGENT (Playwright)                              │
├─────────────────────────────────────────────────────────────────────┤
│  FEATURES:                                                           │
│  • Playwright browser automation                                     │
│  • Self-healing selectors                                            │
│  • Retry logic (max 2 retries)                                       │
│  • Screenshot after each step                                        │
│  • Video recording                                                   │
│  • Console/network logging                                           │
│                                                                      │
│  SELF-HEALING STRATEGIES:                                            │
│  1. Alternative semantic selectors (aria-label, role, data-testid)   │
│  2. Visible text similarity matching                                 │
│  3. Partial text and fuzzy matching                                  │
│  4. AI-based DOM understanding                                       │
│  5. Fallback logging and tracking                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Output: {                                                           │
│    testId: "test-123...",                                            │
│    status: "PASS" | "FAIL" | "PARTIAL",                              │
│    steps: [                                                          │
│      {                                                               │
│        step: 1,                                                      │
│        status: "PASS",                                               │
│        action: "navigate",                                           │
│        screenshot: "data:image/png;base64,...",                      │
│        fallbackUsed: false                                           │
│      },                                                              │
│      ...                                                             │
│    ]                                                                 │
│  }                                                                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                EVIDENCE COLLECTOR AGENT                              │
├─────────────────────────────────────────────────────────────────────┤
│  COLLECTS:                                                           │
│  • Screenshots (base64 encoded)                                      │
│  • Execution logs (timestamped)                                      │
│  • Video recordings                                                  │
│  • Browser console logs                                              │
│  • Network request logs                                              │
│  • Metadata for each evidence item                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Output: {                                                           │
│    screenshots: ["data:image/png;base64,...", ...],                  │
│    video: "path/to/video.webm",                                      │
│    logs: [                                                           │
│      "[2025-12-31T...] Executing step 1: navigate",                  │
│      "[2025-12-31T...] Step 1 completed successfully",               │
│      ...                                                             │
│    ]                                                                 │
│  }                                                                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│           DIFF & VALIDATION AGENT                                    │
├─────────────────────────────────────────────────────────────────────┤
│  • Stores execution history (last 10 runs, configurable)             │
│  • Compares with last successful run                                 │
│  • Detects changes:                                                  │
│    - Page structure changes                                          │
│    - Element selector changes                                        │
│    - Flow order differences                                          │
│    - Self-healing events                                             │
│  • Classifies differences:                                           │
│    - BREAKING: Test fails, manual intervention needed                │
│    - NON-BREAKING: Test passes with self-healing                     │
│    - COSMETIC: Visual changes only                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Output: [                                                           │
│    {                                                                 │
│      type: "non-breaking",                                           │
│      description: "Button label changed from 'Sign In' to 'Login'",  │
│      element: "login button",                                        │
│      oldValue: "Sign In",                                            │
│      newValue: "Login"                                               │
│    },                                                                │
│    ...                                                               │
│  ]                                                                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│              REPORT GENERATOR AGENT                                  │
├─────────────────────────────────────────────────────────────────────┤
│  PERSONALITY: Senior QA Engineer                                     │
│  • Calm and methodical                                               │
│  • Clear and precise                                                 │
│  • Never hallucinates                                                │
│  • States uncertainties explicitly                                   │
│                                                                      │
│  GENERATES:                                                          │
│  • Human-readable summary                                            │
│  • Root cause analysis                                               │
│  • Suggested fixes (actionable)                                      │
│  • Confidence score (0-1)                                            │
│  • Change impact assessment                                          │
├─────────────────────────────────────────────────────────────────────┤
│  Output: {                                                           │
│    summary: "Test completed successfully. Button label changed       │
│             but test adapted using self-healing...",                 │
│    status: "PASS",                                                   │
│    confidence: 0.92,                                                 │
│    suggestedFixes: [                                                 │
│      "Update test plan to reflect new button label"                  │
│    ],                                                                │
│    executionDetails: {                                               │
│      totalSteps: 7,                                                  │
│      passedSteps: 7,                                                 │
│      failedSteps: 0                                                  │
│    },                                                                │
│    changes: {                                                        │
│      breaking: 0,                                                    │
│      nonBreaking: 1,                                                 │
│      cosmetic: 0                                                     │
│    }                                                                 │
│  }                                                                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FINAL OUTPUT                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Complete test execution result including:                           │
│  • Parsed intent                                                     │
│  • Generated test plan                                               │
│  • Execution results                                                 │
│  • All evidence (screenshots, logs, videos)                          │
│  • Difference analysis                                               │
│  • Comprehensive report                                              │
│  • Confidence score                                                  │
│  • Suggested fixes                                                   │
│  • Agent flow timestamps                                             │
└─────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                    ORCHESTRATOR AGENT
═══════════════════════════════════════════════════════════════════════

Coordinates the entire flow:
  1. Intent Parser
  2. Test Planner
  3. Execution
  4. Evidence Collection
  5. Diff & Validation
  6. Report Generation

Tracks completion status and timestamps for each agent.
Handles errors gracefully with detailed error reporting.

═══════════════════════════════════════════════════════════════════════
```

## API Endpoint

```
POST /api/orchestrated-test
```

**Request:**
```json
{
  "prompt": "Test login on example.com",
  "options": {
    "headless": true,
    "screenshots": true,
    "recordVideo": true
  }
}
```

**Response:**
Complete output from all 6 agents with timestamps and status.

## Key Benefits

✅ **Deterministic** - Same input always produces same test plan  
✅ **Self-Healing** - Adapts to UI changes automatically  
✅ **Observable** - Complete evidence trail  
✅ **Intelligent** - AI-powered where beneficial  
✅ **Reliable** - Retry logic and fallback strategies  
✅ **Actionable** - Clear explanations and suggestions  

## Agent Characteristics

| Agent | AI-Powered | Fallback | Key Feature |
|-------|-----------|----------|-------------|
| Intent Parser | ✅ | ✅ | Extracts structured intent |
| Test Planner | ✅ | ✅ | Generates JSON test plan |
| Execution | ❌ | N/A | Self-healing selectors |
| Evidence Collector | ❌ | N/A | Comprehensive logging |
| Diff Validator | ❌ | N/A | Change classification |
| Report Generator | ✅ | ✅ | Senior QA explanations |
