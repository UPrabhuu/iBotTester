
import OpenAI from 'openai';

// Fixed taxonomy of actions
export enum PrimaryAction {
  CREATE = 'CREATE',
  CREATE_BULK = 'CREATE_BULK',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  DELETE_BULK = 'DELETE_BULK',
  RUN = 'RUN',
  RUN_BULK = 'RUN_BULK',
  SCHEDULE = 'SCHEDULE',
  ORGANIZE = 'ORGANIZE',
  GENERATE_DATA = 'GENERATE_DATA',
  HEAL_LOCATORS = 'HEAL_LOCATORS',
  PAUSE_AND_ASK = 'PAUSE_AND_ASK',
  RETRY_INTELLIGENTLY = 'RETRY_INTELLIGENTLY',
  VALIDATE_BUSINESS_OUTCOMES = 'VALIDATE_BUSINESS_OUTCOMES',
  REPORT_WITH_EVIDENCE = 'REPORT_WITH_EVIDENCE',
  SECURE_EXECUTION = 'SECURE_EXECUTION',
  AUDIT_EVERYTHING = 'AUDIT_EVERYTHING'
}

export enum UpdateScope {
  TEST = 'TEST',
  PAGE = 'PAGE',
  STEP = 'STEP',
  SHARED_GROUP = 'SHARED_GROUP',
  SCHEDULE = 'SCHEDULE',
  REPORTING = 'REPORTING'
}

export interface ReportingPreferences {
  screenshots: boolean;
  video: boolean;
  trace: boolean;
  email: boolean;
  emailRecipients?: string[];
}

export interface OrchestratorArgs {
  testId?: string;
  testName?: string;
  testIds?: string[];
  testNames?: string[];
  testCount?: number;
  testPattern?: string;
  pageName?: string;
  stepId?: string;
  stepName?: string;
  changeRequest?: string;
  schedule?: string;
  timezone?: string;
  reporting?: ReportingPreferences;
  environment?: string;
  parallelExecution?: boolean;
  maxConcurrency?: number;
  batchSize?: number;
}

export interface ParsedIntent {
  primaryAction: PrimaryAction;
  updateScope: UpdateScope | null;
  secondaryActions: string[];
  args: OrchestratorArgs;
  missing: string[];
  question: string | null;
  confidence: number;
  isBulkOperation: boolean;
  estimatedImpact?: {
    affectedTests: number;
    estimatedDuration?: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  metadata?: {
    detectedKeywords: string[];
    processingTime: number;
    modelUsed?: string;
  };
}

export interface AgentOptions {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  enableCache?: boolean;
  cacheTTL?: number;
  enableStreaming?: boolean;
  timeout?: number;
}

export class IntentParserAgent {
  private openai: OpenAI | null = null;
  private options: AgentOptions;
  private cache: Map<string, { result: ParsedIntent; timestamp: number }> = new Map();
  private readonly DEFAULT_CACHE_TTL = 300000; // 5 minutes

  constructor(optionsOrApiKey?: string | AgentOptions) {
    if (typeof optionsOrApiKey === 'string') {
      this.options = { apiKey: optionsOrApiKey };
    } else {
      this.options = optionsOrApiKey || {};
    }

    if (this.options.apiKey) {
      this.openai = new OpenAI({ 
        apiKey: this.options.apiKey,
        timeout: this.options.timeout || 30000
      });
    }

    // Set defaults
    this.options.model = this.options.model || 'gpt-4o';
    this.options.maxTokens = this.options.maxTokens || 1500;
    this.options.temperature = this.options.temperature || 0.1;
    this.options.enableCache = this.options.enableCache ?? true;
    this.options.cacheTTL = this.options.cacheTTL || this.DEFAULT_CACHE_TTL;
  }

