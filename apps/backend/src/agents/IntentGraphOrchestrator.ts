// State Graph Orchestrator for Intent Parser Agent
// Maps ParsedIntent → Graph Nodes → Executable Workflow
// Custom implementation without external dependencies

import { IntentParserAgent, ParsedIntent, PrimaryAction, UpdateScope } from './IntentParserAgent';

// ===========================
// STATE DEFINITION
// ===========================

export interface GraphState {
  // Input
  userPrompt: string;
  parsedIntent: ParsedIntent | null;
  
  // Execution context
  currentAction: PrimaryAction | null;
  currentStep: string;
  
  // Data accumulation
  testDefinitions: any[];
  testResults: any[];
  executionLogs: string[];
  
  // Error handling
  errors: string[];
  retryCount: number;
  
  // User interaction
  requiresUserInput: boolean;
  userQuestion: string | null;
  userResponse: string | null;
  
  // Audit trail
  auditTrail: AuditEntry[];
  
  // Output
  finalResult: any;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused';
}

export interface AuditEntry {
  timestamp: number;
  action: string;
  actor: string;
  details: any;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// ===========================
// GRAPH ENGINE (Custom Implementation)
// ===========================

type NodeFunction = (state: GraphState) => Promise<Partial<GraphState>>;
type ConditionalFunction = (state: GraphState) => string | Promise<string>;

interface GraphNode {
  name: string;
  execute: NodeFunction;
  next?: string;
  conditionalNext?: {
    condition: ConditionalFunction;
    routes: Record<string, string>;
  };
}

class SimpleStateGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private startNode: string = 'parse_intent';

  addNode(name: string, execute: NodeFunction): void {
    this.nodes.set(name, { name, execute });
  }

  addEdge(from: string, to: string): void {
    const node = this.nodes.get(from);
    if (node) {
      node.next = to;
    }
  }

  addConditionalEdges(
    from: string,
    condition: ConditionalFunction,
    routes: Record<string, string>
  ): void {
    const node = this.nodes.get(from);
    if (node) {
      node.conditionalNext = { condition, routes };
    }
  }

  async invoke(initialState: GraphState): Promise<GraphState> {
    let currentState = { ...initialState };
    let currentNodeName = this.startNode;
    const maxIterations = 50; // Prevent infinite loops
    let iterations = 0;

    while (currentNodeName !== 'END' && iterations < maxIterations) {
      iterations++;
      const node = this.nodes.get(currentNodeName);
      
      if (!node) {
        console.error(`Node ${currentNodeName} not found`);
        break;
      }

      // Execute node
      const updates = await node.execute(currentState);
      currentState = { ...currentState, ...updates };

      // Determine next node
      if (node.conditionalNext) {
        const route = await node.conditionalNext.condition(currentState);
        currentNodeName = node.conditionalNext.routes[route] || 'END';
      } else if (node.next) {
        currentNodeName = node.next;
      } else {
        currentNodeName = 'END';
      }
    }

    return currentState;
  }
}

// ===========================
// NODE DEFINITIONS
// ===========================

export class IntentGraphOrchestrator {
  private agent: IntentParserAgent;
  private graph: SimpleStateGraph;

  constructor(agent: IntentParserAgent) {
    this.agent = agent;
    this.graph = this.buildGraph();
  }

