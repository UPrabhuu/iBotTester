# LangGraph Orchestrator Mapping Documentation

## Overview

The **IntentGraphOrchestrator** provides a complete mapping from `ParsedIntent` (IntentParserAgent output) to executable LangGraph workflows.

---

## Architecture

```
User Prompt
    ↓
IntentParserAgent.parseIntent()
    ↓
ParsedIntent Object
    ↓
LangGraph Workflow
    ↓
GraphState (Execution Result)
```

---

## ParsedIntent → Node Mapping

### Primary Actions → Graph Nodes

| Primary Action  | Graph Node          | Secondary Nodes Triggered                                                     | Risk Level  |
| --------------- | ------------------- | ----------------------------------------------------------------------------- | ----------- |
| `CREATE`        | `create_test`       | generate_data, heal_locators, validate_outcomes, report_evidence, audit       | LOW         |
| `CREATE_BULK`   | `create_bulk_tests` | generate_data, heal_locators, validate_outcomes, report_evidence, audit       | MEDIUM-HIGH |
| `UPDATE`        | `update_test`       | heal_locators, validate_outcomes, report_evidence, audit                      | LOW-MEDIUM  |
| `DELETE`        | `delete_test`       | audit                                                                         | HIGH        |
| `DELETE_BULK`   | `delete_bulk_tests` | audit                                                                         | CRITICAL    |
| `RUN`           | `run_test`          | retry_intelligently, heal_locators, validate_outcomes, report_evidence, audit | LOW         |
| `RUN_BULK`      | `run_bulk_tests`    | retry_intelligently, heal_locators, validate_outcomes, report_evidence, audit | MEDIUM      |
| `SCHEDULE`      | `schedule_test`     | report_evidence, audit                                                        | LOW         |
| `ORGANIZE`      | `organize_tests`    | audit                                                                         | LOW         |
| `PAUSE_AND_ASK` | `pause_and_ask`     | -                                                                             | VARIABLE    |

---

## Workflow Execution Flow

### 1. Standard Flow (No Intervention)

```
START
  ↓
parse_intent (ParsedIntent created)
  ↓
validate_security (Risk assessment)
  ↓
route_action (Conditional routing)
  ↓
[Primary Action Node]
  ↓
audit (Complete audit trail)
  ↓
finalize (Aggregate results)
  ↓
END
```

### 2. PAUSE_AND_ASK Flow

```
START
  ↓
parse_intent
  ↓
validate_security
  ↓
pause_and_ask (Requires user input)
  ↓
END (status: 'paused')
  ↓
[User provides response]
  ↓
resume() (Continue workflow)
  ↓
[Primary Action Node]
  ↓
audit
  ↓
finalize
  ↓
END (status: 'completed')
```

### 3. Error Flow

```
START
  ↓
parse_intent
  ↓
[Error occurs]
  ↓
handle_error
  ↓
END (status: 'failed')
```

---

## GraphState Structure

### Input State

```typescript
{
  userPrompt: string; // Original user input
  parsedIntent: ParsedIntent; // Agent output
  currentAction: PrimaryAction;
  currentStep: string;
}
```

### Execution State

```typescript
{
  testDefinitions: any[];          // Created tests
  testResults: any[];              // Execution results
  executionLogs: string[];         // Step-by-step logs
  errors: string[];                // Error tracking
  retryCount: number;
}
```

### Control Flow State

```typescript
{
  requiresUserInput: boolean;
  userQuestion: string | null;
  userResponse: string | null;
}
```

### Output State

```typescript
{
  finalResult: {
    action: PrimaryAction;
    testsCreated: number;
    testsExecuted: number;
    passed: number;
    failed: number;
    auditTrail: AuditEntry[];
    executionLogs: string[];
    errors: string[];
  };
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused';
}
```

---

## Conditional Edge Routing

### shouldRouteOrPause()

**Decision Logic:**

```
IF primaryAction === PAUSE_AND_ASK → pause
ELSE IF question exists → pause
ELSE IF riskLevel === CRITICAL AND no userResponse → pause
ELSE → route
```

**Output:**

- `pause` → Go to `pause_and_ask` node
- `route` → Go to `route_action` node
- `error` → Go to `handle_error` node

### routePrimaryAction()

**Decision Logic:**
Simply returns the `primaryAction` value which is used to route to the appropriate handler node.

---

## Node Implementations

### parse_intent

**Input:** `userPrompt`
**Output:** `parsedIntent`, `currentAction`, `executionLogs`
**Action:** Calls `IntentParserAgent.parseIntent()`