  /**
   * Check if the prompt is related to iBotTester
   */
  private isPromptRelatedToIBotTester(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase();
    
    // Keywords related to iBotTester functionality
    const relevantKeywords = [
      'test', 'run', 'execute', 'create', 'update', 'delete', 'schedule',
      'automation', 'api', 'endpoint', 'locator', 'step', 'page',
      'screenshot', 'video', 'trace', 'report', 'assertion', 'validate',
      'selenium', 'playwright', 'webdriver', 'browser', 'click', 'type',
      'navigate', 'element', 'selector', 'wait', 'timeout', 'retry',
      'parallel', 'concurrent', 'batch', 'bulk', 'organize', 'project',
      'environment', 'prod', 'staging', 'dev', 'deployment', 'e2e',
      'integration', 'ui test', 'functional', 'regression', 'smoke',
      'suite', 'scenario', 'workflow', 'heal', 'self-heal', 'audit',
      'ibottester', 'ibot', 'tester'
    ];
    
    // Check if prompt contains any relevant keyword
    const hasRelevantKeyword = relevantKeywords.some(keyword => 
      lowerPrompt.includes(keyword)
    );
    
    // Keywords that indicate non-iBotTester topics
    const irrelevantKeywords = [
      'weather', 'recipe', 'joke', 'story', 'poem', 'song',
      'meaning of life', 'who are you', 'hello', 'hi there',
      'good morning', 'good evening', 'how are you'
    ];
    
    // Check for generic greetings and unrelated topics
    const hasIrrelevantKeyword = irrelevantKeywords.some(keyword => 
      lowerPrompt.includes(keyword)
    );
    
    // Short, generic prompts without test-related context
    const isGenericGreeting = lowerPrompt.length < 30 && (
      lowerPrompt.match(/^(hi|hello|hey|good|thanks|thank you)/)
    );
    
    // If it has irrelevant keywords or is a generic greeting without relevant keywords, it's not related
    if (hasIrrelevantKeyword || (isGenericGreeting && !hasRelevantKeyword)) {
      return false;
    }
    
    // If it has relevant keywords, it's related
    return hasRelevantKeyword;
  }

  /**
   * Parse user prompt to extract ibotTester automation intent
   */
  async parseIntent(prompt: string): Promise<ParsedIntent> {
    const startTime = Date.now();

    // Check if prompt is related to iBotTester
    if (!this.isPromptRelatedToIBotTester(prompt)) {
      return {
        primaryAction: PrimaryAction.PAUSE_AND_ASK,
        updateScope: null,
        secondaryActions: [],
        args: {},
        missing: [],
        question: "I'm iBotTester, a specialized automation testing assistant. I can help you create, run, update, scheanddule,  manage automated tests. Please ask me questions related to test automation, API testing, browser automation, test execution, or test management. How can I assist you with your testing needs?",
        confidence: 1.0,
        isBulkOperation: false,
        metadata: {
          detectedKeywords: ['unrelated-prompt'],
          processingTime: Date.now() - startTime,
          modelUsed: 'scope-validator'
        }
      };
    }

    // Check cache
    if (this.options.enableCache) {
      const cached = this.getFromCache(prompt);
      if (cached) {
        console.log('Cache hit for prompt');
        return cached;
      }
    }

    if (!this.openai) {
      return this.parseIntentBasic(prompt, startTime);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.options.model!,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: this.options.temperature!,
        max_tokens: this.options.maxTokens!,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const parsed = JSON.parse(content);
      const result = this.validateAndEnrichIntent(parsed, startTime, this.options.model!);

      // Cache the result
      if (this.options.enableCache) {
        this.addToCache(prompt, result);
      }

      return result;
    } catch (error) {
      console.error('Intent parsing error:', error);
      return this.parseIntentBasic(prompt, startTime);
    }
  }

