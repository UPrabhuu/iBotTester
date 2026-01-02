import { IntentParserAgent, ParsedIntent } from './IntentParserAgent';
import { PlaywrightDiscoveryAgent, DiscoveredPage, DiscoveryOptions } from './PlaywrightDiscoveryAgent';
import { TestModelGenerator, TestModel, GeneratorOptions } from './TestModelGenerator';

/**
 * Complete workflow result
 */
export interface WorkflowResult {
  success: boolean;
  userPrompt: string;
  intent: ParsedIntent;
  discoveredPage?: DiscoveredPage;
  testModel?: TestModel;
  error?: string;
  metadata: {
    totalTime: number;
    intentParseTime?: number;
    discoveryTime?: number;
    generationTime?: number;
  };
}

/**
 * Workflow execution options
 */
export interface WorkflowOptions {
  // Intent parsing options
  openaiApiKey?: string;
  
  // Discovery options
  discoveryOptions?: Partial<DiscoveryOptions>;
  
  // Test generation options
  generatorOptions?: GeneratorOptions;
  
  // General options
  skipDiscoveryIfNoUrl?: boolean;
  verbose?: boolean;
}

/**
 * AgentWorkflow
 * Orchestrates the complete flow: User Prompt → Intent + Plan → Playwright Discover → Test Model (JSON)
 */
export class AgentWorkflow {
  private intentParser: IntentParserAgent;
  private discoveryAgent: PlaywrightDiscoveryAgent;
  private testGenerator: TestModelGenerator;
  private verbose: boolean;

  constructor(options: WorkflowOptions = {}) {
    this.intentParser = new IntentParserAgent(options.openaiApiKey);
    this.discoveryAgent = new PlaywrightDiscoveryAgent();
    this.testGenerator = new TestModelGenerator();
    this.verbose = options.verbose ?? false;
  }

  /**
   * Execute the complete workflow
   */
  async execute(
    userPrompt: string,
    targetUrl?: string,
    options: WorkflowOptions = {}
  ): Promise<WorkflowResult> {
    const startTime = Date.now();
    const metadata: WorkflowResult['metadata'] = { totalTime: 0 };

    try {
      this.log('🚀 Starting Agent Workflow');
      this.log(`📝 User Prompt: "${userPrompt}"`);

      // Step 1: Parse Intent
      this.log('\n🧠 Step 1: Parsing Intent...');
      const intentStartTime = Date.now();
      const intent = await this.intentParser.parseIntent(userPrompt);
      metadata.intentParseTime = Date.now() - intentStartTime;

      this.log(`✅ Intent Parsed:`);
      this.log(`   - Primary Action: ${intent.primaryAction}`);
      this.log(`   - Confidence: ${(intent.confidence * 100).toFixed(1)}%`);
      this.log(`   - Bulk Operation: ${intent.isBulkOperation ? 'Yes' : 'No'}`);

      if (intent.question) {
        this.log(`   ⚠️  Question: ${intent.question}`);
        return {
          success: false,
          userPrompt,
          intent,
          error: intent.question,
          metadata: { ...metadata, totalTime: Date.now() - startTime },
        };
      }

      // Step 2: Discover Page with Playwright
      let discoveredPage: DiscoveredPage | undefined;
      
      // Determine URL for discovery
      const urlForDiscovery = targetUrl || this.extractUrlFromIntent(intent, userPrompt);

      if (urlForDiscovery) {
        this.log(`\n🔍 Step 2: Discovering Page Elements at ${urlForDiscovery}...`);
        const discoveryStartTime = Date.now();

        const discoveryOpts: DiscoveryOptions = {
          url: urlForDiscovery,
          waitTimeout: 30000,
          includeHidden: false,
          captureScreenshots: options.generatorOptions?.includeScreenshots ?? true,
          ...options.discoveryOptions,
        };

        discoveredPage = await this.discoveryAgent.discoverPage(discoveryOpts);
        metadata.discoveryTime = Date.now() - discoveryStartTime;

        this.log(`✅ Page Discovered:`);
        this.log(`   - Title: ${discoveredPage.title}`);
        this.log(`   - Elements Found: ${discoveredPage.metadata.elementCount}`);
        this.log(`   - Buttons: ${discoveredPage.elements.buttons.length}`);
        this.log(`   - Inputs: ${discoveredPage.elements.inputs.length}`);
        this.log(`   - Links: ${discoveredPage.elements.links.length}`);
        this.log(`   - Has Form: ${discoveredPage.metadata.hasForm ? 'Yes' : 'No'}`);
        this.log(`   - Discovery Time: ${metadata.discoveryTime}ms`);
      } else if (!options.skipDiscoveryIfNoUrl) {
        return {
          success: false,
          userPrompt,
          intent,
          error: 'No URL provided for page discovery. Please specify a target URL.',
          metadata: { ...metadata, totalTime: Date.now() - startTime },
        };
      } else {
        this.log('\n⚠️  Step 2: Skipped (No URL provided)');
      }

      // Step 3: Generate Test Model
      if (!discoveredPage) {
        return {
          success: false,
          userPrompt,
          intent,
          error: 'Page discovery required for test model generation',
          metadata: { ...metadata, totalTime: Date.now() - startTime },
        };
      }

      this.log('\n📋 Step 3: Generating Test Model...');
      const generationStartTime = Date.now();

      const testModel = await this.testGenerator.generateTestModel(
        userPrompt,
        intent,
        discoveredPage,
        options.generatorOptions
      );
      metadata.generationTime = Date.now() - generationStartTime;

      this.log(`✅ Test Model Generated:`);
      this.log(`   - Test Cases: ${testModel.testCases.length}`);
      this.log(`   - Total Steps: ${testModel.testCases.reduce((sum, tc) => sum + tc.steps.length, 0)}`);
      this.log(`   - Estimated Duration: ${testModel.testCases.reduce((sum, tc) => sum + (tc.estimatedDuration || 0), 0)}s`);
      this.log(`   - Generation Time: ${metadata.generationTime}ms`);

      metadata.totalTime = Date.now() - startTime;

      this.log(`\n✨ Workflow Completed Successfully in ${metadata.totalTime}ms`);

      return {
        success: true,
        userPrompt,
        intent,
        discoveredPage,
        testModel,
        metadata,
      };
    } catch (error) {
      metadata.totalTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.log(`\n❌ Workflow Failed: ${errorMessage}`);

      return {
        success: false,
        userPrompt,
        intent: await this.intentParser.parseIntent(userPrompt),
        error: errorMessage,
        metadata,
      };
    }
  }

