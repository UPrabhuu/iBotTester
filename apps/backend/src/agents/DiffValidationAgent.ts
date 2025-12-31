// Diff & Validation Agent
// Compares executions and classifies differences
import { FlowDifference, StepResult } from '../models/agentTypes';

export interface ExecutionSnapshot {
  testId: string;
  timestamp: string;
  steps: StepResult[];
  pageStructure?: any;
}

export class DiffValidationAgent {
  private executionHistory: Map<string, ExecutionSnapshot[]> = new Map();
  private readonly MAX_HISTORY_SIZE: number;

  constructor(maxHistorySize: number = 10) {
    this.MAX_HISTORY_SIZE = maxHistorySize;
  }

  /**
   * Store execution snapshot for future comparison
   */
  storeExecution(testId: string, snapshot: ExecutionSnapshot): void {
    if (!this.executionHistory.has(testId)) {
      this.executionHistory.set(testId, []);
    }
    
    const history = this.executionHistory.get(testId)!;
    history.push(snapshot);
    
    // Keep only last N executions (configurable)
    if (history.length > this.MAX_HISTORY_SIZE) {
      history.shift();
    }
  }

  /**
   * Compare current execution with last successful run
   */
  async compareWithHistory(
    testId: string,
    currentExecution: ExecutionSnapshot
  ): Promise<FlowDifference[]> {
    const history = this.executionHistory.get(testId);
    
    if (!history || history.length === 0) {
      return []; // No history to compare
    }

    // Find last successful execution
    const lastSuccessful = this.findLastSuccessfulExecution(history);
    if (!lastSuccessful) {
      return []; // No successful execution to compare
    }

    const differences: FlowDifference[] = [];

    // Compare step count
    if (currentExecution.steps.length !== lastSuccessful.steps.length) {
      differences.push({
        type: 'breaking',
        description: `Step count changed from ${lastSuccessful.steps.length} to ${currentExecution.steps.length}`,
      });
    }

    // Compare each step
    for (let i = 0; i < Math.min(currentExecution.steps.length, lastSuccessful.steps.length); i++) {
      const currentStep = currentExecution.steps[i];
      const lastStep = lastSuccessful.steps[i];

      // Compare step status
      if (currentStep.status !== lastStep.status) {
        differences.push({
          type: this.classifyStatusChange(lastStep.status, currentStep.status),
          description: `Step ${i + 1}: Status changed from ${lastStep.status} to ${currentStep.status}`,
          element: currentStep.action,
          oldValue: lastStep.status,
          newValue: currentStep.status,
        });
      }

      // Compare actions
      if (currentStep.action !== lastStep.action) {
        differences.push({
          type: 'breaking',
          description: `Step ${i + 1}: Action changed from "${lastStep.action}" to "${currentStep.action}"`,
          element: `Step ${i + 1}`,
          oldValue: lastStep.action,
          newValue: currentStep.action,
        });
      }

      // Check for new errors
      if (currentStep.error && !lastStep.error) {
        differences.push({
          type: 'breaking',
          description: `Step ${i + 1}: New error occurred - ${currentStep.error}`,
          element: currentStep.action,
        });
      }

      // Check for fallback usage
      if (currentStep.fallbackUsed && !lastStep.fallbackUsed) {
        differences.push({
          type: 'non-breaking',
          description: `Step ${i + 1}: Self-healing selector used (element may have changed)`,
          element: currentStep.action,
        });
      }
    }

    return differences;
  }

  /**
   * Classify the type of status change
   */
  private classifyStatusChange(
    oldStatus: 'PASS' | 'FAIL' | 'SKIPPED',
    newStatus: 'PASS' | 'FAIL' | 'SKIPPED'
  ): 'breaking' | 'non-breaking' | 'cosmetic' {
    if (oldStatus === 'PASS' && newStatus === 'FAIL') {
      return 'breaking';
    }
    if (oldStatus === 'FAIL' && newStatus === 'PASS') {
      return 'non-breaking';
    }
    return 'cosmetic';
  }

  /**
   * Find last successful execution from history
   */
  private findLastSuccessfulExecution(
    history: ExecutionSnapshot[]
  ): ExecutionSnapshot | null {
    for (let i = history.length - 1; i >= 0; i--) {
      const execution = history[i];
      const allPassed = execution.steps.every(step => step.status === 'PASS');
      if (allPassed) {
        return execution;
      }
    }
    return null;
  }

  /**
   * Analyze differences and provide summary
   */
  analyzeDifferences(differences: FlowDifference[]): {
    hasBreaking: boolean;
    hasNonBreaking: boolean;
    hasCosmetic: boolean;
    summary: string;
  } {
    const breaking = differences.filter(d => d.type === 'breaking');
    const nonBreaking = differences.filter(d => d.type === 'non-breaking');
    const cosmetic = differences.filter(d => d.type === 'cosmetic');

    let summary = '';
    if (breaking.length > 0) {
      summary += `Found ${breaking.length} breaking change(s). `;
    }
    if (nonBreaking.length > 0) {
      summary += `Found ${nonBreaking.length} non-breaking change(s). `;
    }
    if (cosmetic.length > 0) {
      summary += `Found ${cosmetic.length} cosmetic change(s). `;
    }
    if (differences.length === 0) {
      summary = 'No changes detected from last successful run.';
    }

    return {
      hasBreaking: breaking.length > 0,
      hasNonBreaking: nonBreaking.length > 0,
      hasCosmetic: cosmetic.length > 0,
      summary: summary.trim(),
    };
  }

  /**
   * Clear execution history
   */
  clearHistory(testId?: string): void {
    if (testId) {
      this.executionHistory.delete(testId);
    } else {
      this.executionHistory.clear();
    }
  }
}
