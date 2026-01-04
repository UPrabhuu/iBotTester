# iBotTester Backend Flow Architecture

## Required Backend Flow

```
User Prompt
    ↓
Agent (Intent + Plan)
    ↓
Playwright Discover Tool (follow plan, discover selectors/UI changes, update plan)
    ↓
Test Model (JSON)
    ↓
[Optional] Code Generator + Store Playwright Code
    ↓
Playwright Runner (execute test)
    ↓
Result + Report (status + logs + screenshots + video)
```

## Flow Components

### 1. User Prompt → Agent (Intent + Plan)

- **Entry Point**: `/api/intent/parse` or `/api/workflows/execute`
- **Agent**: `IntentParserAgent`
- **Output**: `ParsedIntent` with primary action, args, confidence
- **Storage**: `ParsedIntent` table

### 2. Agent → Playwright Discover Tool

- **Agent**: `PlaywrightDiscoveryAgent`
- **Input**: URL from intent or user input
- **Actions**:
  - Launch browser (chromium/firefox/webkit)
  - Navigate to target URL
  - Discover UI elements (buttons, inputs, links, forms)
  - Generate recommended locators with confidence scores
  - Capture screenshots
- **Output**: `DiscoveredPage` with elements, locators, metadata
- **Storage**: `DiscoveredPageSnapshot` table

### 3. Discover Tool → Test Model (JSON)

- **Agent**: `TestModelGenerator`
- **Input**: `ParsedIntent` + `DiscoveredPage`
- **Actions**:
  - Map intent actions to discovered elements
  - Generate test cases with steps
  - Create assertions based on expected outcomes
  - Estimate execution time
- **Output**: `TestModel` JSON with test cases, steps, configuration
- **Storage**: `GeneratedTestModel` table

### 4. [Optional] Code Generator + Store

- **Service**: `CodeGeneratorService` (to be implemented if needed)
- **Input**: `TestModel`
- **Output**: Executable Playwright code
- **Storage**: File system or database

### 5. Test Model → Playwright Runner

- **Service**: `PlaywrightRunnerService`
- **Input**: Test steps from `TestModel`
- **Actions**:
  - Execute test steps sequentially
  - Handle errors and retries
  - Capture evidence (screenshots, videos, traces)
- **Output**: Execution results
- **Storage**: `PlaywrightExecution` table

### 6. Playwright Runner → Result + Report

- **Services**:
  - `EvidenceCollectorService` - screenshots, videos, traces
  - `DiffValidationAgentService` - validation results
  - `ReportGeneratorService` - comprehensive report
- **Output**: Complete test execution report
- **Storage**:
  - `EvidenceData` table
  - `ValidationResult` table
  - `ExecutionReport` table

## API Endpoints (Keep Unchanged for Frontend Compatibility)

### Intent API

- `POST /api/intent/parse` - Parse user prompt
- `GET /api/intent/history` - Get intent history

### Workflow API (Main Entry Point)

- `POST /api/workflows/execute` - Execute complete flow
- `GET /api/workflows` - List workflows
- `GET /api/workflows/:id` - Get workflow details
- `GET /api/workflows/:id/activities` - Get activities
- `GET /api/workflows/:id/test-model` - Get test model
- `GET /api/workflows/:id/discovery` - Get discovery snapshot

### Playwright Execution API

- `POST /api/playwright/executions` - Create execution
- `POST /api/playwright/executions/:id/start` - Start execution
- `GET /api/playwright/executions/:id` - Get execution
- `GET /api/playwright/executions` - List executions
- `GET /api/playwright/executions/:id/evidence` - Get evidence
- `GET /api/playwright/executions/:id/validation` - Get validation
- `GET /api/playwright/executions/:id/report` - Get report

## Workflow Orchestration

The `AgentWorkflow` class orchestrates the entire flow:

1. **Initialize** agents and services
2. **Execute** workflow steps in sequence
3. **Track** progress in `WorkflowExecution` and `WorkflowActivity` tables
4. **Return** results to caller

All API endpoints remain unchanged to ensure UI compatibility.