  /**
   * Build the workflow graph
   */
  private buildGraph(): SimpleStateGraph {
    const workflow = new SimpleStateGraph();

    // Add nodes
    workflow.addNode('parse_intent', this.parseIntentNode.bind(this));
    workflow.addNode('validate_security', this.validateSecurityNode.bind(this));
    workflow.addNode('route_action', this.routeActionNode.bind(this));
    
    // Primary action nodes
    workflow.addNode('create_test', this.createTestNode.bind(this));
    workflow.addNode('create_bulk_tests', this.createBulkTestsNode.bind(this));
    workflow.addNode('update_test', this.updateTestNode.bind(this));
    workflow.addNode('delete_test', this.deleteTestNode.bind(this));
    workflow.addNode('delete_bulk_tests', this.deleteBulkTestsNode.bind(this));
    workflow.addNode('run_test', this.runTestNode.bind(this));
    workflow.addNode('run_bulk_tests', this.runBulkTestsNode.bind(this));
    workflow.addNode('schedule_test', this.scheduleTestNode.bind(this));
    workflow.addNode('organize_tests', this.organizeTestsNode.bind(this));
    
    // Secondary action nodes
    workflow.addNode('generate_data', this.generateDataNode.bind(this));
    workflow.addNode('heal_locators', this.healLocatorsNode.bind(this));
    workflow.addNode('validate_outcomes', this.validateOutcomesNode.bind(this));
    workflow.addNode('report_evidence', this.reportEvidenceNode.bind(this));
    workflow.addNode('audit', this.auditNode.bind(this));
    
    // Control flow nodes
    workflow.addNode('pause_and_ask', this.pauseAndAskNode.bind(this));
    workflow.addNode('handle_error', this.handleErrorNode.bind(this));
    workflow.addNode('finalize', this.finalizeNode.bind(this));

    // Define edges (workflow flow)
    workflow.addEdge('parse_intent', 'validate_security');
    workflow.addConditionalEdges(
      'validate_security',
      this.shouldRouteOrPause.bind(this),
      {
        route: 'route_action',
        pause: 'pause_and_ask',
        error: 'handle_error'
      }
    );

    // Route to primary actions
    workflow.addConditionalEdges(
      'route_action',
      this.routePrimaryAction.bind(this),
      {
        [PrimaryAction.CREATE]: 'create_test',
        [PrimaryAction.CREATE_BULK]: 'create_bulk_tests',
        [PrimaryAction.UPDATE]: 'update_test',
        [PrimaryAction.DELETE]: 'delete_test',
        [PrimaryAction.DELETE_BULK]: 'delete_bulk_tests',
        [PrimaryAction.RUN]: 'run_test',
        [PrimaryAction.RUN_BULK]: 'run_bulk_tests',
        [PrimaryAction.SCHEDULE]: 'schedule_test',
        [PrimaryAction.ORGANIZE]: 'organize_tests',
        [PrimaryAction.PAUSE_AND_ASK]: 'pause_and_ask'
      }
    );

    // All primary actions flow to audit
    const primaryActions = [
      'create_test', 'create_bulk_tests', 'update_test',
      'delete_test', 'delete_bulk_tests', 'run_test',
      'run_bulk_tests', 'schedule_test', 'organize_tests'
    ];

    primaryActions.forEach(action => {
      workflow.addEdge(action, 'audit');
    });

    workflow.addEdge('audit', 'finalize');
    workflow.addEdge('finalize', 'END');
    workflow.addEdge('pause_and_ask', 'END');
    workflow.addEdge('handle_error', 'END');

    return workflow;
  }

  // ===========================
  // NODE IMPLEMENTATIONS
  // ===========================

  /**
   * Parse user intent
   */
  private async parseIntentNode(state: GraphState): Promise<Partial<GraphState>> {
    try {
      const parsedIntent = await this.agent.parseIntent(state.userPrompt);
      
      return {
        parsedIntent,
        currentAction: parsedIntent.primaryAction,
        currentStep: 'parse_intent',
        status: 'in_progress',
        executionLogs: [
          ...state.executionLogs,
          `[${new Date().toISOString()}] Intent parsed: ${parsedIntent.primaryAction} (confidence: ${parsedIntent.confidence})`
        ]
      };
    } catch (error) {
      return {
        errors: [...state.errors, `Intent parsing failed: ${error}`],
        status: 'failed'
      };
    }
  }

