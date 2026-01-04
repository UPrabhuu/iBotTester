/**
 * LangGraph State Machine Orchestrator
 * 
 * Converts the OrchestratorAgent into a LangGraph state machine with:
 * - Clear state definitions
 * - Conditional edges
 * - Better error handling and recovery
 * - State persistence capabilities
 * - Parallel execution where possible
 * 
 * Flow: Intent Parser → Test Planner → Execution → Evidence → Diff/Validation → Report
 */

import { StateGraph, Annotation } from '@langchain/langgraph';
import { IntentParserAgent, ParsedIntent } from './IntentParserAgent';
import { AIAgentService } from '../services/aiAgentService';
import { ExecutionAgentService } from '../services/executionAgentService';
import { EvidenceCollectorAgent } from './EvidenceCollectorAgent';
import { DiffValidationAgent, ExecutionSnapshot } from './DiffValidationAgent';
import { ReportGeneratorAgent } from './ReportGeneratorAgent';
import { TestInput, TestOutput, TestPlan } from '../models/agentTypes';

/**
 * State definition using Annotation
 */
const TestFlowState = Annotation.Root({
  // Input
  input: Annotation<TestInput | undefined>,
  
  // Agent outputs
  intent: Annotation<ParsedIntent | undefined>,
  testPlan: Annotation<TestPlan | undefined>,
  executionResult: Annotation<any>,
  evidence: Annotation<any>,
  differences: Annotation<any[]>,
  report: Annotation<any>,
  
  // Flow tracking
  agentFlow: Annotation<{
    intentParser: { completed: boolean; timestamp: string };
    testPlanner: { completed: boolean; timestamp: string };
    execution: { completed: boolean; timestamp: string };
    evidenceCollector: { completed: boolean; timestamp: string };
    diffValidation: { completed: boolean; timestamp: string };
    reportGenerator: { completed: boolean; timestamp: string };
  }>,
  
  // Error handling
  error: Annotation<string | undefined>,
  retryCount: Annotation<number>,
  
  // Final output
  finalOutput: Annotation<TestOutput | undefined>,
});

export type TestFlowStateType = typeof TestFlowState.State;

/**
 * LangGraph-based Orchestrator
 */
export class LangGraphOrchestrator {
  private intentParser: IntentParserAgent;
  private testPlanner: AIAgentService;
  private executionAgent: ExecutionAgentService;
  private evidenceCollector: EvidenceCollectorAgent;
  private diffValidator: DiffValidationAgent;
  private reportGenerator: ReportGeneratorAgent;
  private graph: any; // Compiled graph

  constructor(apiKey?: string) {
    this.intentParser = new IntentParserAgent(apiKey);
    this.testPlanner = new AIAgentService(apiKey);
    this.executionAgent = new ExecutionAgentService();
    this.evidenceCollector = new EvidenceCollectorAgent();
    this.diffValidator = new DiffValidationAgent();
    this.reportGenerator = new ReportGeneratorAgent(apiKey);
    
    this.buildGraph();
  }

  /**
   * Build the LangGraph state machine
   */
  private buildGraph(): void {
    // Use 'as any' to bypass strict typing - this is a working pattern
    const workflow = new StateGraph(TestFlowState) as any;

    // Add nodes for each step
    workflow.addNode('parseIntent', this.parseIntentNode.bind(this));
    workflow.addNode('planTest', this.planTestNode.bind(this));
    workflow.addNode('executeTest', this.executeTestNode.bind(this));
    workflow.addNode('collectEvidence', this.collectEvidenceNode.bind(this));
    workflow.addNode('validateDiff', this.validateDiffNode.bind(this));
    workflow.addNode('generateReport', this.generateReportNode.bind(this));
    workflow.addNode('handleError', this.handleErrorNode.bind(this));
    workflow.addNode('finalize', this.finalizeNode.bind(this));

    // Set entry point
    workflow.addEdge('__start__', 'parseIntent');
    
    workflow.addConditionalEdges(
      'parseIntent',
      this.shouldContinueAfterIntent.bind(this)
    );

    workflow.addConditionalEdges(
      'planTest',
      this.shouldContinueAfterPlanning.bind(this)
    );

    workflow.addConditionalEdges(
      'executeTest',
      this.shouldContinueAfterExecution.bind(this)
    );

    workflow.addEdge('collectEvidence', 'validateDiff');
    workflow.addEdge('validateDiff', 'generateReport');
    workflow.addEdge('generateReport', 'finalize');
    
    workflow.addConditionalEdges(
      'handleError',
      this.shouldRetry.bind(this)
    );

    workflow.addEdge('finalize', '__end__');

    this.graph = workflow.compile();
  }

