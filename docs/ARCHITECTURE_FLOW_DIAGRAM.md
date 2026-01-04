# Backend Flow Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (UI)                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   HomeView.tsx   │  │ PlaywrightExecu- │  │   Other Views    │  │
│  │                  │  │  tionView.tsx    │  │                  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
└───────────┼────────────────────┼────────────────────┼──────────────┘
            │                    │                    │
            │ intentApi          │ playwrightApi      │ other APIs
            │                    │                    │
┌───────────▼────────────────────▼────────────────────▼──────────────┐
│                         BACKEND API LAYER                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  /api/intent/*   │  │ /api/playwright/*│  │ /api/workflows/* │  │
│  │  ├─ parse        │  │  ├─ executions   │  │  ├─ execute      │  │
│  │  └─ history      │  │  ├─ evidence     │  │  ├─ list         │  │
│  │                  │  │  ├─ validation   │  │  └─ details      │  │
│  │                  │  │  └─ report       │  │                  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
└───────────┼────────────────────┼────────────────────┼──────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CONTROLLERS LAYER                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ intentController │  │  playwright      │  │ workflowControl- │  │
│  │                  │  │  routes          │  │ler               │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
└───────────┼────────────────────┼────────────────────┼──────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              AgentWorkflow (Main Orchestrator)                 │ │
│  │                                                                │ │
│  │  execute(userPrompt, targetUrl):                              │ │
│  │    ┌──────────────────────────────────────────────────────┐   │ │
│  │    │ Step 1: Parse Intent                                 │   │ │
│  │    │   → IntentParserAgent.parseIntent()                  │   │ │
│  │    │   → Returns: ParsedIntent                            │   │ │
│  │    └──────────────────────────────────────────────────────┘   │ │
│  │                          ↓                                     │ │
│  │    ┌──────────────────────────────────────────────────────┐   │ │
│  │    │ Step 2: Discover Page with Playwright               │   │ │
│  │    │   → PlaywrightDiscoveryAgent.discoverPage()         │   │ │
│  │    │   → Launch browser, find elements, locators         │   │ │
│  │    │   → Returns: DiscoveredPage                          │   │ │
│  │    └──────────────────────────────────────────────────────┘   │ │
│  │                          ↓                                     │ │
│  │    ┌──────────────────────────────────────────────────────┐   │ │
│  │    │ Step 3: Generate Test Model (JSON)                  │   │ │
│  │    │   → TestModelGenerator.generateTestModel()          │   │ │
│  │    │   → Map intent to elements, create steps            │   │ │
│  │    │   → Returns: TestModel                              │   │ │
│  │    └──────────────────────────────────────────────────────┘   │ │
│  │                          ↓                                     │ │
│  │    ┌──────────────────────────────────────────────────────┐   │ │
│  │    │ Step 4: [OPTIONAL] Generate Code                    │   │ │
│  │    │   → CodeGeneratorService (not yet implemented)      │   │ │
│  │    │   → Generate Playwright code from test model        │   │ │
│  │    └──────────────────────────────────────────────────────┘   │ │
│  │                          ↓                                     │ │
│  │    ┌──────────────────────────────────────────────────────┐   │ │
│  │    │ Step 5: Execute Test with Playwright                │   │ │
│  │    │   → PlaywrightRunnerService.executeTest()           │   │ │
│  │    │   → Run steps, capture evidence                     │   │ │
│  │    │   → Returns: Execution results                      │   │ │
│  │    └──────────────────────────────────────────────────────┘   │ │
│  │                          ↓                                     │ │
│  │    ┌──────────────────────────────────────────────────────┐   │ │
│  │    │ Step 6: Generate Result + Report                    │   │ │
│  │    │   → EvidenceCollectorService                        │   │ │
│  │    │   → DiffValidationAgentService                      │   │ │
│  │    │   → ReportGeneratorService                          │   │ │
│  │    │   → Returns: Complete report with evidence          │   │ │
│  │    └──────────────────────────────────────────────────────┘   │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AGENTS & SERVICES LAYER                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ IntentParser     │  │ PlaywrightDiscov-│  │ TestModelGenera- │  │
│  │ Agent            │  │ eryAgent         │  │ tor              │  │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │
│  │ │OpenAI GPT-4  │ │  │ │Playwright    │ │  │ │Rule-based    │ │  │
│  │ │or Rule-based │ │  │ │Browser       │ │  │ │Generator     │ │  │
│  │ └──────────────┘ │  │ │Automation    │ │  │ └──────────────┘ │  │
│  └──────────────────┘  │ └──────────────┘ │  └──────────────────┘  │
│                        └──────────────────┘                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ PlaywrightRunner │  │ EvidenceCollector│  │ DiffValidation   │  │
│  │ Service          │  │ Service          │  │ AgentService     │  │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │
│  │ │Execute steps │ │  │ │Screenshots   │ │  │ │AI Analysis   │ │  │
│  │ │Capture data  │ │  │ │Videos        │ │  │ │Validation    │ │  │
│  │ │Handle errors │ │  │ │Traces        │ │  │ └──────────────┘ │  │
│  │ └──────────────┘ │  │ └──────────────┘ │  └──────────────────┘  │
│  └──────────────────┘  └──────────────────┘                         │
│  ┌──────────────────┐                                               │
│  │ ReportGenerator  │                                               │
│  │ Service          │                                               │
│  │ ┌──────────────┐ │                                               │
│  │ │Generate      │ │                                               │
│  │ │reports       │ │                                               │
│  │ └──────────────┘ │                                               │
│  └──────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER (Prisma)                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │WorkflowExecution │  │WorkflowActivity  │  │ParsedIntent      │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │DiscoveredPage    │  │GeneratedTestModel│  │PlaywrightExecu-  │  │
│  │Snapshot          │  │                  │  │tion              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │EvidenceData      │  │ValidationResult  │  │ExecutionReport   │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Flow Execution Example

### Example 1: Complete Workflow Execution

```typescript
// Frontend: HomeView.tsx
const response = await intentApi.parseIntent(prompt, projectId);

// Backend: POST /api/intent/parse
intentController.parseIntent()
  → IntentParserAgent.parseIntent()
  → Save to ParsedIntent table
  → Return intent to frontend

// User can then trigger full workflow
POST /api/workflows/execute
  → workflowController.executeWorkflow()
    → AgentWorkflow.execute()
      → Step 1: IntentParserAgent → ParsedIntent
      → Step 2: PlaywrightDiscoveryAgent → DiscoveredPage
      → Step 3: TestModelGenerator → TestModel
      → Step 5: PlaywrightRunnerService → Execute
      → Step 6: Evidence + Validation + Report → Results
    → Save all activities to database
    → Return complete workflow result
```

### Example 2: Direct Playwright Execution

```typescript
// Frontend: PlaywrightExecutionView.tsx
await playwrightApi.createExecution(data);
await playwrightApi.startExecution(executionId, data);

// Backend: POST /api/playwright/executions
Create PlaywrightExecution record

// Backend: POST /api/playwright/executions/:id/start
PlaywrightRunnerService.executeTest()
  → Execute steps
  → Capture evidence
  → Validate results
  → Generate report
  → Update database

// Frontend: Get results
const execution = await playwrightApi.getExecution(executionId);
const evidence = await playwrightApi.getEvidence(executionId);
const report = await playwrightApi.getExecutionReport(executionId);
```

## Key Features

1. **Separation of Concerns**: Each step is handled by a dedicated agent/service
2. **Database Persistence**: All steps are tracked in database
3. **API Compatibility**: Frontend APIs remain unchanged
4. **Modular Design**: Easy to add/modify individual steps
5. **Error Handling**: Each step can handle errors independently
6. **Progress Tracking**: WorkflowActivity table tracks each step
7. **Evidence Collection**: Screenshots, videos, traces captured automatically
8. **AI Integration**: OpenAI for intent parsing, optional AI for validation

## Status

- ✅ All required flow steps implemented
- ✅ All APIs working and unchanged
- ✅ Frontend compatibility maintained
- ✅ Database schema supports flow
- ⚠️ Optional Code Generator not implemented (can be added later)
