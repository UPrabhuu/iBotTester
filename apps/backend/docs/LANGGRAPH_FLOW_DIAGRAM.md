# LangGraph State Machine - Flow Diagram

## State Machine Graph Visualization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LANGGRAPH STATE MACHINE                          │
└─────────────────────────────────────────────────────────────────────────┘

                                  START
                                    │
                                    ▼
                         ┌──────────────────┐
                         │  parseIntent     │
                         │ (Parse user      │
                         │  prompt)         │
                         └────────┬─────────┘
                                  │
                        ┌─────────┴──────────┐
                        │                    │
                  [continue]             [error]
                        │                    │
                        ▼                    │
              ┌──────────────────┐           │
              │  planTest        │           │
              │ (Generate test   │           │
              │  plan)           │           │
              └────────┬─────────┘           │
                       │                     │
             ┌─────────┴──────────┐          │
             │                    │          │
       [continue]             [error]        │
             │                    │          │
             ▼                    │          │
   ┌──────────────────┐           │          │
   │  executeTest     │           │          │
   │ (Run Playwright) │           │          │
   └────────┬─────────┘           │          │
            │                     │          │
  ┌─────────┴──────────┐          │          │
  │                    │          │          │
[continue]         [error]        │          │
  │                    │          │          │
  ▼                    ├──────────┼──────────┘
┌──────────────────┐   │          │
│ collectEvidence  │   │          │
│ (Gather          │   │          │
│  screenshots,    │   │          │
│  logs)           │   │          │
└────────┬─────────┘   │          │
         │             │          │
         ▼             │          │
┌──────────────────┐   │          │
│  validateDiff    │   │          │
│ (Compare with    │   │          │
│  history)        │   │          │
└────────┬─────────┘   │          │
         │             │          │
         ▼             │          │
┌──────────────────┐   │          │
│ generateReport   │   │          │
│ (Create test     │   │          │
│  report)         │   │          │
└────────┬─────────┘   │          │
         │             │          │
         ▼             ▼          │
       ┌────────────────────┐     │
       │     finalize       │◄────┘
       │ (Combine results)  │◄────┐
       └──────────┬─────────┘     │
                  │                │
                  ▼                │
                 END               │
                                   │
                                   │
              ┌──────────────────┐ │
              │  handleError     │─┘
              │ (Retry logic)    │
              └────────┬─────────┘
                       │
              ┌────────┴────────┐
              │                 │
          [retry]            [end]
              │                 │
              └─────────────────┘
         (back to parseIntent)
```

## State Flow with Data Accumulation

```
Initial State:
{
  input: TestInput,
  agentFlow: { all false },
  retryCount: 0
}
        │
        ▼
After parseIntent:
{
  ...previousState,
  intent: ParsedIntent,              ◄── Added
  agentFlow.intentParser: true       ◄── Updated
}
        │
        ▼
After planTest:
{
  ...previousState,
  testPlan: TestPlan,                ◄── Added
  agentFlow.testPlanner: true        ◄── Updated
}
        │
        ▼
After executeTest:
{
  ...previousState,
  executionResult: TestResult,       ◄── Added
  agentFlow.execution: true          ◄── Updated
}
        │
        ▼
After collectEvidence:
{
  ...previousState,
  evidence: Evidence,                ◄── Added
  agentFlow.evidenceCollector: true  ◄── Updated
}
        │
        ▼
After validateDiff:
{
  ...previousState,
  differences: Diff[],               ◄── Added
  agentFlow.diffValidation: true     ◄── Updated
}
        │
        ▼
After generateReport:
{
  ...previousState,
  report: Report,                    ◄── Added
  agentFlow.reportGenerator: true    ◄── Updated
}
        │
        ▼
After finalize:
{
  ...previousState,
  finalOutput: TestOutput            ◄── Final result
}
```

## Conditional Routing Logic

### Intent Parsing Decision

```
parseIntent
    │
    ├─→ Has error? ──────────────────→ handleError
    ├─→ Has question from user? ─────→ handleError
    └─→ Valid intent ────────────────→ planTest