  /**
   * Parse multiple prompts in parallel
   */
  async parseIntentBatch(prompts: string[]): Promise<ParsedIntent[]> {
    const maxConcurrent = this.options.maxTokens || 5;
    const results: ParsedIntent[] = [];

    for (let i = 0; i < prompts.length; i += maxConcurrent) {
      const batch = prompts.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(
        batch.map(prompt => this.parseIntent(prompt))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // Implement hit rate tracking if needed
    };
  }

  /**
   * Get from cache if not expired
   */
  private getFromCache(prompt: string): ParsedIntent | null {
    const cached = this.cache.get(prompt);
    if (!cached) return null;

    const now = Date.now();
    const age = now - cached.timestamp;

    if (age > this.options.cacheTTL!) {
      this.cache.delete(prompt);
      return null;
    }

    return cached.result;
  }

  /**
   * Add to cache
   */
  private addToCache(prompt: string, result: ParsedIntent): void {
    this.cache.set(prompt, {
      result,
      timestamp: Date.now()
    });

    // Prevent cache from growing too large
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
  }

  /**
   * Basic intent parsing without AI
   */
  private parseIntentBasic(prompt: string, startTime: number = Date.now()): ParsedIntent {
    const lowerPrompt = prompt.toLowerCase();
    const detectedKeywords: string[] = [];
    
    // Detect primary action
    let primaryAction = PrimaryAction.PAUSE_AND_ASK;
    let updateScope: UpdateScope | null = null;
    const args: OrchestratorArgs = {};
    const missing: string[] = [];
    let question: string | null = null;
    let isBulkOperation = false;

    // Detect bulk operations
    const bulkKeywords = ['multiple', 'bulk', 'batch', 'all', 'several'];
    const hasBulkKeyword = bulkKeywords.some(kw => lowerPrompt.includes(kw));
    
    // Extract test count
    const countMatch = prompt.match(/(\d+)\s+tests?/i);
    if (countMatch) {
      args.testCount = parseInt(countMatch[1]);
      isBulkOperation = true;
      detectedKeywords.push('count');
    }

    // Extract test IDs/names for bulk operations
    const testListMatch = prompt.match(/tests?\s+(?:named\s+)?\[([^\]]+)\]/i);
    if (testListMatch) {
      args.testNames = testListMatch[1].split(',').map(t => t.trim());
      isBulkOperation = true;
      detectedKeywords.push('test-list');
    }

    // Primary action detection
    if (lowerPrompt.includes('create') || lowerPrompt.includes('new test')) {
      primaryAction = hasBulkKeyword || args.testCount || args.testNames ? PrimaryAction.CREATE_BULK : PrimaryAction.CREATE;
      detectedKeywords.push('create');
    } else if (lowerPrompt.includes('update') || lowerPrompt.includes('modify') || lowerPrompt.includes('change')) {
      primaryAction = PrimaryAction.UPDATE;
      
      // Detect update scope
      if (lowerPrompt.includes('step')) {
        updateScope = UpdateScope.STEP;
        args.stepName = this.extractEntityName(prompt, ['step']);
      } else if (lowerPrompt.includes('page')) {
        updateScope = UpdateScope.PAGE;
        args.pageName = this.extractEntityName(prompt, ['page']);
      } else if (lowerPrompt.includes('shared') || lowerPrompt.includes('group')) {
        updateScope = UpdateScope.SHARED_GROUP;
        args.pageName = this.extractEntityName(prompt, ['group', 'shared']);
      } else if (lowerPrompt.includes('schedule') || lowerPrompt.includes('cron')) {
        updateScope = UpdateScope.SCHEDULE;
        args.schedule = this.extractSchedule(prompt);
      } else if (lowerPrompt.includes('report') || lowerPrompt.includes('video') || lowerPrompt.includes('screenshot')) {
        updateScope = UpdateScope.REPORTING;
        args.reporting = this.extractReportingPreferences(prompt);
      } else if (lowerPrompt.includes('test')) {
        updateScope = UpdateScope.TEST;
        args.testName = this.extractEntityName(prompt, ['test']);
      } else {
        primaryAction = PrimaryAction.PAUSE_AND_ASK;
        question = 'Which test and what exactly should be updated (step, page, schedule, or report)?';
      }
    } else if (lowerPrompt.includes('delete') || lowerPrompt.includes('remove')) {
      primaryAction = hasBulkKeyword || args.testIds || args.testNames ? PrimaryAction.DELETE_BULK : PrimaryAction.DELETE;
      detectedKeywords.push('delete');
    } else if (lowerPrompt.includes('run') || lowerPrompt.includes('execute')) {
      primaryAction = hasBulkKeyword || args.testIds || args.testNames ? PrimaryAction.RUN_BULK : PrimaryAction.RUN;
      detectedKeywords.push('run');
    } else if (lowerPrompt.includes('schedule')) {
      primaryAction = PrimaryAction.SCHEDULE;
      detectedKeywords.push('schedule');
    } else if (lowerPrompt.includes('organize')) {
      primaryAction = PrimaryAction.ORGANIZE;
      detectedKeywords.push('organize');
    }

    // Detect parallel execution preferences
    if (lowerPrompt.includes('parallel') || lowerPrompt.includes('concurrent')) {
      args.parallelExecution = true;
      detectedKeywords.push('parallel');
      
      const concurrencyMatch = prompt.match(/(?:max\s+)?concurrency\s+(\d+)/i);
      if (concurrencyMatch) {
        args.maxConcurrency = parseInt(concurrencyMatch[1]);
      }
    }

    // Extract test identification
    args.testName = this.extractEntityName(prompt, ['test']);
    
    // Check for environment
    if (lowerPrompt.includes('prod') || lowerPrompt.includes('production')) {
      args.environment = 'PROD';
      primaryAction = PrimaryAction.PAUSE_AND_ASK;
      question = 'You are targeting PROD environment. Please confirm this action is safe and intended.';
    }

    // Detect missing information
    if (primaryAction === PrimaryAction.UPDATE && !args.testName && !updateScope) {
      missing.push('testId or testName');
      primaryAction = PrimaryAction.PAUSE_AND_ASK;
      question = 'Which test should be updated?';
    }

    const secondaryActions = this.attachSecondaryActions(primaryAction);
    const processingTime = Date.now() - startTime;

    return {
      primaryAction,
      updateScope,
      secondaryActions,
      args,
      missing,
      question,
      confidence: 0.7,
      isBulkOperation,
      estimatedImpact: this.estimateImpact(primaryAction, args, isBulkOperation),
      metadata: {
        detectedKeywords,
        processingTime,
        modelUsed: 'rule-based'
      }
    };
  }