### validate_security

**Input:** `parsedIntent`
**Output:** `auditTrail`, `executionLogs`
**Action:** Validates security constraints, logs audit entry

### create_test

**Input:** `parsedIntent.args`
**Output:** `testDefinitions`, `auditTrail`, `executionLogs`
**Action:** Creates single test definition

### create_bulk_tests

**Input:** `parsedIntent.args.testCount` or `testNames`
**Output:** `testDefinitions[]`, `auditTrail`, `executionLogs`
**Action:** Creates multiple test definitions in loop

### update_test

**Input:** `parsedIntent.args`, `parsedIntent.updateScope`
**Output:** `auditTrail`, `executionLogs`
**Action:** Updates test based on scope (TEST, PAGE, STEP, etc.)

### delete_test

**Input:** `parsedIntent.args.testId`
**Output:** `auditTrail`, `executionLogs`
**Action:** Deletes single test (HIGH risk audit)

### delete_bulk_tests

**Input:** `parsedIntent.args.testIds` or `testNames`
**Output:** `auditTrail`, `executionLogs`
**Action:** Deletes multiple tests (CRITICAL risk audit)

### run_test

**Input:** `parsedIntent.args.testId`
**Output:** `testResults`, `executionLogs`
**Action:** Executes single test, records result

### run_bulk_tests

**Input:** `parsedIntent.args.testNames`, `maxConcurrency`
**Output:** `testResults[]`, `executionLogs`
**Action:** Executes multiple tests, respects concurrency limits

### schedule_test

**Input:** `parsedIntent.args.schedule`, `timezone`
**Output:** `auditTrail`, `executionLogs`
**Action:** Creates scheduled test execution

### audit

**Input:** All state
**Output:** `auditTrail`, `executionLogs`
**Action:** Finalizes complete audit trail with summary

### pause_and_ask

**Input:** `parsedIntent.question`
**Output:** `requiresUserInput`, `userQuestion`, `status: 'paused'`
**Action:** Pauses workflow, requests user input

### finalize

**Input:** All state
**Output:** `finalResult`, `status: 'completed'`
**Action:** Aggregates all results, marks workflow complete

---

## Example Mappings

### Example 1: Simple Creation

```
Prompt: "create a login test"
    ↓
ParsedIntent: {
  primaryAction: CREATE,
  args: { testName: "login test" }
}
    ↓
Graph Flow: parse_intent → validate_security → route_action → create_test → audit → finalize
    ↓
Result: {
  status: 'completed',
  testsCreated: 1,
  auditTrail: [3 entries]
}
```

### Example 2: Bulk Execution

```
Prompt: "run tests [login, checkout, payment] in parallel"
    ↓
ParsedIntent: {
  primaryAction: RUN_BULK,
  args: {
    testNames: ["login", "checkout", "payment"],
    parallelExecution: true
  },
  isBulkOperation: true
}
    ↓
Graph Flow: parse_intent → validate_security → route_action → run_bulk_tests → audit → finalize
    ↓
Result: {
  status: 'completed',
  testsExecuted: 3,
  passed: 2,
  failed: 1
}
```

### Example 3: PAUSE_AND_ASK

```
Prompt: "update test"
    ↓
ParsedIntent: {
  primaryAction: PAUSE_AND_ASK,
  question: "Which test and what exactly should be updated?"
}
    ↓
Graph Flow: parse_intent → validate_security → pause_and_ask → END
    ↓
Result: {
  status: 'paused',
  requiresUserInput: true,
  userQuestion: "Which test..."
}
```

### Example 4: High-Risk Operation

```
Prompt: "delete 100 tests in production"
    ↓
ParsedIntent: {
  primaryAction: DELETE_BULK,
  args: {
    testCount: 100,
    environment: 'PROD'
  },
  estimatedImpact: {
    affectedTests: 100,
    riskLevel: 'CRITICAL'
  }
}
    ↓
Graph Flow: parse_intent → validate_security → pause_and_ask (auto-triggered)
    ↓
Result: {
  status: 'paused',
  userQuestion: "You are about to affect 100 tests..."
}
```

---

## Audit Trail

Every operation creates audit entries with:

```typescript
{
  timestamp: number;
  action: string;
  actor: string;
  details: any;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
```

### Audit Entry Examples

**Test Creation:**

```json
{
  "timestamp": 1704150000000,
  "action": "create_test",
  "actor": "system",
  "details": {
    "id": "test_1704150000000",
    "name": "login test"
  },
  "riskLevel": "LOW"
}
```