```

### Test Planning Decision

```
planTest
    │
    ├─→ Has error? ──────────────────→ handleError
    ├─→ Empty test plan? ────────────→ handleError
    └─→ Valid plan with steps ───────→ executeTest
```

### Execution Decision

```
executeTest
    │
    ├─→ Execution failed? ───────────→ handleError
    ├─→ No execution result? ────────→ handleError
    └─→ Execution completed ─────────→ collectEvidence
```

### Error Handling Decision

```
handleError
    │
    ├─→ retryCount < 2 ──────────────→ retry from parseIntent
    └─→ retryCount >= 2 ─────────────→ finalize (fail)
```

## Parallel Execution (Future Enhancement)

```
                executeTest
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
  collectEvidence         validateDiff
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
              generateReport
```

## State Persistence (Future Enhancement)

```
┌─────────────────────────────────────────┐
│        Execution with Checkpoints       │
└─────────────────────────────────────────┘

parseIntent ──► [Checkpoint 1] ──► planTest ──► [Checkpoint 2]
                                                      │
                                    ┌─────────────────┘
                                    │
                                    ▼
                            executeTest ──► [Checkpoint 3]
                                    │
                    ╔═══════════════╧════════════════╗
                    ║  FAILURE - Resume from         ║
                    ║  Checkpoint 3 instead of       ║
                    ║  restarting from beginning     ║
                    ╚════════════════════════════════╝
```

## Error Flow Example

```
Scenario: Execution fails on first attempt

START
  ↓
parseIntent (success) ─── state.intent = {...}
  ↓
planTest (success) ───── state.testPlan = {...}
  ↓
executeTest (FAIL) ───── state.error = "Browser crashed"
  ↓
handleError ──────────── state.retryCount = 1
  ↓
[retry: retryCount < 2]
  ↓
parseIntent (success) ─── Uses cached state.input
  ↓
planTest (success) ───── Uses cached state.intent
  ↓
executeTest (success) ─── state.executionResult = {...}
  ↓
collectEvidence ──────── state.evidence = {...}
  ↓
validateDiff ─────────── state.differences = [...]
  ↓
generateReport ───────── state.report = {...}
  ↓
finalize ─────────────── state.finalOutput = {...}
  ↓
END
```

## Benefits Over Original Sequential Flow

### Original OrchestratorAgent

```
┌────────────────────────────────────────────┐
│  One long try-catch block                  │
│                                            │
│  Step 1 ──► Step 2 ──► Step 3 ──► Step 4  │
│                                            │
│  Any failure = complete restart            │
└────────────────────────────────────────────┘
```

### LangGraph Orchestrator

```
┌────────────────────────────────────────────┐
│  Granular error handling at each node      │
│                                            │
│  Node 1 ──► Node 2 ──► Node 3 ──► Node 4  │
│    │          │          │          │      │
│  [✓|✗]     [✓|✗]     [✓|✗]     [✓|✗]     │
│    │          │          │          │      │
│    └──────────┴──────────┴──────────┘      │
│              │                             │
│         Error Handler                      │
│         (with retry)                       │
└────────────────────────────────────────────┘
```

## Node Execution Timeline

```
Time ──────────────────────────────────────────────────►

T0:   START
T1:   parseIntent begins
T2:   parseIntent completes (250ms)
T3:   planTest begins
T4:   planTest completes (1500ms)
T5:   executeTest begins
T6:   executeTest completes (5000ms)
T7:   collectEvidence begins
T8:   collectEvidence completes (100ms)
T9:   validateDiff begins
T10:  validateDiff completes (300ms)
T11:  generateReport begins
T12:  generateReport completes (800ms)
T13:  finalize begins
T14:  finalize completes (50ms)
T15:  END

Total: ~8000ms
```

## State Inspection at Each Step

You can inspect state at any point:

```typescript
for await (const step of graph.stream(initialState)) {
  console.log("Current node:", step);
  console.log("Current state:", step);

  // State structure:
  // {
  //   parseIntent: { intent: {...}, agentFlow: {...} },
  //   planTest: { testPlan: {...}, agentFlow: {...} },
  //   ...
  // }
}
```