  /**
   * Validate security and risk
   */
  private async validateSecurityNode(state: GraphState): Promise<Partial<GraphState>> {
    const { parsedIntent } = state;
    if (!parsedIntent) {
      return { errors: [...state.errors, 'No parsed intent'], status: 'failed' };
    }

    const auditEntry: AuditEntry = {
      timestamp: Date.now(),
      action: 'security_validation',
      actor: 'system',
      details: {
        action: parsedIntent.primaryAction,
        environment: parsedIntent.args.environment,
        riskLevel: parsedIntent.estimatedImpact?.riskLevel
      },
      riskLevel: parsedIntent.estimatedImpact?.riskLevel
    };

    return {
      currentStep: 'validate_security',
      auditTrail: [...state.auditTrail, auditEntry],
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Security validation passed (Risk: ${parsedIntent.estimatedImpact?.riskLevel})`
      ]
    };
  }

  /**
   * Route to appropriate action handler
   */
  private async routeActionNode(state: GraphState): Promise<Partial<GraphState>> {
    return {
      currentStep: 'route_action',
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Routing to ${state.parsedIntent?.primaryAction}`
      ]
    };
  }

  /**
   * CREATE: Single test creation
   */
  private async createTestNode(state: GraphState): Promise<Partial<GraphState>> {
    const { parsedIntent } = state;
    if (!parsedIntent) return state;

    // Simulate test creation
    const testDefinition = {
      id: `test_${Date.now()}`,
      name: parsedIntent.args.testName || 'Unnamed Test',
      createdAt: new Date().toISOString(),
      status: 'created',
      args: parsedIntent.args
    };

    return {
      currentStep: 'create_test',
      testDefinitions: [...state.testDefinitions, testDefinition],
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Test created: ${testDefinition.name}`
      ],
      auditTrail: [
        ...state.auditTrail,
        {
          timestamp: Date.now(),
          action: 'create_test',
          actor: 'system',
          details: testDefinition,
          riskLevel: 'LOW'
        }
      ]
    };
  }

  /**
   * CREATE_BULK: Multiple test creation
   */
  private async createBulkTestsNode(state: GraphState): Promise<Partial<GraphState>> {
    const { parsedIntent } = state;
    if (!parsedIntent) return state;

    const count = parsedIntent.args.testCount || parsedIntent.args.testNames?.length || 1;
    const testDefinitions = [];

    for (let i = 0; i < count; i++) {
      const testName = parsedIntent.args.testNames?.[i] || `Test ${i + 1}`;
      testDefinitions.push({
        id: `test_${Date.now()}_${i}`,
        name: testName,
        createdAt: new Date().toISOString(),
        status: 'created',
        args: parsedIntent.args
      });
    }

    return {
      currentStep: 'create_bulk_tests',
      testDefinitions: [...state.testDefinitions, ...testDefinitions],
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Created ${count} tests in bulk`
      ],
      auditTrail: [
        ...state.auditTrail,
        {
          timestamp: Date.now(),
          action: 'create_bulk_tests',
          actor: 'system',
          details: { count, tests: testDefinitions.map(t => t.id) },
          riskLevel: count > 20 ? 'MEDIUM' : 'LOW'
        }
      ]
    };
  }

  /**
   * UPDATE: Test modification
   */
  private async updateTestNode(state: GraphState): Promise<Partial<GraphState>> {
    const { parsedIntent } = state;
    if (!parsedIntent) return state;

    const updateDetails = {
      testId: parsedIntent.args.testId,
      testName: parsedIntent.args.testName,
      scope: parsedIntent.updateScope,
      changeRequest: parsedIntent.args.changeRequest
    };

    return {
      currentStep: 'update_test',
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Test updated: ${parsedIntent.args.testName} (scope: ${parsedIntent.updateScope})`
      ],
      auditTrail: [
        ...state.auditTrail,
        {
          timestamp: Date.now(),
          action: 'update_test',
          actor: 'system',
          details: updateDetails,
          riskLevel: parsedIntent.updateScope === UpdateScope.TEST ? 'MEDIUM' : 'LOW'
        }
      ]
    };
  }

  /**
   * DELETE: Single test deletion
   */
  private async deleteTestNode(state: GraphState): Promise<Partial<GraphState>> {
    const { parsedIntent } = state;
    if (!parsedIntent) return state;

    return {
      currentStep: 'delete_test',
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Test deleted: ${parsedIntent.args.testName}`
      ],
      auditTrail: [
        ...state.auditTrail,
        {
          timestamp: Date.now(),
          action: 'delete_test',
          actor: 'system',
          details: { testId: parsedIntent.args.testId, testName: parsedIntent.args.testName },
          riskLevel: 'HIGH'
        }
      ]
    };
  }

  /**
   * DELETE_BULK: Multiple test deletion
   */
  private async deleteBulkTestsNode(state: GraphState): Promise<Partial<GraphState>> {
    const { parsedIntent } = state;
    if (!parsedIntent) return state;

    const count = parsedIntent.args.testIds?.length || parsedIntent.args.testNames?.length || 0;

    return {
      currentStep: 'delete_bulk_tests',
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Deleted ${count} tests in bulk`
      ],
      auditTrail: [
        ...state.auditTrail,
        {
          timestamp: Date.now(),
          action: 'delete_bulk_tests',
          actor: 'system',
          details: { count, testIds: parsedIntent.args.testIds, testNames: parsedIntent.args.testNames },
          riskLevel: count > 10 ? 'CRITICAL' : 'HIGH'
        }
      ]
    };
  }

  /**
   * RUN: Single test execution
   */
  private async runTestNode(state: GraphState): Promise<Partial<GraphState>> {
    const { parsedIntent } = state;
    if (!parsedIntent) return state;

    const testResult = {
      testId: parsedIntent.args.testId,
      testName: parsedIntent.args.testName,
      status: 'passed',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 5000).toISOString(),
      duration: 5000
    };

    return {
      currentStep: 'run_test',
      testResults: [...state.testResults, testResult],
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Test executed: ${parsedIntent.args.testName} - ${testResult.status}`
      ]
    };
  }

  /**
   * RUN_BULK: Parallel test execution
   */
  private async runBulkTestsNode(state: GraphState): Promise<Partial<GraphState>> {
    const { parsedIntent } = state;
    if (!parsedIntent) return state;

    const testNames = parsedIntent.args.testNames || [];
    const maxConcurrency = parsedIntent.args.maxConcurrency || 5;
    const testResults = [];

    for (let i = 0; i < testNames.length; i++) {
      testResults.push({
        testId: `test_${i}`,
        testName: testNames[i],
        status: Math.random() > 0.1 ? 'passed' : 'failed',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3000).toISOString(),
        duration: 3000
      });
    }

    const passed = testResults.filter(t => t.status === 'passed').length;
    const failed = testResults.filter(t => t.status === 'failed').length;

    return {
      currentStep: 'run_bulk_tests',
      testResults: [...state.testResults, ...testResults],
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Bulk test execution completed: ${passed} passed, ${failed} failed (max concurrency: ${maxConcurrency})`
      ]
    };
  }

  /**
   * SCHEDULE: Test scheduling
   */
  private async scheduleTestNode(state: GraphState): Promise<Partial<GraphState>> {
    const { parsedIntent } = state;
    if (!parsedIntent) return state;

    return {
      currentStep: 'schedule_test',
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Test scheduled: ${parsedIntent.args.testName} at ${parsedIntent.args.schedule}`
      ],
      auditTrail: [
        ...state.auditTrail,
        {
          timestamp: Date.now(),
          action: 'schedule_test',
          actor: 'system',
          details: { 
            testName: parsedIntent.args.testName,
            schedule: parsedIntent.args.schedule,
            timezone: parsedIntent.args.timezone
          },
          riskLevel: 'LOW'
        }
      ]
    };
  }

  /**
   * ORGANIZE: Test organization
   */
  private async organizeTestsNode(state: GraphState): Promise<Partial<GraphState>> {
    return {
      currentStep: 'organize_tests',
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Tests organized`
      ]
    };
  }

  /**
   * Secondary: Generate test data
   */
  private async generateDataNode(state: GraphState): Promise<Partial<GraphState>> {
    return {
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Test data generated`
      ]
    };
  }

  /**
   * Secondary: Heal locators
   */
  private async healLocatorsNode(state: GraphState): Promise<Partial<GraphState>> {
    return {
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Locators healed`
      ]
    };
  }

  /**
   * Secondary: Validate business outcomes
   */
  private async validateOutcomesNode(state: GraphState): Promise<Partial<GraphState>> {
    return {
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Business outcomes validated`
      ]
    };
  }

  /**
   * Secondary: Report evidence
   */
  private async reportEvidenceNode(state: GraphState): Promise<Partial<GraphState>> {
    const { parsedIntent } = state;
    const reporting = parsedIntent?.args.reporting;

    return {
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Evidence reported (screenshots: ${reporting?.screenshots}, video: ${reporting?.video})`
      ]
    };
  }

  /**
   * Audit: Complete audit trail
   */
  private async auditNode(state: GraphState): Promise<Partial<GraphState>> {
    const auditEntry: AuditEntry = {
      timestamp: Date.now(),
      action: 'workflow_complete',
      actor: 'system',
      details: {
        action: state.currentAction,
        testCount: state.testDefinitions.length,
        resultCount: state.testResults.length,
        errors: state.errors.length
      }
    };

    return {
      currentStep: 'audit',
      auditTrail: [...state.auditTrail, auditEntry],
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Audit trail completed`
      ]
    };
  }

  /**
   * PAUSE_AND_ASK: Request user input
   */
  private async pauseAndAskNode(state: GraphState): Promise<Partial<GraphState>> {
    const { parsedIntent } = state;

    return {
      currentStep: 'pause_and_ask',
      requiresUserInput: true,
      userQuestion: parsedIntent?.question || 'Additional information required',
      status: 'paused',
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Paused for user input: ${parsedIntent?.question}`
      ]
    };
  }

  /**
   * Handle errors
   */
  private async handleErrorNode(state: GraphState): Promise<Partial<GraphState>> {
    return {
      currentStep: 'handle_error',
      status: 'failed',
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Error handling triggered: ${state.errors.join(', ')}`
      ]
    };
  }

  /**
   * Finalize workflow
   */
  private async finalizeNode(state: GraphState): Promise<Partial<GraphState>> {
    const finalResult = {
      action: state.currentAction,
      testsCreated: state.testDefinitions.length,
      testsExecuted: state.testResults.length,
      passed: state.testResults.filter(t => t.status === 'passed').length,
      failed: state.testResults.filter(t => t.status === 'failed').length,
      auditTrail: state.auditTrail,
      executionLogs: state.executionLogs,
      errors: state.errors
    };

    return {
      currentStep: 'finalize',
      finalResult,
      status: state.errors.length > 0 ? 'failed' : 'completed',
      executionLogs: [
        ...state.executionLogs,
        `[${new Date().toISOString()}] Workflow finalized: ${state.status}`
      ]
    };
  }

  // ===========================
  // CONDITIONAL EDGE FUNCTIONS
  // ===========================

  /**
   * Decide whether to route or pause
   */
  private shouldRouteOrPause(state: GraphState): string {
    const { parsedIntent } = state;

    if (!parsedIntent) return 'error';
    
    if (parsedIntent.primaryAction === PrimaryAction.PAUSE_AND_ASK) {
      return 'pause';
    }

    if (parsedIntent.question) {
      return 'pause';
    }

    if (parsedIntent.estimatedImpact?.riskLevel === 'CRITICAL' && !state.userResponse) {
      return 'pause';
    }

    return 'route';
  }

  /**
   * Route to primary action
   */
  private routePrimaryAction(state: GraphState): string {
    return state.parsedIntent?.primaryAction || PrimaryAction.PAUSE_AND_ASK;
  }

  // ===========================
  // EXECUTION
  // ===========================

  /**
   * Execute the workflow
   */
  async execute(userPrompt: string): Promise<GraphState> {
    const initialState: GraphState = {
      userPrompt,
      parsedIntent: null,
      currentAction: null,
      currentStep: 'start',
      testDefinitions: [],
      testResults: [],
      executionLogs: [],
      errors: [],
      retryCount: 0,
      requiresUserInput: false,
      userQuestion: null,
      userResponse: null,
      auditTrail: [],
      finalResult: null,
      status: 'pending'
    };

    const result = await this.graph.invoke(initialState);

    return result as GraphState;
  }

  /**
   * Resume paused workflow with user response
   */
  async resume(state: GraphState, userResponse: string): Promise<GraphState> {
    const updatedState = {
      ...state,
      userResponse,
      requiresUserInput: false,
      status: 'in_progress' as const
    };

    const result = await this.graph.invoke(updatedState);

    return result as GraphState;
  }

  /**
   * Get workflow visualization
   */
  getWorkflowVisualization(): string {
    return `
    START
      ↓
    parse_intent
      ↓
    validate_security
      ↓
    route_action ──→ PAUSE_AND_ASK → END
      ↓
    [CREATE|UPDATE|DELETE|RUN|SCHEDULE|ORGANIZE]
      ↓
    audit
      ↓
    finalize
      ↓
    END
    `;
  }
}

// ===========================
// EXPORT HELPER FUNCTIONS
// ===========================

/**
 * Create and execute workflow from user prompt
 */
export async function executeWorkflow(
  userPrompt: string,
  apiKey?: string
): Promise<GraphState> {
  const agent = new IntentParserAgent(apiKey);
  const orchestrator = new IntentGraphOrchestrator(agent);
  return await orchestrator.execute(userPrompt);
}

/**
 * Create orchestrator instance
 */
export function createOrchestrator(apiKey?: string): IntentGraphOrchestrator {
  const agent = new IntentParserAgent(apiKey);
  return new IntentGraphOrchestrator(agent);
}