  /**
   * Estimate impact of the operation
   */
  private estimateImpact(
    primaryAction: PrimaryAction,
    args: OrchestratorArgs,
    isBulkOperation: boolean
  ): { affectedTests: number; estimatedDuration?: string; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' } {
    let affectedTests = 1;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

    if (isBulkOperation) {
      affectedTests = args.testCount || args.testNames?.length || args.testIds?.length || 10;
      riskLevel = affectedTests > 50 ? 'CRITICAL' : affectedTests > 20 ? 'HIGH' : 'MEDIUM';
    }

    if (args.environment === 'PROD') {
      riskLevel = 'CRITICAL';
    }

    if ([PrimaryAction.DELETE, PrimaryAction.DELETE_BULK].includes(primaryAction)) {
      riskLevel = affectedTests > 1 ? 'HIGH' : 'MEDIUM';
    }

    const estimatedDuration = affectedTests > 10 
      ? `${Math.ceil(affectedTests * 2)} - ${Math.ceil(affectedTests * 5)} minutes`
      : affectedTests > 1 
      ? `${affectedTests * 2} - ${affectedTests * 3} minutes`
      : '1-2 minutes';

    return { affectedTests, estimatedDuration, riskLevel };
  }

  /**
   * Attach required secondary actions based on primary action
   */
  private attachSecondaryActions(primaryAction: PrimaryAction): string[] {
    const secondaryMap: Record<string, string[]> = {
      [PrimaryAction.CREATE]: [
        'GENERATE_DATA',
        'HEAL_LOCATORS',
        'VALIDATE_BUSINESS_OUTCOMES',
        'REPORT_WITH_EVIDENCE',
        'SECURE_EXECUTION',
        'AUDIT_EVERYTHING'
      ],
      [PrimaryAction.CREATE_BULK]: [
        'GENERATE_DATA',
        'HEAL_LOCATORS',
        'VALIDATE_BUSINESS_OUTCOMES',
        'REPORT_WITH_EVIDENCE',
        'SECURE_EXECUTION',
        'AUDIT_EVERYTHING'
      ],
      [PrimaryAction.UPDATE]: [
        'HEAL_LOCATORS',
        'VALIDATE_BUSINESS_OUTCOMES',
        'REPORT_WITH_EVIDENCE',
        'SECURE_EXECUTION',
        'AUDIT_EVERYTHING'
      ],
      [PrimaryAction.DELETE]: [
        'SECURE_EXECUTION',
        'AUDIT_EVERYTHING'
      ],
      [PrimaryAction.DELETE_BULK]: [
        'SECURE_EXECUTION',
        'AUDIT_EVERYTHING'
      ],
      [PrimaryAction.RUN]: [
        'RETRY_INTELLIGENTLY',
        'HEAL_LOCATORS',
        'VALIDATE_BUSINESS_OUTCOMES',
        'REPORT_WITH_EVIDENCE',
        'SECURE_EXECUTION',
        'AUDIT_EVERYTHING'
      ],
      [PrimaryAction.RUN_BULK]: [
        'RETRY_INTELLIGENTLY',
        'HEAL_LOCATORS',
        'VALIDATE_BUSINESS_OUTCOMES',
        'REPORT_WITH_EVIDENCE',
        'SECURE_EXECUTION',
        'AUDIT_EVERYTHING'
      ],
      [PrimaryAction.SCHEDULE]: [
        'SECURE_EXECUTION',
        'AUDIT_EVERYTHING',
        'REPORT_WITH_EVIDENCE'
      ],
      [PrimaryAction.ORGANIZE]: [
        'AUDIT_EVERYTHING'
      ]
    };

    return secondaryMap[primaryAction] || [];
  }

