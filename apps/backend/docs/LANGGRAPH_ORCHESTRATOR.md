# LangGraph State Machine Orchestrator

## Overview

The `LangGraphOrchestrator` is a modern implementation of the test execution orchestrator using [LangGraph](https://github.com/langchain-ai/langgraph), a library for building stateful, multi-actor applications with LLMs.

## Why LangGraph?

The original `OrchestratorAgent` was a sequential workflow with limited error handling and state management. LangGraph provides:

✅ **Clear State Management**: Explicit state definitions with TypeScript types  
✅ **Conditional Routing**: Dynamic flow control based on intermediate results  
✅ **Error Recovery**: Built-in retry logic and error handling paths  
✅ **State Persistence**: Can save/restore execution state  
✅ **Visualization**: Graph structure can be visualized and debugged  
✅ **Parallel Execution**: Can execute independent nodes concurrently (future enhancement)  
✅ **Streaming**: Can stream intermediate results in real-time

## Architecture

### State Definition

The state flows through the graph and accumulates data at each node:

```typescript
interface TestFlowState {
  // Input
  input?: TestInput;

  // Agent outputs
  intent?: ParsedIntent;
  testPlan?: TestPlan;
  executionResult?: any;
  evidence?: any;
  differences?: any[];
  report?: any;

  // Flow tracking
  agentFlow: {
    intentParser: { completed: boolean; timestamp: string };
    testPlanner: { completed: boolean; timestamp: string };
    execution: { completed: boolean; timestamp: string };
    evidenceCollector: { completed: boolean; timestamp: string };
    diffValidation: { completed: boolean; timestamp: string };
    reportGenerator: { completed: boolean; timestamp: string };
  };

  // Error handling
  error?: string;
  retryCount: number;

  // Final output
  finalOutput?: TestOutput;
}
```

### Graph Structure

```
START
  ↓
parseIntent
  ↓ (conditional)
  ├─→ [error] ──→ handleError
  └─→ [continue] ──→ planTest
                      ↓ (conditional)
                      ├─→ [error] ──→ handleError
                      └─→ [continue] ──→ executeTest
                                          ↓ (conditional)
                                          ├─→ [error] ──→ handleError
                                          └─→ [continue] ──→ collectEvidence
                                                              ↓
                                                            validateDiff
                                                              ↓
                                                            generateReport
                                                              ↓
                                                            finalize
                                                              ↓
                                                            END

handleError
  ↓ (conditional)
  ├─→ [retry] ──→ parseIntent (loops back)
  └─→ [end] ──→ finalize
```

## Node Functions

Each node is responsible for one stage of the workflow:

### 1. `parseIntent`

- Analyzes user prompt to understand testing intent
- Extracts action, target, and parameters
- Updates: `state.intent`, `state.agentFlow.intentParser`

### 2. `planTest`

- Generates detailed test plan based on intent
- Creates step-by-step execution instructions
- Updates: `state.testPlan`, `state.agentFlow.testPlanner`

### 3. `executeTest`

- Runs Playwright automation following test plan
- Captures browser interactions
- Updates: `state.executionResult`, `state.agentFlow.execution`

### 4. `collectEvidence`

- Gathers screenshots, logs, videos
- Organizes execution artifacts
- Updates: `state.evidence`, `state.agentFlow.evidenceCollector`

### 5. `validateDiff`

- Compares current execution with history
- Identifies behavioral changes
- Updates: `state.differences`, `state.agentFlow.diffValidation`

### 6. `generateReport`

- Creates comprehensive test report
- Calculates confidence scores
- Provides suggested fixes
- Updates: `state.report`, `state.agentFlow.reportGenerator`

### 7. `handleError`

- Manages failures at any stage
- Implements retry logic
- Updates: `state.retryCount`

### 8. `finalize`

- Combines all results into final output
- Handles both success and error cases
- Updates: `state.finalOutput`

## Conditional Edges

Conditional edges enable dynamic routing based on state:

### `shouldContinueAfterIntent`

- ✅ **continue**: Intent parsed successfully
- ❌ **error**: Intent parsing failed or returned a question

### `shouldContinueAfterPlanning`

- ✅ **continue**: Valid test plan generated
- ❌ **error**: Planning failed or empty plan

### `shouldContinueAfterExecution`

- ✅ **continue**: Test executed
- ❌ **error**: Execution failed

### `shouldRetry`

- 🔄 **retry**: Retry count < max retries (2)
- 🛑 **end**: Max retries reached

## Usage

### Basic Usage

```typescript
import { LangGraphOrchestrator } from "./agents/LangGraphOrchestrator";

const orchestrator = new LangGraphOrchestrator(process.env.OPENAI_API_KEY);

const result = await orchestrator.executeTestFlow({
  prompt: "Test login on example.com",
  url: "https://example.com",
  options: {
    headless: false,
    screenshots: true,
  },
});

console.log("Result:", result);
```

### Advanced: Access Graph Directly

```typescript
const graph = orchestrator.getGraph();

// Stream execution events
for await (const event of graph.stream(initialState)) {
  console.log("Event:", event);
}
```

### Check Agent Health

```typescript
const status = orchestrator.getAgentStatus();
console.log("Agents ready:", status);
```

## Comparison: Original vs LangGraph

| Feature            | OrchestratorAgent | LangGraphOrchestrator     |
| ------------------ | ----------------- | ------------------------- |
| State Management   | Manual            | Automatic                 |
| Error Handling     | Try/catch only    | Retry logic + error paths |
| Flow Control       | Sequential        | Conditional routing       |
| Debugging          | Console logs      | Graph visualization       |
| Resumability       | None              | Built-in checkpointing    |
| Parallel Execution | No                | Possible                  |
| Type Safety        | Partial           | Full (Zod schemas)        |

## Benefits

### 1. **Better Error Recovery**

The original agent failed completely on any error. LangGraph can:

- Retry failed steps automatically
- Route to error handling paths
- Continue partial execution

### 2. **State Persistence**

Can save execution state and resume later:

```typescript
// Future enhancement
const checkpointer = new MemorySaver();
const graph = workflow.compile({ checkpointer });
```

### 3. **Real-time Streaming**

Stream intermediate results as they happen:

```typescript
for await (const chunk of graph.stream(input)) {
  console.log("Progress:", chunk);
}
```

### 4. **Conditional Logic**

Dynamic routing based on results:

- Skip steps if prerequisites fail
- Branch to different paths based on intent
- Retry specific nodes without restarting

### 5. **Observability**

Clear visibility into:

- Current state at any point
- Which nodes executed
- Why certain paths were taken
- Complete execution history

## Running the Example

```bash
cd apps/backend

# Set up environment
export OPENAI_API_KEY=your_key_here
export ANTHROPIC_API_KEY=your_key_here  # optional

# Run the test
npx ts-node test-langgraph-orchestrator.ts
```

## Future Enhancements

### Parallel Execution

Execute independent nodes concurrently:

```typescript
// Evidence collection and diff validation could run in parallel
workflow.addEdge("executeTest", "collectEvidence");
workflow.addEdge("executeTest", "validateDiff");
```

### Human-in-the-Loop

Add breakpoints for human approval:

```typescript
workflow.addNode("humanApproval", async (state) => {
  // Wait for human confirmation before checkout
  return await waitForApproval(state);
});
```

### Checkpointing

Save and resume long-running tests:

```typescript
import { MemorySaver } from "@langchain/langgraph";

const checkpointer = new MemorySaver();
const graph = workflow.compile({ checkpointer });

// Resume from checkpoint
const result = await graph.invoke(input, {
  configurable: { thread_id: "test-123" },
});
```

### Graph Visualization

Export graph structure for debugging:

```typescript
import { createReactFlowDiagram } from "@langchain/langgraph";

const diagram = createReactFlowDiagram(graph);
console.log(diagram);
```

## Migration Guide

To migrate from `OrchestratorAgent` to `LangGraphOrchestrator`:

### Before (OrchestratorAgent)

```typescript
import { OrchestratorAgent } from "./agents/OrchestratorAgent";

const orchestrator = new OrchestratorAgent(apiKey);
const result = await orchestrator.executeTestFlow(input);
```

### After (LangGraphOrchestrator)

```typescript
import { LangGraphOrchestrator } from "./agents/LangGraphOrchestrator";

const orchestrator = new LangGraphOrchestrator(apiKey);
const result = await orchestrator.executeTestFlow(input);
```

**The API is identical!** The migration is seamless.

## Troubleshooting

### Issue: Graph execution hangs

**Solution**: Check for infinite loops in conditional edges. Ensure `shouldRetry` has a max retry limit.

### Issue: State not updating

**Solution**: Nodes must return partial state updates. Verify each node returns an object matching `Partial<TestFlowState>`.

### Issue: Type errors

**Solution**: Ensure all state properties match the Zod schema definition in `TestFlowStateSchema`.

## References

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangGraph Conceptual Guide](https://langchain-ai.github.io/langgraph/concepts/)
- [Example: Agent Supervisor](https://langchain-ai.github.io/langgraph/tutorials/multi_agent/agent_supervisor/)
- [State Management](https://langchain-ai.github.io/langgraph/concepts/#state)

## License

Same as iBotTester main project.
