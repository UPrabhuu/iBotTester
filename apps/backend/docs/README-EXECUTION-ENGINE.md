# Playwright Execution Engine for iBotTester

## Overview

The **Playwright Execution Engine** is a robust, production-ready automation engine that executes JSON-based test plans using Playwright. It provides autonomous browser testing with built-in retry logic, screenshot/video capture, self-healing element location, and structured result reporting.

## Features

✅ **JSON Test Plans** - Define tests declaratively using JSON  
✅ **Sequential Execution** - Steps execute in order with proper error handling  
✅ **Screenshot Capture** - Automatic screenshots after each step  
✅ **Video Recording** - Optional full-session video recording  
✅ **Retry Logic** - Configurable retry policies per step  
✅ **Self-Healing** - Intelligent element location with multiple fallback strategies  
✅ **Safety Constraints** - Stops before final checkout to prevent real payments  
✅ **Progress Tracking** - Real-time execution progress callbacks  
✅ **Structured Results** - Comprehensive JSON output with evidence and metrics  

## Architecture

```
src/engine/
├── PlaywrightExecutionEngine.ts  # Main execution engine
├── types.ts                       # TypeScript type definitions
└── index.ts                       # Public API exports

examples/
├── basic-test-plan.json           # Simple navigation test
├── ecommerce-test-plan.json       # E-commerce workflow test
├── form-test-plan.json            # Form submission test
└── run-execution-engine.ts        # Usage examples
```

## Installation

The execution engine is already included in the iBotTester backend. No additional installation required.

```bash
# Install dependencies (if not already done)
cd apps/backend
npm install
npx playwright install chromium
```

## Quick Start

### 1. Create a Test Plan (JSON)

```json
{
  "testId": "my-test-001",
  "name": "My First Test",
  "description": "A simple test example",
  "steps": [
    {
      "step": 1,
      "action": "navigate",
      "url": "https://example.com",
      "description": "Navigate to website"
    },
    {
      "step": 2,
      "action": "validate",
      "rule": "page loaded successfully"
    }
  ],
  "createdAt": "2025-12-30T19:00:00.000Z"
}
```

### 2. Execute the Test Plan

```typescript
import { PlaywrightExecutionEngine } from './src/engine';
import * as fs from 'fs';

// Load test plan
const testPlan = JSON.parse(fs.readFileSync('test-plan.json', 'utf-8'));

// Create engine
const engine = new PlaywrightExecutionEngine({
  headless: true,
  screenshots: true,
  recordVideo: false
});

// Execute
const result = await engine.executeTestPlan(testPlan);

// Check results
console.log(result.status);  // 'PASS' | 'FAIL' | 'PARTIAL'
console.log(result.summary);
```

## Test Plan Format

### Complete Test Plan Schema

```typescript
interface TestPlan {
  testId: string;           // Unique identifier
  name: string;             // Human-readable name
  description?: string;     // Optional description
  steps: TestStep[];        // Array of test steps
  createdAt: string;        // ISO timestamp
  metadata?: object;        // Optional metadata
}
```

### Test Step Schema

```typescript
interface TestStep {
  step: number;             // Step number (execution order)
  action: StepAction;       // Action to perform
  description?: string;     // Step description
  target?: string;          // Target element
  url?: string;             // URL for navigation
  query?: string;           // Search query
  rule?: string;            // Validation rule
  value?: string;           // Value to type/select
  retryPolicy?: {
    maxRetries: number;     // Max retry attempts
    timeout: number;        // Timeout per attempt (ms)
    retryDelay?: number;    // Delay between retries (ms)
  };
  critical?: boolean;       // Stop on failure if true
}
```

## Supported Actions

| Action | Description | Required Fields | Example |
|--------|-------------|----------------|---------|
| `navigate` | Navigate to URL | `url` | Navigate to homepage |
| `click` | Click element | `target` | Click "Login" button |
| `type` | Type text | `target`, `value` | Enter email address |
| `search` | Search using search box | `query` | Search for "laptop" |
| `validate` | Validate condition | `rule` | Check page loaded |
| `wait` | Wait for time | `value` (ms) | Wait 2000ms |
| `add_to_cart` | Add to cart | - | Add product to cart |
| `proceed_to_checkout` | Go to checkout | - | Proceed to checkout |
| `select` | Select dropdown option | `target`, `value` | Select country |
| `hover` | Hover over element | `target` | Hover over menu |
| `scroll` | Scroll page | `value` (pixels) | Scroll down 500px |
| `screenshot` | Take screenshot | - | Capture current view |

## Configuration Options

```typescript
interface ExecutionEngineOptions {
  headless?: boolean;              // Default: true
  screenshots?: boolean;           // Default: true
  recordVideo?: boolean;           // Default: false
  videoDir?: string;               // Default: './test-results/videos'
  screenshotDir?: string;          // Default: './test-results/screenshots'
  viewportWidth?: number;          // Default: 1280
  viewportHeight?: number;         // Default: 720
  slowMo?: number;                 // Default: 0
  enableConsoleLogging?: boolean;  // Default: true
}
```

## Execution Results

### Result Schema

