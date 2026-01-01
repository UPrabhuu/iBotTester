// Orchestrator Agent
// Coordinates the complete agent flow: Intent Parser → Test Planner → Execution → Evidence → Diff/Validation → Report
import { IntentParserAgent } from './IntentParserAgent';
import { AIAgentService } from '../services/aiAgentService';
import { ExecutionAgentService } from '../services/executionAgentService';
import { EvidenceCollectorAgent } from './EvidenceCollectorAgent';
import { DiffValidationAgent, ExecutionSnapshot } from './DiffValidationAgent';
import { ReportGeneratorAgent } from './ReportGeneratorAgent';
import { TestInput, TestOutput, TestPlan } from '../models/agentTypes';

export interface OrchestratedTestOutput extends TestOutput {
  intent?: any;
  report?: any;
  agentFlow: {
    intentParser: { completed: boolean; timestamp: string };
    testPlanner: { completed: boolean; timestamp: string };
    execution: { completed: boolean; timestamp: string };
    evidenceCollector: { completed: boolean; timestamp: string };
    diffValidation: { completed: boolean; timestamp: string };
    reportGenerator: { completed: boolean; timestamp: string };
  };
}

export class OrchestratorAgent {
  private intentParser: IntentParserAgent;
  private testPlanner: AIAgentService;
  private executionAgent: ExecutionAgentService;
  private evidenceCollector: EvidenceCollectorAgent;
  private diffValidator: DiffValidationAgent;
  private reportGenerator: ReportGeneratorAgent;

  constructor(apiKey?: string) {
    this.intentParser = new IntentParserAgent(apiKey);
    this.testPlanner = new AIAgentService(apiKey);
    this.evidenceCollector = new EvidenceCollectorAgent();
    this.diffValidator = new DiffValidationAgent();
    this.reportGenerator = new ReportGeneratorAgent(apiKey);
    this.executionAgent = new ExecutionAgentService();
  }

  /**
   * Execute complete test flow
   * User Prompt → Intent Parser → Test Planner → Execution → Evidence → Diff/Validation → Report
   */
  async executeTestFlow(input: TestInput): Promise<OrchestratedTestOutput> {
    const agentFlow: OrchestratedTestOutput['agentFlow'] = {
      intentParser: { completed: false, timestamp: '' },
      testPlanner: { completed: false, timestamp: '' },
      execution: { completed: false, timestamp: '' },
      evidenceCollector: { completed: false, timestamp: '' },
      diffValidation: { completed: false, timestamp: '' },
      reportGenerator: { completed: false, timestamp: '' },
    };

    try {
      // Step 1: Intent Parser Agent
      console.log('🔍 Step 1: Parsing user intent...');
      const intent = await this.intentParser.parseIntent(input.prompt);
      agentFlow.intentParser = { completed: true, timestamp: new Date().toISOString() };
      const targetName = intent.args.testName || intent.args.testPattern || intent.args.pageName || 'target';
      console.log(`✓ Intent parsed: ${intent.primaryAction} on ${targetName}`);

      // Step 2: Test Planner Agent (JSON)
      console.log('📋 Step 2: Generating test plan...');
      const testPlan = await this.testPlanner.generateTestPlan(input);
      agentFlow.testPlanner = { completed: true, timestamp: new Date().toISOString() };
      console.log(`✓ Test plan generated with ${testPlan.steps.length} steps`);

      // Step 3: Execution Agent (Playwright)
      console.log('🤖 Step 3: Executing test with Playwright...');
      this.evidenceCollector.clear(); // Reset evidence collector
      
      const executionResult = await this.executionAgent.executeTestPlan(testPlan, {
        headless: input.options?.headless !== false,
        recordVideo: input.options?.recordVideo || false,
        screenshots: input.options?.screenshots !== false,
      });
      agentFlow.execution = { completed: true, timestamp: new Date().toISOString() };
      console.log(`✓ Execution completed with status: ${executionResult.status}`);

      // Step 4: Evidence Collector
      console.log('📸 Step 4: Collecting evidence...');
      // Evidence is already collected in executionResult
      agentFlow.evidenceCollector = { completed: true, timestamp: new Date().toISOString() };
      console.log(`✓ Evidence collected: ${executionResult.evidence.screenshots.length} screenshots, ${executionResult.evidence.logs.length} logs`);

      // Step 5: Diff & Validation Agent
      console.log('🔬 Step 5: Analyzing differences...');
      const executionSnapshot: ExecutionSnapshot = {
        testId: testPlan.testId,
        timestamp: new Date().toISOString(),
        steps: executionResult.steps,
      };
      
      const differences = await this.diffValidator.compareWithHistory(
        testPlan.testId,
        executionSnapshot
      );
      
      // Store current execution for future comparisons
      this.diffValidator.storeExecution(testPlan.testId, executionSnapshot);
      
      agentFlow.diffValidation = { completed: true, timestamp: new Date().toISOString() };
      console.log(`✓ Diff analysis completed: ${differences.length} change(s) detected`);

      // Step 6: Report Generator
      console.log('📊 Step 6: Generating report...');
      const report = await this.reportGenerator.generateReport(executionResult, differences);
      agentFlow.reportGenerator = { completed: true, timestamp: new Date().toISOString() };
      console.log(`✓ Report generated with confidence: ${report.confidence}`);

      // Combine all results
      const finalOutput: OrchestratedTestOutput = {
        ...executionResult,
        intent,
        report,
        agentFlow,
        confidence: report.confidence,
        suggestedFixes: report.suggestedFixes,
        diff: differences,
        summary: report.summary,
      };

      console.log('✅ Test flow completed successfully');
      return finalOutput;

    } catch (error: any) {
      console.error('❌ Test flow error:', error);
      
      // Generate unique error ID using crypto for better collision prevention
      // Falls back to timestamp + random if crypto is unavailable
      let errorId: string;
      try {
        // Use crypto.randomUUID if available (Node 14.17+)
        errorId = `error-${Date.now()}-${require('crypto').randomUUID().split('-')[0]}`;
      } catch {
        // Fallback to Math.random with more entropy
        errorId = `error-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      }
      
      // Return error result
      const errorOutput: OrchestratedTestOutput = {
        testId: errorId,
        status: 'FAIL',
        steps: [],
        evidence: { screenshots: [], logs: [error.message] },
        diff: [],
        summary: `Test flow failed: ${error.message}`,
        agentFlow,
      };

      return errorOutput;
    }
  }

  /**
   * Get agent flow status
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
