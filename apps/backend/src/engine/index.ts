/**
 * iBotTester Playwright Execution Engine
 * 
 * Public API exports for the execution engine
 */

export { PlaywrightExecutionEngine } from './PlaywrightExecutionEngine';

export {
  // Configuration
  ExecutionEngineOptions,
  RetryPolicy,
  
  // Test Plan
  TestPlan,
  TestStep,
  StepAction,
  
  // Results
  TestExecutionResult,
  StepResult,
  StepStatus,
  TestStatus,
  
  // Evidence
  TestEvidence,
  FlowDifference,
  
  // Progress & Events
  ExecutionProgress,
  ExecutionEvent,
  ExecutionEventType,
  
  // Locators
  ElementLocator,
} from './types';