  /**
   * Node: Parse Intent
   */
  private async parseIntentNode(state: TestFlowStateType): Promise<Partial<TestFlowStateType>> {
    console.log('🔍 Node: Parsing user intent...');
    
    try {
      if (!state.input) {
        throw new Error('No input provided');
      }

      const intent = await this.intentParser.parseIntent(state.input.prompt);
      const targetName = intent.args.testName || intent.args.testPattern || intent.args.pageName || 'target';
      console.log(`✓ Intent parsed: ${intent.primaryAction} on ${targetName}`);

      return {
        intent,
        agentFlow: {
          ...state.agentFlow,
          intentParser: { completed: true, timestamp: new Date().toISOString() },
        },
      };
    } catch (error) {
      console.error('❌ Intent parsing failed:', error);
      return {
        error: error instanceof Error ? error.message : String(error),
        agentFlow: {
          ...state.agentFlow,
          intentParser: { completed: false, timestamp: new Date().toISOString() },
        },
      };
    }
  }

  /**
   * Node: Plan Test
   */
  private async planTestNode(state: TestFlowStateType): Promise<Partial<TestFlowStateType>> {
    console.log('📋 Node: Generating test plan...');
    
    try {
      if (!state.input) {
        throw new Error('No input for test planning');
      }

      const testPlan = await this.testPlanner.generateTestPlan(state.input);
      console.log(`✓ Test plan generated with ${testPlan.steps.length} steps`);

      return {
        testPlan,
        agentFlow: {
          ...state.agentFlow,
          testPlanner: { completed: true, timestamp: new Date().toISOString() },
        },
      };
    } catch (error) {
      console.error('❌ Test planning failed:', error);
      return {
        error: error instanceof Error ? error.message : String(error),
        agentFlow: {
          ...state.agentFlow,
          testPlanner: { completed: false, timestamp: new Date().toISOString() },
        },
      };
    }
  }

  /**
   * Node: Execute Test
   */
  private async executeTestNode(state: TestFlowStateType): Promise<Partial<TestFlowStateType>> {
    console.log('🤖 Node: Executing test with Playwright...');
    
    try {
      if (!state.testPlan) {
        throw new Error('No test plan for execution');
      }

      this.evidenceCollector.clear();
      
      const executionResult = await this.executionAgent.executeTestPlan(state.testPlan, {
        headless: state.input?.options?.headless !== false,
        recordVideo: state.input?.options?.recordVideo || false,
        screenshots: state.input?.options?.screenshots !== false,
      });

      console.log(`✓ Execution completed with status: ${executionResult.status}`);

      return {
        executionResult,
        agentFlow: {
          ...state.agentFlow,
          execution: { completed: true, timestamp: new Date().toISOString() },
        },
      };
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      return {
        error: error instanceof Error ? error.message : String(error),
        agentFlow: {
          ...state.agentFlow,
          execution: { completed: false, timestamp: new Date().toISOString() },
        },
      };
    }
  }

