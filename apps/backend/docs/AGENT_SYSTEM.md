# iBotTester Backend AI Agent System

## Overview

The iBotTester backend now includes a comprehensive AI agent system that serves as the "core brain" for autonomous functional testing. This system converts natural language test requests into structured test plans and executes them using browser automation.

## Architecture

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

## Core Components

### 1. Agent Prompt Configuration (`src/config/agentPrompt.ts`)

Defines the master system prompt that guides the AI agent's behavior:
- **Role Definition**: Autonomous test execution and reasoning agent
- **Behavior Rules**: Deterministic, repeatable, self-healing
- **Input/Output Formats**: Structured JSON for test plans and results
- **Constraints**: Safety rules (no real payments, mask sensitive data)

### 2. Agent Types (`src/models/agentTypes.ts`)

TypeScript interfaces for:
- `TestInput`: User prompt and configuration
- `TestPlan`: Structured test plan with steps
- `TestStep`: Individual test action
- `TestOutput`: Execution results with evidence
- `StepResult`: Result of a single step
- `FlowDifference`: Flow change detection
- `TestEvidence`: Screenshots, videos, logs

### 3. AI Agent Service (`src/services/aiAgentService.ts`)

Handles test plan generation:
- Converts natural language to structured JSON test plans
- Uses OpenAI GPT-4 when available
- Fallback to rule-based generation without AI
- Generates human-readable summaries

### 4. Execution Agent Service (`src/services/executionAgentService.ts`)

Autonomous browser execution:
- Playwright-based browser automation
- Sequential step execution with retry logic
- Self-healing selector strategies
- Screenshot and video capture
- Intelligent error handling

## API Endpoints

### 1. Generate Test Plan
```bash
POST /api/test-plan
Content-Type: application/json

{
  "prompt": "Test login on example.com with valid credentials",
  "environment": "staging",
  "runType": "single",
  "options": {
    "headless": true,
    "screenshots": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "testPlan": {
    "testId": "test-xxx",
    "name": "Example Login Test",
    "steps": [...],
    "createdAt": "2025-12-30T..."
  },
  "aiEnabled": false
}
```

### 2. Execute Test Plan
```bash
POST /api/execute-test-plan
Content-Type: application/json

{
  "testPlan": {
    "name": "Test Name",
    "testId": "test-xxx",
    "steps": [...]
  },
  "options": {
    "headless": true,
    "screenshots": true,
    "recordVideo": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "execution": {
    "testId": "test-xxx",
    "status": "PASS | FAIL | PARTIAL",
    "steps": [...],
    "evidence": {
      "screenshots": ["data:image/png;base64,..."],
      "logs": [...]
    },
    "summary": "Human readable result"
  }
}
```

### 3. Generate and Execute (One Call)
```bash
POST /api/run-test
Content-Type: application/json

{
  "prompt": "Purchase Nike shoes under $150 on amazon.com",
  "environment": "staging",
  "options": {
    "headless": true,
    "screenshots": true
  }
}
```

## Supported Actions

The execution agent supports the following actions:

- **navigate**: Go to a URL
- **search**: Search using a search box
- **click**: Click on an element
- **type**: Type text into an input field
- **validate**: Check if a condition is met
- **add_to_cart**: Add item to shopping cart
- **proceed_to_checkout**: Navigate to checkout
- **wait**: Wait for a specified time

## Self-Healing Features

The execution agent includes intelligent selector strategies:

1. **Search Input Detection**:
   - `input[type="search"]`
   - `input[name*="search"]`
   - `input[placeholder*="search"]`
   - `#search`, `[role="searchbox"]`

2. **Element Finding**:
   - Exact text matching
   - Partial text matching with regex
   - Semantic selector fallbacks

3. **Button Detection**:
   - Common button patterns for add-to-cart
   - Common checkout button patterns

## Retry Logic

- Maximum 2 retries per step (configurable)
- 30-second timeout per action (configurable)
- 1-second delay between retries
- Automatic screenshot capture on failure

## Configuration

Set the OpenAI API key to enable AI-powered test plan generation:

```bash
# In apps/backend/.env
OPENAI_API_KEY=your-api-key-here
```

Without the API key, the system operates in "fallback mode" with rule-based test plan generation.

## Example Usage

### Basic Test Plan

```javascript
const testPlan = {
  name: "Login Test",
  steps: [
    {
      step: 1,
      action: "navigate",
      url: "https://example.com/login"
    },
    {
      step: 2,
      action: "type",
      target: "email input",
      value: "user@example.com"
    },
    {
      step: 3,
      action: "type",
      target: "password input",
      value: "password123"
    },
    {
      step: 4,
      action: "click",
      target: "login button"
    },
    {
      step: 5,
      action: "validate",
      rule: "dashboard page loaded"
    }
  ]
};
```

## Testing

Run the development server:
```bash
cd apps/backend
npm run dev
```

The server will start on port 3001 with the following status:
- ✅ Playwright: Available
- 🤖 OpenAI: Configured/Not configured
- 🧠 AI Agent: Active/Fallback mode

## Future Enhancements

- Multi-agent execution
- API + UI hybrid tests
- Mobile testing agent
- Flow difference detection
- Video recording support
- CI/CD integration

## Key Principles

1. **Deterministic**: Same input produces same output
2. **Calm**: Clear, professional error messages
3. **Self-Healing**: Adapts to UI changes when possible
4. **Evidence-Based**: Captures screenshots and logs
5. **Explainable**: Provides human-readable summaries

---

*"An AI QA engineer that understands intent, executes reliably, and explains clearly."*