```typescript
interface TestExecutionResult {
  testId: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL' | 'ERROR';
  steps: StepResult[];
  evidence: {
    screenshots: string[];     // Base64 or file paths
    video?: string;            // Video file path
    logs: string[];            // Execution logs
    consoleLogs?: string[];    // Browser console logs
  };
  diff: FlowDifference[];
  summary: string;
  duration?: number;           // Total duration (ms)
  startTime?: string;          // ISO timestamp
  endTime?: string;            // ISO timestamp
}
```

### Step Result Schema

```typescript
interface StepResult {
  step: number;
  status: 'PASS' | 'FAIL' | 'SKIPPED';
  action: string;
  timestamp: string;
  screenshot?: string;
  error?: string;
  duration?: number;
  retryAttempts?: number;
  fallbackUsed?: boolean;
}
```

## Advanced Usage

### Progress Tracking

```typescript
const engine = new PlaywrightExecutionEngine(options);

// Track execution progress
engine.onProgress((progress) => {
  console.log(`Step ${progress.currentStep}/${progress.totalSteps}: ${progress.action}`);
});

// Track execution events
engine.onEvent((event) => {
  console.log(`Event: ${event.type} at ${event.timestamp}`);
});

const result = await engine.executeTestPlan(testPlan);
```

### Custom Retry Policies

```json
{
  "step": 3,
  "action": "click",
  "target": "Submit",
  "retryPolicy": {
    "maxRetries": 5,
    "timeout": 20000,
    "retryDelay": 2000
  }
}
```

### Video Recording

```typescript
const engine = new PlaywrightExecutionEngine({
  headless: true,
  recordVideo: true,
  videoDir: './my-videos'
});

const result = await engine.executeTestPlan(testPlan);
console.log('Video saved at:', result.evidence.video);
```

## Self-Healing Element Location

The engine uses multiple strategies to locate elements:

1. **Exact text match** - `text="Login"`
2. **Partial text match** - `text=/log.*in/i`
3. **CSS selector** - `#login-button`
4. **Role attribute** - `[role="button"]`
5. **Common patterns** - Specific patterns for search, cart, checkout buttons

This allows tests to adapt to minor UI changes automatically.

## Safety Constraints

### Checkout Prevention

The engine automatically detects and stops before final checkout steps to prevent:
- Real payment processing
- Actual order placement
- Unwanted purchases

Detection criteria:
- Steps with `proceed_to_checkout` action
- Steps near the end with checkout-related keywords
- Steps mentioning payment, "pay now", or "complete order"

## Examples

See the `examples/` directory for complete working examples:

1. **basic-test-plan.json** - Simple website navigation
2. **ecommerce-test-plan.json** - Product search and cart
3. **form-test-plan.json** - Form submission workflow
4. **run-execution-engine.ts** - Executable examples

### Running Examples

```bash
cd apps/backend

# Run basic example
npx ts-node examples/run-execution-engine.ts

# Or import and run specific examples
npx ts-node -e "require('./examples/run-execution-engine').runBasicTest()"
```

## Integration with Existing Code

The engine integrates seamlessly with existing iBotTester services:

```typescript
// In your controller or service
import { PlaywrightExecutionEngine } from '../engine';

async function executeTest(testPlan: TestPlan) {
  const engine = new PlaywrightExecutionEngine({
    headless: true,
    screenshots: true,
    recordVideo: true
  });
  
  return await engine.executeTestPlan(testPlan);
}
```

## Error Handling

The engine provides comprehensive error handling:

- **Step-level errors** - Captured in `StepResult.error`
- **Retry logic** - Automatic retries with configurable policies
- **Critical failures** - Stops execution on critical step failures
- **Cleanup** - Always cleans up browser resources

```typescript
try {
  const result = await engine.executeTestPlan(testPlan);
  
  if (result.status === 'FAIL') {
    console.error('Test failed:', result.summary);
    // Handle failure
  }
} catch (error) {
  console.error('Execution error:', error);
  // Handle error
}
```

## Best Practices

1. **Use descriptive step descriptions** - Helps with debugging
2. **Set appropriate timeouts** - Balance between reliability and speed
3. **Mark critical steps** - Ensure important steps stop execution on failure
4. **Enable video for debugging** - Useful for analyzing failures
5. **Use metadata** - Tag tests for organization and filtering
6. **Keep test plans focused** - One test per user workflow
7. **Handle dynamic content** - Use waits and validations appropriately

## Performance

- **Headless mode** - Faster execution, lower resource usage
- **Parallel execution** - Run multiple engines concurrently
- **Selective screenshots** - Disable for faster execution
- **Optimized waits** - Uses smart waiting strategies

## Troubleshooting

### Element not found
- Check element selectors
- Increase timeout in retry policy
- Add wait steps before actions
- Use screenshot action to debug

### Video not recorded
- Ensure `recordVideo: true`
- Check video directory exists and is writable
- Video is saved in `context.close()`

### Tests run too slow
- Use `headless: true`
- Disable video recording
- Reduce `slowMo` value
- Optimize wait times

## API Reference

See `src/engine/types.ts` for complete TypeScript type definitions.

## Contributing

When adding new actions:
1. Add action type to `StepAction` in `types.ts`
2. Implement in `performAction()` method
3. Add documentation and examples
4. Test thoroughly

## License

MIT - Part of the iBotTester project

## Support

For issues or questions:
- Check examples in `examples/` directory
- Review type definitions in `src/engine/types.ts`
- See main iBotTester documentation

---

**Built with ❤️ for the iBotTester project**
