# iBotTester System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                            │
│  • React Components • Dashboard • Test Editor • Live Execution       │
│  • Chat Interface • Project Management • Execution Results           │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Express + TypeScript)                │
├─────────────────────────────────────────────────────────────────────┤
│  Endpoints: /api/auth, /api/projects, /api/test-cases,              │
│             /api/executions, /api/workflows, /api/chat,              │
│             /api/playwright, /api/orchestrated-test                  │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┬──────────────────┐
        │                  │                  │                  │
        ▼                  ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  AGENT       │  │  WORKFLOW    │  │  EXECUTION   │  │  DATABASE    │
│  SYSTEM      │  │  ENGINE      │  │  ENGINE      │  │  (Postgres)  │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

## Core Concept Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER PROMPT                                 │
│  "Purchase Nike shoes size 9 under $150 on amazon.com"              │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   AGENT (INTENT + PLAN)                              │
│  Files: IntentParserAgent.ts + TestModelGenerator.ts                │
├─────────────────────────────────────────────────────────────────────┤
│  STEP 1: Intent Parsing                                              │
│  • Parse natural language prompt                                     │
│  • Extract: action, target, URL, constraints                         │
│  • AI-powered (OpenAI GPT)                                           │
│  • Store in ParsedIntent DB                                          │
│                                                                      │
│  STEP 2: Test Planning (AI)                                         │
│  • Generate test strategy                                            │
│  • Define test scenarios                                             │
│  • Plan execution steps                                              │
├─────────────────────────────────────────────────────────────────────┤
│  Output: ParsedIntent + Test Plan                                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│              PLAYWRIGHT DISCOVER TOOL                                │
│  File: PlaywrightDiscoveryAgent.ts                                   │
├─────────────────────────────────────────────────────────────────────┤
│  • Launch Playwright browser                                         │
│  • Navigate to target URL                                            │
│  • Discover page elements (buttons, inputs, links, etc.)             │
│  • Capture element properties (selector, text, role, etc.)           │
│  • Screenshot page states                                            │
│  • Store in DiscoveredPageSnapshot DB                                │
├─────────────────────────────────────────────────────────────────────┤
│  Output: Discovered Page Elements (JSON)                            │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TEST MODEL (JSON)                                 │
│  File: TestModelGenerator.ts                                         │
├─────────────────────────────────────────────────────────────────────┤
│  • Combine Intent + Discovered Elements                              │
│  • AI generates structured test model                                │
│  • Create test cases with steps                                      │
│  • Define assertions and validations                                 │
│  • Store in GeneratedTestModel DB                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Output: {                                                           │
│    testCases: [{                                                     │
│      name: "Purchase Nike shoes",                                    │
│      steps: [                                                        │
│        { action: "navigate", url: "..." },                           │
│        { action: "search", selector: "...", value: "..." },          │
│        { action: "click", selector: "..." },                         │
│        { action: "assert", condition: "price <= 150" }               │
│      ]                                                               │
│    }]                                                                │
│  }                                                                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│        [OPTIONAL] CODE GENERATOR + STORE PLAYWRIGHT CODE             │
│  File: (Future enhancement)                                          │
├─────────────────────────────────────────────────────────────────────┤
│  • Convert Test Model to Playwright TypeScript code                  │
│  • Generate .spec.ts files                                           │
│  • Store in repository                                               │
│  • Enable version control                                            │
├─────────────────────────────────────────────────────────────────────┤
│  Output: test.spec.ts (Playwright Test File)                        │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PLAYWRIGHT RUNNER                                 │
│  File: PlaywrightExecutionEngine.ts                                  │
├─────────────────────────────────────────────────────────────────────┤
│  • Execute test model steps                                          │
│  • Self-healing selectors (automatic fallback)                       │
│  • Capture screenshots at each step                                  │
│  • Record video of execution                                         │
│  • Log console & network activity                                    │
│  • Retry failed steps                                                │
│  • Store in PlaywrightExecution DB                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Output: Execution Results + Evidence                               │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RESULT + REPORT                                   │
│  Files: ReportGeneratorAgent.ts + DiffValidationAgent.ts            │
├─────────────────────────────────────────────────────────────────────┤
│  STEP 1: Diff & Validation                                          │
│  • Compare with previous runs                                        │
│  • Detect UI changes                                                 │
│  • Classify: BREAKING / NON-BREAKING / COSMETIC                      │
│                                                                      │
│  STEP 2: AI Report Generation                                       │
│  • Human-readable summary                                            │
│  • Root cause analysis                                               │
│  • Suggested fixes                                                   │
│  • Confidence score                                                  │
├─────────────────────────────────────────────────────────────────────┤
│  Output: {                                                           │
│    status: "PASS" | "FAIL" | "PARTIAL",                              │
│    summary: "Test completed successfully...",                        │
│    evidence: { screenshots: [...], video: "...", logs: [...] },     │
│    changes: { breaking: 0, nonBreaking: 1, cosmetic: 0 },           │
│    report: "AI-generated explanation...",                            │
│    suggestedFixes: [...]                                             │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

**User & Auth**

- `users` - User accounts with OAuth support (Google, GitHub)
- `user_settings` - User preferences and configurations

**Project Management**

- `projects` - Test projects
- `test_cases` - Test case definitions
- `test_steps` - Individual test steps
- `executions` - Test execution results
- `configurations` - Project configurations

**Agent System**

- `parsed_intents` - Intent parser output
- `workflow_executions` - Complete workflow runs
- `workflow_activities` - Individual workflow steps
- `discovered_page_snapshots` - Page discovery results
- `generated_test_models` - Generated test models
- `execution_snapshots` - Historical execution data
- `playwright_executions` - Playwright test runs

**Chat & Communication**

- `chat_conversations` - Chat sessions
- `chat_messages` - Chat message history

## API Endpoints

### Core APIs

```
POST   /api/auth/register              - User registration
POST   /api/auth/login                 - User login
GET    /api/auth/profile               - Get user profile

GET    /api/projects                   - List projects
POST   /api/projects                   - Create project

GET    /api/test-cases                 - List test cases
POST   /api/test-cases                 - Create test case

GET    /api/executions                 - List executions
POST   /api/executions                 - Create execution
```

### Agent & Workflow APIs

```
POST   /api/orchestrated-test          - Run full agent workflow
POST   /api/intent/parse               - Parse user intent

POST   /api/workflows/execute          - Execute workflow
GET    /api/workflows                  - List workflows
GET    /api/workflows/:id/activities   - Get workflow activities
GET    /api/workflows/:id/test-model   - Get generated test model

POST   /api/playwright/discover        - Playwright page discovery
POST   /api/playwright/execute         - Execute Playwright test
```

### Chat & Dashboard

```
GET    /api/chat/conversations         - List conversations
POST   /api/chat/message               - Send message
GET    /api/dashboard/stats            - Dashboard statistics
```

## Technology Stack

**Frontend:** Next.js 13+, TypeScript, Tailwind CSS  
**Backend:** Node.js, Express, TypeScript, Prisma ORM  
**Database:** PostgreSQL  
**AI & Automation:** OpenAI GPT, Playwright, LangGraph  
**DevOps:** Docker, Docker Compose

## Key Features

✅ Multi-Agent System  
✅ Workflow Orchestration  
✅ Self-Healing Tests  
✅ Page Discovery  
✅ Test Generation  
✅ Evidence Collection  
✅ Change Detection  
✅ Chat Interface  
✅ OAuth Support

## Agent Summary

| Agent                    | File                        | AI  | Database               | Purpose                 |
| ------------------------ | --------------------------- | --- | ---------------------- | ----------------------- |
| IntentParserAgent        | IntentParserAgent.ts        | ✅  | ParsedIntent           | Parse prompts           |
| PlaywrightDiscoveryAgent | PlaywrightDiscoveryAgent.ts | ❌  | DiscoveredPageSnapshot | Discover elements       |
| TestModelGenerator       | TestModelGenerator.ts       | ✅  | GeneratedTestModel     | Generate tests          |
| EvidenceCollectorAgent   | EvidenceCollectorAgent.ts   | ❌  | -                      | Collect artifacts       |
| DiffValidationAgent      | DiffValidationAgent.ts      | ❌  | ExecutionSnapshot      | Validate changes        |
| ReportGeneratorAgent     | ReportGeneratorAgent.ts     | ✅  | -                      | Generate reports        |
| OrchestratorAgent        | OrchestratorAgent.ts        | ❌  | -                      | Coordinate flow         |
| AgentWorkflow            | AgentWorkflow.ts            | ❌  | WorkflowExecution      | Execute workflow        |
| IntentGraphOrchestrator  | IntentGraphOrchestrator.ts  | ❌  | -                      | LangGraph orchestration |

## Orchestration Layer

The core flow is coordinated by these orchestrator components:

**1. OrchestratorAgent** (`OrchestratorAgent.ts`)

- Coordinates the complete agent chain
- Manages state between steps
- Handles error recovery

**2. AgentWorkflow** (`AgentWorkflow.ts`)

- Simplified workflow execution
- Database persistence at each step
- Tracks WorkflowExecution and WorkflowActivities

**3. IntentGraphOrchestrator** (`IntentGraphOrchestrator.ts`)

- LangGraph-based state machine
- Conditional branching logic
- Advanced multi-agent coordination

## Execution Flows

### Primary Flow (Core Concept)

```
User Prompt → Agent (Intent + Plan) → Playwright Discover Tool
→ Test Model (JSON) → [Optional: Code Generator] → Playwright Runner
→ Result + Report
```

### Alternative Flows

**Quick Execution** (Skip Discovery)

```
User Prompt → Intent Parser → Direct Execution → Report
```

**Chat-Based Testing**

```
Chat Message → Parse Intent → Execute Workflow → Stream Results
→ Update Conversation
```