  /**
   * Node: Collect Evidence
   */
  private async collectEvidenceNode(state: TestFlowStateType): Promise<Partial<TestFlowStateType>> {
    console.log('📸 Node: Collecting evidence...');
    
    try {
      if (!state.executionResult) {
        throw new Error('No execution result for evidence collection');
      }

      // Evidence is already in executionResult
      const evidence = state.executionResult.evidence;
      console.log(`✓ Evidence collected: ${evidence.screenshots.length} screenshots, ${evidence.logs.length} logs`);

      return {
        evidence,
        agentFlow: {
          ...state.agentFlow,
          evidenceCollector: { completed: true, timestamp: new Date().toISOString() },
        },
      };
    } catch (error) {
      console.error('❌ Evidence collection failed:', error);
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Node: Validate Diff
   */
  private async validateDiffNode(state: TestFlowStateType): Promise<Partial<TestFlowStateType>> {
    console.log('🔬 Node: Analyzing differences...');
    
    try {
      if (!state.testPlan || !state.executionResult) {
        throw new Error('Missing test plan or execution result for diff validation');
      }

      const executionSnapshot: ExecutionSnapshot = {
        testId: state.testPlan.testId,
        timestamp: new Date().toISOString(),
        steps: state.executionResult.steps,
      };

      const differences = await this.diffValidator.compareWithHistory(
        state.testPlan.testId,
        executionSnapshot
      );

      // Store current execution for future comparisons
      this.diffValidator.storeExecution(state.testPlan.testId, executionSnapshot);

      console.log(`✓ Diff analysis completed: ${differences.length} change(s) detected`);

      return {
        differences,
        agentFlow: {
          ...state.agentFlow,
          diffValidation: { completed: true, timestamp: new Date().toISOString() },
        },
      };
    } catch (error) {
      console.error('❌ Diff validation failed:', error);
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Node: Generate Report
   */
  private async generateReportNode(state: TestFlowStateType): Promise<Partial<TestFlowStateType>> {
    console.log('📊 Node: Generating report...');
    
    try {
      if (!state.executionResult || !state.differences) {
        throw new Error('Missing execution result or differences for report generation');
      }

      const report = await this.reportGenerator.generateReport(
        state.executionResult,
        state.differences
      );

      console.log(`✓ Report generated with confidence: ${report.confidence}`);

      return {
        report,
        agentFlow: {
          ...state.agentFlow,
          reportGenerator: { completed: true, timestamp: new Date().toISOString() },
        },
      };
    } catch (error) {
      console.error('❌ Report generation failed:', error);
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Node: Handle Error
   */
  private async handleErrorNode(state: TestFlowStateType): Promise<Partial<TestFlowStateType>> {
    console.error('⚠️  Node: Handling error...');
    console.error(`Error: ${state.error}`);
    
    return {
      retryCount: (state.retryCount || 0) + 1,
    };
  }

  /**
   * Node: Finalize
   */
  private async finalizeNode(state: TestFlowStateType): Promise<Partial<TestFlowStateType>> {
    console.log('✨ Node: Finalizing...');
    
    if (state.error && !state.executionResult) {
      // Generate error ID
      let errorId: string;
      try {
        errorId = `error-${Date.now()}-${require('crypto').randomUUID().split('-')[0]}`;
      } catch {
        errorId = `error-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      }

      const errorOutput: TestOutput = {
        testId: errorId,
        status: 'FAIL',
        steps: [],
        evidence: { screenshots: [], logs: [state.error] },
        diff: [],
        summary: `Test flow failed: ${state.error}`,
      };

      return { finalOutput: errorOutput };
    }

    // Success - combine all results
    const finalOutput: TestOutput = {
      ...state.executionResult!,
      intent: state.intent,
      report: state.report,
      confidence: state.report?.confidence,
      suggestedFixes: state.report?.suggestedFixes,
      diff: state.differences || [],
      summary: state.report?.summary,
    };

    console.log('✅ Test flow completed successfully');
    return { finalOutput };
  }

  /**
   * Conditional: Should continue after intent parsing?
   */
  private shouldContinueAfterIntent(state: TestFlowStateType): string {
    if (state.error) {
      return 'handleError';
    }
    if (state.intent?.question) {
      return 'handleError';
    }
    return 'planTest';
  }

  /**
   * Conditional: Should continue after test planning?
   */
  private shouldContinueAfterPlanning(state: TestFlowStateType): string {
    if (state.error) {
      return 'handleError';
    }
    if (!state.testPlan || state.testPlan.steps.length === 0) {
      return 'handleError';
    }
    return 'executeTest';
  }

  /**
   * Conditional: Should continue after execution?
   */
  private shouldContinueAfterExecution(state: TestFlowStateType): string {
    if (state.error) {
      return 'handleError';
    }
    if (!state.executionResult) {
      return 'handleError';
    }
    return 'collectEvidence';
  }

  /**
   * Conditional: Should retry after error?
   */
  private shouldRetry(state: TestFlowStateType): string {
    const maxRetries = 2;
    if ((state.retryCount || 0) < maxRetries) {
      console.log(`🔄 Retrying... (attempt ${(state.retryCount || 0) + 1}/${maxRetries})`);
      return 'parseIntent';
    }
    console.log('❌ Max retries reached, ending flow');
    return 'finalize';
  }

  /**
   * Execute the complete test flow using LangGraph
   */
  async executeTestFlow(input: TestInput): Promise<TestOutput> {
    console.log('🚀 Starting LangGraph Test Flow...\n');

    const initialState: Partial<TestFlowStateType> = {
      input,
      agentFlow: {
        intentParser: { completed: false, timestamp: '' },
        testPlanner: { completed: false, timestamp: '' },
        execution: { completed: false, timestamp: '' },
        evidenceCollector: { completed: false, timestamp: '' },
        diffValidation: { completed: false, timestamp: '' },
        reportGenerator: { completed: false, timestamp: '' },
      },
      retryCount: 0,
    };

    try {
      const result = await this.graph.invoke(initialState);
      return result.finalOutput || {
        testId: 'error',
        status: 'FAIL',
        steps: [],
        evidence: { screenshots: [], logs: [] },
        diff: [],
        summary: 'Flow execution failed',
      };
    } catch (error) {
      console.error('❌ LangGraph execution error:', error);
      throw error;
    }
  }

  /**
   * Get the compiled graph (for visualization or inspection)
   */
  getGraph() {
    return this.graph;
  }

  /**
   * Check health of all agents
   */
  getAgentStatus(): {
    intentParser: boolean;
    testPlanner: boolean;
    reportGenerator: boolean;
  } {
    return {
      intentParser: this.intentParser.isAIAvailable(),
      testPlanner: this.testPlanner.isAIAvailable(),
      reportGenerator: this.reportGenerator.isAIAvailable(),
    };
  }
}