  /**
   * Extract entity name from prompt
   */
  private extractEntityName(prompt: string, keywords: string[]): string | undefined {
    for (const keyword of keywords) {
      const pattern = new RegExp(`${keyword}\\s+["']?([\\w\\s-]+)["']?`, 'i');
      const match = prompt.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  /**
   * Extract schedule information
   */
  private extractSchedule(prompt: string): string | undefined {
    const patterns = [
      /daily\s+(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
      /weekly\s+(?:on\s+)?(\w+)?/i,
      /hourly/i,
      /every\s+(\d+)\s+(minute|hour|day)/i
    ];

    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match) {
        return match[0];
      }
    }
    return undefined;
  }

  /**
   * Extract reporting preferences
   */
  private extractReportingPreferences(prompt: string): ReportingPreferences {
    const lowerPrompt = prompt.toLowerCase();
    
    const preferences: ReportingPreferences = {
      screenshots: false,
      video: false,
      trace: false,
      email: false
    };

    if (lowerPrompt.includes('video only')) {
      preferences.video = true;
    } else if (lowerPrompt.includes('screenshots only')) {
      preferences.screenshots = true;
    } else {
      preferences.screenshots = lowerPrompt.includes('screenshot');
      preferences.video = lowerPrompt.includes('video');
      preferences.trace = lowerPrompt.includes('trace');
    }

    if (lowerPrompt.includes('email')) {
      preferences.email = true;
      // Extract email recipients
      const emailPattern = /(?:email\s+(?:to\s+)?|recipients?\s+)([a-zA-Z0-9._%+-@,\s]+)/i;
      const match = prompt.match(emailPattern);
      if (match) {
        preferences.emailRecipients = match[1]
          .split(/[,\s]+/)
          .filter(email => email.includes('@'));
      }
    }

    return preferences;
  }

  /**
   * Validate and enrich parsed intent
   */
  private validateAndEnrichIntent(
    parsed: any,
    startTime: number = Date.now(),
    modelUsed: string = 'ai'
  ): ParsedIntent {
    // Ensure secondary actions are attached
    if (!parsed.secondaryActions || parsed.secondaryActions.length === 0) {
      parsed.secondaryActions = this.attachSecondaryActions(parsed.primaryAction);
    }

    // Detect bulk operations
    const isBulkOperation = 
      parsed.primaryAction === PrimaryAction.CREATE_BULK ||
      parsed.primaryAction === PrimaryAction.RUN_BULK ||
      parsed.primaryAction === PrimaryAction.DELETE_BULK ||
      Boolean(parsed.args?.testCount) ||
      Boolean(parsed.args?.testNames?.length > 1) ||
      Boolean(parsed.args?.testIds?.length > 1);

    parsed.isBulkOperation = isBulkOperation;

    // Add impact estimation if not present
    if (!parsed.estimatedImpact) {
      parsed.estimatedImpact = this.estimateImpact(
        parsed.primaryAction,
        parsed.args || {},
        isBulkOperation
      );
    }

    // Add metadata if not present
    if (!parsed.metadata) {
      parsed.metadata = {
        detectedKeywords: [],
        processingTime: Date.now() - startTime,
        modelUsed
      };
    }

    // Validate reporting preferences
    if (parsed.args?.reporting) {
      const hasNoReporting = !parsed.args.reporting.screenshots && 
                            !parsed.args.reporting.video && 
                            !parsed.args.reporting.trace;
      
      if (hasNoReporting && parsed.primaryAction !== PrimaryAction.PAUSE_AND_ASK) {
        parsed.primaryAction = PrimaryAction.PAUSE_AND_ASK;
        parsed.question = 'ibotTester requires evidence. Please specify at least one reporting option (screenshots, video, or trace).';
      }
    }

    // Validate bulk operations
    if (isBulkOperation && parsed.estimatedImpact.affectedTests > 100) {
      parsed.primaryAction = PrimaryAction.PAUSE_AND_ASK;
      parsed.question = `You are about to affect ${parsed.estimatedImpact.affectedTests} tests. This is a high-impact operation. Please confirm.`;
    }

    return parsed as ParsedIntent;
  }

  /**
   * Get system prompt for AI
   */
  private getSystemPrompt(): string {
    return `You are the "ibotTester Automation Agent Orchestrator".

Your task: take a user prompt and map it to ibotTester automation actions with fine-grained UPDATE support.

You must classify the prompt into ONE primary action and multiple secondary actions from this fixed taxonomy:

ACTIONS = [
  CREATE, UPDATE, DELETE, RUN, SCHEDULE, ORGANIZE,
  GENERATE_DATA, HEAL_LOCATORS, PAUSE_AND_ASK, RETRY_INTELLIGENTLY,
  VALIDATE_BUSINESS_OUTCOMES, REPORT_WITH_EVIDENCE, SECURE_EXECUTION, AUDIT_EVERYTHING
]

PRIMARY GOALS:
1) Identify PRIMARY action (CREATE | CREATE_BULK | UPDATE | DELETE | DELETE_BULK | RUN | RUN_BULK | SCHEDULE | ORGANIZE | PAUSE_AND_ASK)
2) Detect BULK operations (multiple tests, batch processing)
3) Detect UPDATE SCOPE precisely:
   - TEST: entire test modification
   - PAGE: specific page/group changes
   - STEP: specific step updates
   - SHARED_GROUP: reusable page/steps
   - SCHEDULE: schedule modifications
   - REPORTING: reporting preferences
3) Auto-attach REQUIRED secondary actions
4) If unclear → PAUSE_AND_ASK with ONE focused question
5) Return ONLY JSON (no explanation text)

JSON OUTPUT SCHEMA:
{
  "primaryAction": "CREATE|CREATE_BULK|UPDATE|DELETE|DELETE_BULK|RUN|RUN_BULK|SCHEDULE|ORGANIZE|PAUSE_AND_ASK",
  "updateScope": "TEST|PAGE|STEP|SHARED_GROUP|SCHEDULE|REPORTING|null",
  "secondaryActions": ["string"],
  "isBulkOperation": boolean,
  "args": {
    "testId": "string",
    "testName": "string",
    "testIds": ["string"],
    "testNames": ["string"],
    "testCount": number,
    "parallelExecution": boolean,
    "maxConcurrency": number,
    "pageName": "string",
    "stepId": "string",
    "stepName": "string",
    "changeRequest": "string",
    "schedule": "string",
    "timezone": "string",
    "reporting": {
      "screenshots": boolean,
      "video": boolean,
      "trace": boolean,
      "email": boolean,
      "emailRecipients": ["string"]
    },
    "environment": "string"
  },
  "missing": ["string"],
  "question": "string|null",
  "confidence": number
}

SECONDARY ACTION RULES:
- CREATE → GENERATE_DATA, HEAL_LOCATORS, VALIDATE_BUSINESS_OUTCOMES, REPORT_WITH_EVIDENCE, SECURE_EXECUTION, AUDIT_EVERYTHING
- UPDATE → HEAL_LOCATORS, VALIDATE_BUSINESS_OUTCOMES, REPORT_WITH_EVIDENCE, SECURE_EXECUTION, AUDIT_EVERYTHING
- DELETE → SECURE_EXECUTION, AUDIT_EVERYTHING
- RUN → RETRY_INTELLIGENTLY, HEAL_LOCATORS, VALIDATE_BUSINESS_OUTCOMES, REPORT_WITH_EVIDENCE, SECURE_EXECUTION, AUDIT_EVERYTHING
- SCHEDULE → SECURE_EXECUTION, AUDIT_EVERYTHING, REPORT_WITH_EVIDENCE
- ORGANIZE → AUDIT_EVERYTHING

CLARIFY RULES (set primaryAction = PAUSE_AND_ASK when):
- testId/testName missing for UPDATE/DELETE/RUN/SCHEDULE
- step/page/group referenced but not identified
- reporting preference ambiguous
- risky execution (prod, sensitive data)

SECURITY RULE:
If environment is PROD or sensitive data mentioned → PAUSE_AND_ASK for confirmation

Return ONLY valid JSON. No markdown, no explanation.`;
  }

  /**
   * Check if AI is available
   */
  isAIAvailable(): boolean {
    return this.openai !== null;
  }
}
