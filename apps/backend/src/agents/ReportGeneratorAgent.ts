// Report Generator Agent
// Generates human-readable test reports with confidence scores and suggested fixes
import OpenAI from 'openai';
import { TestOutput, StepResult, FlowDifference } from '../models/agentTypes';

export interface TestReport {
  summary: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL';
  confidence: number;
  executionDetails: {
    totalSteps: number;
    passedSteps: number;
    failedSteps: number;
    skippedSteps: number;
    duration?: number;
  };
  failures?: {
    step: number;
    action: string;
    error: string;
    rootCause: string;
  }[];
  suggestedFixes?: string[];
  changes?: {
    breaking: number;
    nonBreaking: number;
    cosmetic: number;
    summary: string;
  };
}

export class ReportGeneratorAgent {
  private openai: OpenAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Generate comprehensive test report
   */
  async generateReport(
    testOutput: TestOutput,
    differences?: FlowDifference[]
  ): Promise<TestReport> {
    const executionDetails = this.analyzeExecutionDetails(testOutput.steps);
    const failures = this.extractFailures(testOutput.steps);
    
    // Generate AI-powered analysis if available
    // AI analysis is valuable for all tests (failures, self-healing, performance)
    let summary = testOutput.summary;
    let suggestedFixes: string[] = [];
    let confidence = 0.8;

    if (this.openai) {
      try {
        const aiAnalysis = await this.generateAIAnalysis(testOutput, failures, differences);
        summary = aiAnalysis.summary;
        suggestedFixes = aiAnalysis.suggestedFixes;
        confidence = aiAnalysis.confidence;
      } catch (error) {
        console.error('AI report generation error:', error);
        // Fall back to basic report
        const basicReport = this.generateBasicReport(testOutput, failures);
        summary = basicReport.summary;
        suggestedFixes = basicReport.suggestedFixes;
      }
    } else {
      const basicReport = this.generateBasicReport(testOutput, failures);
      summary = basicReport.summary;
      suggestedFixes = basicReport.suggestedFixes;
    }

    const report: TestReport = {
      summary,
      status: testOutput.status,
      confidence,
      executionDetails,
      failures: failures.length > 0 ? failures : undefined,
      suggestedFixes: suggestedFixes.length > 0 ? suggestedFixes : undefined,
    };

    // Add change analysis if differences provided
    if (differences && differences.length > 0) {
      report.changes = {
        breaking: differences.filter(d => d.type === 'breaking').length,
        nonBreaking: differences.filter(d => d.type === 'non-breaking').length,
        cosmetic: differences.filter(d => d.type === 'cosmetic').length,
        summary: this.summarizeChanges(differences),
      };
    }

    return report;
  }

  /**
   * Analyze execution details
   */
  private analyzeExecutionDetails(steps: StepResult[]): TestReport['executionDetails'] {
    return {
      totalSteps: steps.length,
      passedSteps: steps.filter(s => s.status === 'PASS').length,
      failedSteps: steps.filter(s => s.status === 'FAIL').length,
      skippedSteps: steps.filter(s => s.status === 'SKIPPED').length,
    };
  }

  /**
   * Extract failure information
   */
  private extractFailures(steps: StepResult[]): TestReport['failures'] {
    const failures: NonNullable<TestReport['failures']> = [];
    
    steps.forEach(step => {
      if (step.status === 'FAIL' && step.error) {
        failures.push({
          step: step.step,
          action: step.action,
          error: step.error,
          rootCause: this.analyzeRootCause(step.error, step.action),
        });
      }
    });

    return failures.length > 0 ? failures : undefined;
  }

  /**
   * Analyze root cause of failure
   */
  private analyzeRootCause(error: string, action: string): string {
    const lowerError = error.toLowerCase();
    
    if (lowerError.includes('timeout')) {
      return 'The element took too long to appear or respond. The page might be loading slowly, or the element may not exist.';
    }
    if (lowerError.includes('not found') || lowerError.includes('could not find')) {
      return 'The target element could not be located on the page. It may have been removed, renamed, or is not visible.';
    }
    if (lowerError.includes('navigation')) {
      return 'Failed to navigate to the target URL. The site might be down or the URL is incorrect.';
    }
    if (lowerError.includes('click')) {
      return 'Could not click the element. It might be hidden, disabled, or covered by another element.';
    }
    
    return 'An unexpected error occurred during test execution.';
  }