  /**
   * Execute workflow and return JSON test model
   */
  async executeAndGetJSON(
    userPrompt: string,
    targetUrl?: string,
    options: WorkflowOptions = {}
  ): Promise<string> {
    const result = await this.execute(userPrompt, targetUrl, options);

    if (!result.success || !result.testModel) {
      throw new Error(result.error || 'Failed to generate test model');
    }

    return this.testGenerator.exportToJSON(result.testModel);
  }

  /**
   * Execute workflow in batch for multiple prompts
   */
  async executeBatch(
    prompts: Array<{ prompt: string; url?: string }>,
    options: WorkflowOptions = {}
  ): Promise<WorkflowResult[]> {
    this.log(`\n🔄 Starting Batch Workflow (${prompts.length} prompts)`);
    
    const results: WorkflowResult[] = [];

    for (let i = 0; i < prompts.length; i++) {
      this.log(`\n[${ i + 1}/${prompts.length}] Processing: "${prompts[i].prompt}"`);
      const result = await this.execute(prompts[i].prompt, prompts[i].url, options);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    this.log(`\n✨ Batch Completed: ${successCount}/${prompts.length} successful`);

    return results;
  }

  /**
   * Parse intent only (without discovery/generation)
   */
  async parseIntentOnly(userPrompt: string): Promise<ParsedIntent> {
    return this.intentParser.parseIntent(userPrompt);
  }

  /**
   * Discover page only (without intent parsing)
   */
  async discoverPageOnly(url: string, options?: Partial<DiscoveryOptions>): Promise<DiscoveredPage> {
    const discoveryOpts: DiscoveryOptions = {
      url,
      waitTimeout: 30000,
      includeHidden: false,
      captureScreenshots: true,
      ...options,
    };

    return this.discoveryAgent.discoverPage(discoveryOpts);
  }

  /**
   * Generate test model only (with pre-parsed intent and discovered page)
   */
  async generateTestModelOnly(
    userPrompt: string,
    intent: ParsedIntent,
    discoveredPage: DiscoveredPage,
    options?: GeneratorOptions
  ): Promise<TestModel> {
    return this.testGenerator.generateTestModel(userPrompt, intent, discoveredPage, options);
  }

  /**
   * Extract URL from intent or prompt
   */
  private extractUrlFromIntent(intent: ParsedIntent, userPrompt: string): string | undefined {
    // Check if URL is in args
    if (intent.args && typeof intent.args === 'object') {
      const args = intent.args as any;
      if (args.url) return args.url;
      if (args.baseUrl) return args.baseUrl;
    }

    // Try to extract URL from prompt using regex
    const urlPattern = /(https?:\/\/[^\s]+)/gi;
    const matches = userPrompt.match(urlPattern);
    
    if (matches && matches.length > 0) {
      return matches[0];
    }

    return undefined;
  }

  /**
   * Log message if verbose mode is enabled
   */
  private log(message: string): void {
    if (this.verbose) {
      console.log(message);
    }
  }

  /**
   * Check if all required services are available
   */
  healthCheck(): {
    intentParser: boolean;
    discoveryAgent: boolean;
    testGenerator: boolean;
    openAI: boolean;
  } {
    return {
      intentParser: !!this.intentParser,
      discoveryAgent: !!this.discoveryAgent,
      testGenerator: !!this.testGenerator,
      openAI: this.intentParser.isAIAvailable(),
    };
  }
}