**Bulk Deletion:**

```json
{
  "timestamp": 1704150000000,
  "action": "delete_bulk_tests",
  "actor": "system",
  "details": {
    "count": 50,
    "testIds": ["test_1", "test_2", ...]
  },
  "riskLevel": "CRITICAL"
}
```

---

## Usage Patterns

### Basic Execution

```typescript
import { executeWorkflow } from "./IntentGraphOrchestrator";

const result = await executeWorkflow("create a test", apiKey);
console.log(result.status);
```

### Advanced Orchestration

```typescript
import { createOrchestrator } from "./IntentGraphOrchestrator";

const orchestrator = createOrchestrator(apiKey);
const result = await orchestrator.execute("update test");

if (result.requiresUserInput) {
  const resumed = await orchestrator.resume(result, "login test");
  console.log(resumed.finalResult);
}
```

### Batch Processing

```typescript
const agent = new IntentParserAgent(apiKey);
const intents = await agent.parseIntentBatch([
  "create test 1",
  "create test 2",
  "create test 3",
]);

// Process each intent through workflow
for (const intent of intents) {
  const orchestrator = createOrchestrator(apiKey);
  await orchestrator.execute(intent.userPrompt);
}
```

---

## Performance Characteristics

| Operation         | Avg Time      | Caching Impact | Concurrency                |
| ----------------- | ------------- | -------------- | -------------------------- |
| parse_intent      | 200-500ms     | -90% (cached)  | N/A                        |
| create_test       | 10-50ms       | N/A            | Sequential                 |
| create_bulk_tests | 50-200ms      | N/A            | Sequential                 |
| run_test          | 1-5s          | N/A            | Sequential                 |
| run_bulk_tests    | 1-5s per test | N/A            | Parallel (max concurrency) |
| audit             | 5-10ms        | N/A            | Sequential                 |

---

## Error Handling

### Retry Logic

Built into `run_test` and `run_bulk_tests` nodes via `RETRY_INTELLIGENTLY` secondary action.

### Graceful Degradation

If OpenAI API fails, falls back to rule-based parsing with lower confidence scores.

### Error State

All errors are captured in `GraphState.errors[]` and logged to `executionLogs`.

---

## Security Features

1. **Risk Assessment**: Every operation evaluated for risk level
2. **Critical Operation Pause**: >100 tests or PROD environment triggers confirmation
3. **Audit Trail**: Complete traceable history of all actions
4. **Role-Based Execution**: Actor field tracks who initiated each action
5. **Evidence Requirements**: Reporting mandatory for enterprise operations

---

## Extension Points

### Adding New Nodes

```typescript
workflow.addNode("custom_node", this.customNode.bind(this));
workflow.addEdge("some_node", "custom_node");
```

### Custom Conditional Routing

```typescript
workflow.addConditionalEdges("route_action", this.customRouter.bind(this), {
  option1: "node1",
  option2: "node2",
});
```

### Adding Secondary Actions

Update `attachSecondaryActions()` mapping in IntentParserAgent.

---

## Integration with Existing Systems

### With Execution Engine

```typescript
const result = await orchestrator.execute("run test");
result.testResults.forEach((test) => {
  executionEngine.execute(test);
});
```

### With Reporting System

```typescript
if (result.parsedIntent?.args.reporting?.email) {
  reportingService.sendEmail(
    result.finalResult,
    result.parsedIntent.args.reporting.emailRecipients
  );
}
```

### With Database

```typescript
await db.tests.createMany(result.testDefinitions);
await db.auditLog.createMany(result.auditTrail);
```

---

## Best Practices

1. **Always check `requiresUserInput`** before assuming workflow completed
2. **Use bulk operations** for >5 similar actions to improve performance
3. **Enable caching** for repeated prompt patterns
4. **Monitor audit trail** for security and compliance
5. **Set appropriate `maxConcurrency`** for bulk operations to manage resources
6. **Validate `riskLevel`** before auto-approving operations
7. **Handle `paused` status** by implementing user input flows

---

## Summary

The LangGraph Orchestrator provides:
✅ **Structured Workflows** - ParsedIntent → Executable Graph
✅ **Error Handling** - Retry, fallback, error nodes
✅ **Security** - Risk assessment, audit trails, confirmations
✅ **Scalability** - Bulk operations, parallel execution
✅ **Observability** - Complete execution logs and audit trail
✅ **Flexibility** - Conditional routing, pause/resume support