  /**
   * Generate AI-powered analysis
   */
  private async generateAIAnalysis(
    testOutput: TestOutput,
    failures: TestReport['failures'],
    differences?: FlowDifference[]
  ): Promise<{ summary: string; suggestedFixes: string[]; confidence: number }> {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    const hasFailures = failures && failures.length > 0;
    const hasDifferences = differences && differences.length > 0;
    const selfHealingUsed = testOutput.steps.some(s => s.fallbackUsed);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a senior QA engineer analyzing test executions. Be calm, precise, and helpful. 
Explain results in clear language and provide actionable suggestions.
Never hallucinate - if uncertain, state it clearly.

Analyze ALL test results, not just failures:
- Successful tests with self-healing
- Flow differences detected
- Performance insights
- Potential improvements

Provide your response in JSON format:
{
  "summary": "Clear explanation of what happened",
  "suggestedFixes": ["Fix 1", "Fix 2"],
  "confidence": 0.8
}`,
        },
        {
          role: 'user',
          content: `Analyze this test execution:
Test ID: ${testOutput.testId}
Status: ${testOutput.status}
${hasFailures ? `Failures: ${JSON.stringify(failures, null, 2)}` : 'No failures'}
${hasDifferences ? `Differences: ${JSON.stringify(differences, null, 2)}` : 'No differences detected'}
${selfHealingUsed ? 'Self-healing was used during execution' : 'No self-healing needed'}

Provide analysis in JSON format.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 600,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(cleaned);
    
    return {
      summary: parsed.summary || 'Analysis unavailable',
      suggestedFixes: parsed.suggestedFixes || [],
      confidence: parsed.confidence || 0.7,
    };
  }

  /**
   * Generate basic report without AI
   */
  private generateBasicReport(
    testOutput: TestOutput,
    failures: TestReport['failures']
  ): { summary: string; suggestedFixes: string[] } {
    if (!failures || failures.length === 0) {
      return {
        summary: testOutput.summary,
        suggestedFixes: [],
      };
    }

    const firstFailure = failures[0];
    const summary = `Test failed at step ${firstFailure.step} (${firstFailure.action}). ${firstFailure.rootCause}`;
    
    const suggestedFixes: string[] = [];
    
    failures.forEach(failure => {
      if (failure.error.toLowerCase().includes('timeout')) {
        suggestedFixes.push('Increase timeout duration for slow-loading elements');
        suggestedFixes.push('Check if the page is loading correctly');
      }
      if (failure.error.toLowerCase().includes('not found')) {
        suggestedFixes.push('Verify the element selector is correct');
        suggestedFixes.push('Check if the element is dynamically loaded');
        suggestedFixes.push('Use more robust semantic selectors');
      }
    });

    // Remove duplicates
    const uniqueFixes = Array.from(new Set(suggestedFixes));

    return {
      summary,
      suggestedFixes: uniqueFixes,
    };
  }

  /**
   * Summarize changes
   */
  private summarizeChanges(differences: FlowDifference[]): string {
    const breaking = differences.filter(d => d.type === 'breaking');
    const nonBreaking = differences.filter(d => d.type === 'non-breaking');
    
    if (breaking.length > 0) {
      return `Detected ${breaking.length} breaking change(s) that require attention. Primary issue: ${breaking[0].description}`;
    }
    if (nonBreaking.length > 0) {
      return `Detected ${nonBreaking.length} non-breaking change(s). Test adapted successfully using self-healing.`;
    }
    
    return 'Flow remains stable with minor cosmetic changes.';
  }

  /**
   * Check if AI is available
   */
  isAIAvailable(): boolean {
    return this.openai !== null;
  }
}
