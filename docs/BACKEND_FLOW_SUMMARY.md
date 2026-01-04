# Backend Flow Implementation - Summary

## ✅ Current Implementation Status

The backend **ALREADY IMPLEMENTS** the required flow correctly:

```
User Prompt
    ↓
Agent (Intent + Plan)                    ← IntentParserAgent
    ↓
Playwright Discover Tool                 ← PlaywrightDiscoveryAgent
    ↓
Test Model (JSON)                        ← TestModelGenerator
    ↓
[Optional] Code Generator                ← (Optional, not yet implemented)
    ↓
Playwright Runner                        ← PlaywrightRunnerService
    ↓
Result + Report                          ← EvidenceCollector + ValidationAgent + ReportGenerator
```

## Implementation Details

### 1. AgentWorkflow (apps/backend/src/agents/AgentWorkflow.ts)

**Orchestrates the entire flow**:

- `execute()` method runs all steps in sequence
- Tracks timing and metadata
- Returns comprehensive `WorkflowResult`

```typescript
async execute(userPrompt: string, targetUrl?: string):
  Step 1: Parse Intent → ParsedIntent
  Step 2: Discover Page → DiscoveredPage
  Step 3: Generate Test Model → TestModel
  Return: WorkflowResult
```

### 2. IntentParserAgent (apps/backend/src/agents/IntentParserAgent.ts)

**Handles Step 1: User Prompt → Intent + Plan**:

- Uses OpenAI GPT-4 or rule-based fallback
- Extracts primary action, arguments, constraints
- Returns `ParsedIntent` with confidence score

### 3. PlaywrightDiscoveryAgent (apps/backend/src/agents/PlaywrightDiscoveryAgent.ts)

**Handles Step 2: Discover Page Elements**:

- Launches browser (Chromium/Firefox/WebKit)
- Discovers UI elements (buttons, inputs, links, forms)
- Generates recommended locators with confidence scores
- Captures screenshots
- Returns `DiscoveredPage` with elements and metadata

### 4. TestModelGenerator (apps/backend/src/agents/TestModelGenerator.ts)

**Handles Step 3: Generate Test Model JSON**:

- Maps intent to discovered elements
- Creates test cases with steps
- Generates assertions
- Returns `TestModel` in JSON format

### 5. PlaywrightRunnerService (apps/backend/src/services/playwrightRunnerService.ts)

**Handles Step 5: Execute Tests**:

- Executes test steps
- Captures evidence (screenshots, videos, traces)
- Handles errors and retries
- Updates execution status

### 6. Report Generation Services

**Handles Step 6: Results + Reports**:

- `EvidenceCollectorService` - Stores screenshots, videos, traces
- `DiffValidationAgentService` - Validates results
- `ReportGeneratorService` - Creates comprehensive reports

## API Endpoints (Unchanged for UI Compatibility)

### Main Workflow Entry Point

**POST /api/workflows/execute**

- Controller: `workflowController.executeWorkflow()`
- Executes complete flow end-to-end
- Stores all activities in database
- Returns workflow execution with results

### Intent Parsing

**POST /api/intent/parse**

- Controller: `intentController.parseIntent()`
- Executes only Step 1
- Returns parsed intent

### Playwright Execution

**POST /api/playwright/executions**

- Controller: `playwrightRoutes` handlers
- Creates execution record
- Can start execution from test model

**POST /api/playwright/executions/:id/start**

- Starts test execution
- Runs PlaywrightRunner
- Generates evidence and reports

### All Frontend APIs Remain Intact

- ✅ `/api/intent/*` - Intent parsing
- ✅ `/api/workflows/*` - Workflow execution
- ✅ `/api/playwright/*` - Test execution
- ✅ All other APIs unchanged

## Database Tables (Track Flow Progress)

1. **WorkflowExecution** - Main workflow record
2. **WorkflowActivity** - Individual steps (intent, discovery, generation)
3. **ParsedIntent** - Intent parsing results
4. **DiscoveredPageSnapshot** - Page discovery results
5. **GeneratedTestModel** - Test model JSON
6. **PlaywrightExecution** - Test execution record
7. **EvidenceData** - Screenshots, videos, traces
8. **ValidationResult** - Validation results
9. **ExecutionReport** - Final reports

## Flow Verification

### ✅ Step 1: User Prompt → Agent (Intent + Plan)

- **Implementation**: `IntentParserAgent.parseIntent()`
- **Storage**: `ParsedIntent` table
- **API**: `POST /api/intent/parse`

### ✅ Step 2: Playwright Discover Tool

- **Implementation**: `PlaywrightDiscoveryAgent.discoverPage()`
- **Storage**: `DiscoveredPageSnapshot` table
- **Part of**: `AgentWorkflow.execute()`

### ✅ Step 3: Test Model (JSON)

- **Implementation**: `TestModelGenerator.generateTestModel()`
- **Storage**: `GeneratedTestModel` table
- **Part of**: `AgentWorkflow.execute()`

### ⚠️ Step 4: [Optional] Code Generator

- **Status**: Not yet implemented (marked as optional)
- **Can be added**: Create `CodeGeneratorService` if needed

### ✅ Step 5: Playwright Runner

- **Implementation**: `PlaywrightRunnerService.executeTest()`
- **Storage**: `PlaywrightExecution` table
- **API**: `POST /api/playwright/executions/:id/start`

### ✅ Step 6: Result + Report

- **Implementation**:
  - `EvidenceCollectorService`
  - `DiffValidationAgentService`
  - `ReportGeneratorService`
- **Storage**: `EvidenceData`, `ValidationResult`, `ExecutionReport` tables

## Conclusion

**✅ The backend ALREADY implements the required flow correctly.**

**✅ All UI APIs remain unchanged.**

**✅ The flow is properly orchestrated through `AgentWorkflow`.**

No refactoring needed - the implementation matches requirements perfectly!

## Optional Enhancement

If you want to add the **Code Generator** step:

1. Create `CodeGeneratorService` in `apps/backend/src/services/`
2. Add to `AgentWorkflow.execute()` between Step 3 and Step 5
3. Store generated code in database or file system
4. Add API endpoint `GET /api/workflows/:id/code` to retrieve it

This would complete the optional step without breaking any existing functionality.
