import { DiscoveredPage, DiscoveredElement } from './PlaywrightDiscoveryAgent';
import { ParsedIntent, PrimaryAction } from './IntentParserAgent';

/**
 * Represents a single test step
 */
export interface TestStep {
  stepId: string;
  order: number;
  action: 'navigate' | 'click' | 'type' | 'select' | 'check' | 'uncheck' | 'hover' | 'wait' | 'assert' | 'screenshot';
  description: string;
  element?: {
    locator: string;
    strategy: string;
    fallbackLocators?: string[];
  };
  data?: {
    value?: string;
    text?: string;
    url?: string;
    timeout?: number;
    condition?: string;
  };
  validation?: {
    type: 'visible' | 'text' | 'value' | 'enabled' | 'checked' | 'url' | 'title';
    expected: any;
    operator?: 'equals' | 'contains' | 'matches' | 'greaterThan' | 'lessThan';
  };
  screenshot?: boolean;
  continueOnError?: boolean;
}

/**
 * Represents a test case in the model
 */
export interface TestCase {
  testId: string;
  testName: string;
  description: string;
  tags: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  steps: TestStep[];
  preconditions?: string[];
  expectedOutcome: string;
  estimatedDuration?: number; // in seconds
}

/**
 * Represents the complete test model
 */
export interface TestModel {
  modelVersion: string;
  generatedAt: string;
  intent: {
    userPrompt: string;
    primaryAction: string;
    confidence: number;
  };
  pageContext: {
    url: string;
    title: string;
    elementCount: number;
    hasForm: boolean;
    hasNavigation: boolean;
  };
  testCases: TestCase[];
  sharedData?: {
    baseUrl?: string;
    credentials?: {
      usernameField?: string;
      passwordField?: string;
    };
    commonValidations?: any[];
  };
  configuration: {
    browser: string;
    headless: boolean;
    viewport: { width: number; height: number };
    timeout: number;
    retries: number;
    screenshots: boolean;
    video: boolean;
    trace: boolean;
  };
  metadata: {
    generationTime: number;
    agentVersion: string;
    discoveredElements: number;
  };
}

/**
 * Options for test model generation
 */
export interface GeneratorOptions {
  includeScreenshots?: boolean;
  includeValidations?: boolean;
  generateMultipleScenarios?: boolean;
  maxStepsPerTest?: number;
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * TestModelGenerator
 * Generates structured JSON test models from intent and discovered page elements
 */
export class TestModelGenerator {
  private modelVersion = '1.0.0';
  private agentVersion = '1.0.0';

  /**
   * Generate a complete test model from intent and discovered page
   */
  async generateTestModel(
    userPrompt: string,
    intent: ParsedIntent,
    discoveredPage: DiscoveredPage,
    options: GeneratorOptions = {}
  ): Promise<TestModel> {
    const startTime = Date.now();

    // Apply defaults
    const opts: Required<GeneratorOptions> = {
      includeScreenshots: options.includeScreenshots ?? true,
      includeValidations: options.includeValidations ?? true,
      generateMultipleScenarios: options.generateMultipleScenarios ?? false,
      maxStepsPerTest: options.maxStepsPerTest ?? 20,
      priority: options.priority ?? 'medium',
    };

    // Generate test cases based on intent
    const testCases = await this.generateTestCases(
      userPrompt,
      intent,
      discoveredPage,
      opts
    );

    // Build test model
    const testModel: TestModel = {
      modelVersion: this.modelVersion,
      generatedAt: new Date().toISOString(),
      intent: {
        userPrompt,
        primaryAction: intent.primaryAction,
        confidence: intent.confidence,
      },
      pageContext: {
        url: discoveredPage.url,
        title: discoveredPage.title,
        elementCount: discoveredPage.metadata.elementCount,
        hasForm: discoveredPage.metadata.hasForm,
        hasNavigation: discoveredPage.metadata.hasNavigation,
      },
      testCases,
      sharedData: this.extractSharedData(discoveredPage),
      configuration: {
        browser: 'chromium',
        headless: true,
        viewport: discoveredPage.viewport,
        timeout: 30000,
        retries: 2,
        screenshots: opts.includeScreenshots,
        video: intent.args.reporting?.video ?? false,
        trace: intent.args.reporting?.trace ?? false,
      },
      metadata: {
        generationTime: Date.now() - startTime,
        agentVersion: this.agentVersion,
        discoveredElements: discoveredPage.metadata.elementCount,
      },
    };

    return testModel;
  }

  /**
   * Generate test cases based on intent
   */
  private async generateTestCases(
    userPrompt: string,
    intent: ParsedIntent,
    discoveredPage: DiscoveredPage,
    options: Required<GeneratorOptions>
  ): Promise<TestCase[]> {
    const testCases: TestCase[] = [];

    // Determine test scenarios based on primary action
    switch (intent.primaryAction) {
      case PrimaryAction.CREATE:
      case PrimaryAction.CREATE_BULK:
        testCases.push(
          ...this.generateFormSubmissionTests(userPrompt, discoveredPage, options)
        );
        break;

      case PrimaryAction.RUN:
      case PrimaryAction.RUN_BULK:
        testCases.push(
          ...this.generateNavigationTests(userPrompt, discoveredPage, options)
        );
        break;

      case PrimaryAction.UPDATE:
        testCases.push(
          ...this.generateUpdateTests(userPrompt, discoveredPage, intent, options)
        );
        break;

      default:
        testCases.push(
          ...this.generateGenericTests(userPrompt, discoveredPage, options)
        );
    }

    return testCases;
  }

  /**
   * Generate form submission test cases
   */
  private generateFormSubmissionTests(
    userPrompt: string,
    discoveredPage: DiscoveredPage,
    options: Required<GeneratorOptions>
  ): TestCase[] {
    const testCases: TestCase[] = [];
    
    if (!discoveredPage.metadata.hasForm) {
      // No form found, generate navigation test instead
      return this.generateNavigationTests(userPrompt, discoveredPage, options);
    }

    // Main form submission test
    const steps: TestStep[] = [];
    let stepOrder = 1;

    // Add navigation step
    steps.push({
      stepId: `step-${stepOrder}`,
      order: stepOrder++,
      action: 'navigate',
      description: `Navigate to ${discoveredPage.title}`,
      data: { url: discoveredPage.url },
      screenshot: options.includeScreenshots,
    });

    // Find and fill input fields
    const inputs = discoveredPage.elements.inputs.filter(e => e.visible && e.enabled);
    for (const input of inputs.slice(0, 10)) { // Limit to 10 inputs
      const stepId = `step-${stepOrder}`;
      
      if (input.type === 'checkbox') {
        steps.push({
          stepId,
          order: stepOrder++,
          action: 'check',
          description: `Check ${input.ariaLabel || input.name || 'checkbox'}`,
          element: {
            locator: input.recommended.locator,
            strategy: input.recommended.strategy,
            fallbackLocators: input.alternatives.map(a => a.locator),
          },
          screenshot: false,
        });
      } else if (input.type === 'radio') {
        steps.push({
          stepId,
          order: stepOrder++,
          action: 'click',
          description: `Select ${input.ariaLabel || input.name || 'radio option'}`,
          element: {
            locator: input.recommended.locator,
            strategy: input.recommended.strategy,
            fallbackLocators: input.alternatives.map(a => a.locator),
          },
          screenshot: false,
        });
      } else {
        const fieldName = input.ariaLabel || input.placeholder || input.name || 'field';
        steps.push({
          stepId,
          order: stepOrder++,
          action: 'type',
          description: `Enter value in ${fieldName}`,
          element: {
            locator: input.recommended.locator,
            strategy: input.recommended.strategy,
            fallbackLocators: input.alternatives.map(a => a.locator),
          },
          data: {
            value: this.generateSampleData(input),
          },
          screenshot: false,
        });
      }
    }

    // Find and click submit button
    const submitButton = discoveredPage.elements.buttons.find(
      b => b.type === 'submit' || 
           b.text?.toLowerCase().includes('submit') ||
           b.text?.toLowerCase().includes('save') ||
           b.text?.toLowerCase().includes('create')
    );

    if (submitButton) {
      steps.push({
        stepId: `step-${stepOrder}`,
        order: stepOrder++,
        action: 'click',
        description: `Click ${submitButton.text || 'submit button'}`,
        element: {
          locator: submitButton.recommended.locator,
          strategy: submitButton.recommended.strategy,
          fallbackLocators: submitButton.alternatives.map(a => a.locator),
        },
        screenshot: options.includeScreenshots,
      });
    }

    // Add validation if enabled
    if (options.includeValidations) {
      steps.push({
        stepId: `step-${stepOrder}`,
        order: stepOrder++,
        action: 'wait',
        description: 'Wait for form submission',
        data: { timeout: 5000 },
        screenshot: options.includeScreenshots,
      });
    }

    testCases.push({
      testId: `test-${Date.now()}-form-submit`,
      testName: 'Form Submission Test',
      description: `Test form submission on ${discoveredPage.title}`,
      tags: ['form', 'submission', 'create'],
      priority: options.priority,
      steps,
      expectedOutcome: 'Form should be submitted successfully',
      estimatedDuration: steps.length * 3,
    });

    return testCases;
  }

  /**
   * Generate navigation test cases
   */
  private generateNavigationTests(
    userPrompt: string,
    discoveredPage: DiscoveredPage,
    options: Required<GeneratorOptions>
  ): TestCase[] {
    const testCases: TestCase[] = [];
    const steps: TestStep[] = [];
    let stepOrder = 1;

    // Navigate to page
    steps.push({
      stepId: `step-${stepOrder}`,
      order: stepOrder++,
      action: 'navigate',
      description: `Navigate to ${discoveredPage.title}`,
      data: { url: discoveredPage.url },
      screenshot: options.includeScreenshots,
    });

    // Verify page title
    if (options.includeValidations) {
      steps.push({
        stepId: `step-${stepOrder}`,
        order: stepOrder++,
        action: 'assert',
        description: 'Verify page title',
        validation: {
          type: 'title',
          expected: discoveredPage.title,
          operator: 'equals',
        },
        screenshot: false,
      });
    }

    // Click through main navigation links
    const mainLinks = discoveredPage.elements.links
      .filter(l => l.visible && l.text && l.text.length < 30)
      .slice(0, 5); // Limit to 5 links

    for (const link of mainLinks) {
      steps.push({
        stepId: `step-${stepOrder}`,
        order: stepOrder++,
        action: 'click',
        description: `Click on ${link.text}`,
        element: {
          locator: link.recommended.locator,
          strategy: link.recommended.strategy,
          fallbackLocators: link.alternatives.map(a => a.locator),
        },
        screenshot: options.includeScreenshots,
      });

      // Wait after navigation
      steps.push({
        stepId: `step-${stepOrder}`,
        order: stepOrder++,
        action: 'wait',
        description: 'Wait for page load',
        data: { timeout: 2000 },
        screenshot: false,
      });
    }

    testCases.push({
      testId: `test-${Date.now()}-navigation`,
      testName: 'Navigation Test',
      description: `Test navigation flows on ${discoveredPage.title}`,
      tags: ['navigation', 'links', 'ui'],
      priority: options.priority,
      steps,
      expectedOutcome: 'All navigation links should work correctly',
      estimatedDuration: steps.length * 2,
    });

    return testCases;
  }

  /**
   * Generate update test cases
   */
  private generateUpdateTests(
    userPrompt: string,
    discoveredPage: DiscoveredPage,
    intent: ParsedIntent,
    options: Required<GeneratorOptions>
  ): TestCase[] {
    // For updates, generate tests based on the change request
    const steps: TestStep[] = [];
    let stepOrder = 1;

    // Navigate
    steps.push({
      stepId: `step-${stepOrder}`,
      order: stepOrder++,
      action: 'navigate',
      description: `Navigate to ${discoveredPage.title}`,
      data: { url: discoveredPage.url },
      screenshot: options.includeScreenshots,
    });

    // Find and interact with elements mentioned in the change request
    const changeRequest = intent.args.changeRequest || userPrompt;
    const relevantElements = this.findRelevantElements(changeRequest, discoveredPage);

    for (const element of relevantElements.slice(0, 5)) {
      const action = this.determineActionForElement(element, changeRequest);
      steps.push({
        stepId: `step-${stepOrder}`,
        order: stepOrder++,
        action,
        description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${element.text || element.ariaLabel || 'element'}`,
        element: {
          locator: element.recommended.locator,
          strategy: element.recommended.strategy,
          fallbackLocators: element.alternatives.map(a => a.locator),
        },
        data: action === 'type' ? { value: 'Updated value' } : undefined,
        screenshot: options.includeScreenshots,
      });
    }

    return [{
      testId: `test-${Date.now()}-update`,
      testName: 'Update Test',
      description: `Test update operations on ${discoveredPage.title}`,
      tags: ['update', 'modify'],
      priority: options.priority,
      steps,
      expectedOutcome: 'Update should be applied successfully',
      estimatedDuration: steps.length * 3,
    }];
  }

  /**
   * Generate generic test cases
   */
  private generateGenericTests(
    userPrompt: string,
    discoveredPage: DiscoveredPage,
    options: Required<GeneratorOptions>
  ): TestCase[] {
    const steps: TestStep[] = [];
    let stepOrder = 1;

    // Basic page load test
    steps.push({
      stepId: `step-${stepOrder}`,
      order: stepOrder++,
      action: 'navigate',
      description: `Navigate to ${discoveredPage.title}`,
      data: { url: discoveredPage.url },
      screenshot: options.includeScreenshots,
    });

    if (options.includeValidations) {
      steps.push({
        stepId: `step-${stepOrder}`,
        order: stepOrder++,
        action: 'assert',
        description: 'Verify page loaded',
        validation: {
          type: 'title',
          expected: discoveredPage.title,
          operator: 'equals',
        },
        screenshot: false,
      });
    }

    return [{
      testId: `test-${Date.now()}-generic`,
      testName: 'Page Load Test',
      description: `Test page load for ${discoveredPage.title}`,
      tags: ['smoke', 'basic'],
      priority: options.priority,
      steps,
      expectedOutcome: 'Page should load successfully',
      estimatedDuration: steps.length * 2,
    }];
  }

  /**
   * Extract shared data from discovered page
   */
  private extractSharedData(discoveredPage: DiscoveredPage): any {
    const sharedData: any = {
      baseUrl: new URL(discoveredPage.url).origin,
    };

    // Look for login form
    const usernameField = discoveredPage.elements.inputs.find(
      i => i.type === 'text' && 
           (i.name?.toLowerCase().includes('user') || 
            i.placeholder?.toLowerCase().includes('user') ||
            i.ariaLabel?.toLowerCase().includes('user'))
    );

    const passwordField = discoveredPage.elements.inputs.find(
      i => i.type === 'password'
    );

    if (usernameField || passwordField) {
      sharedData.credentials = {
        usernameField: usernameField?.recommended.locator,
        passwordField: passwordField?.recommended.locator,
      };
    }

    return sharedData;
  }

  /**
   * Generate sample data for input fields
   */
  private generateSampleData(input: DiscoveredElement): string {
    const fieldName = (input.name || input.ariaLabel || input.placeholder || '').toLowerCase();

    if (fieldName.includes('email')) return 'test@example.com';
    if (fieldName.includes('phone')) return '555-0123';
    if (fieldName.includes('name')) return 'Test User';
    if (fieldName.includes('address')) return '123 Test Street';
    if (fieldName.includes('city')) return 'Test City';
    if (fieldName.includes('zip') || fieldName.includes('postal')) return '12345';
    if (input.type === 'number') return '42';
    if (input.type === 'date') return '2024-01-01';
    if (input.type === 'email') return 'test@example.com';
    if (input.type === 'tel') return '555-0123';
    if (input.type === 'url') return 'https://example.com';

    return 'Test Value';
  }

  /**
   * Find relevant elements based on description
   */
  private findRelevantElements(
    description: string,
    discoveredPage: DiscoveredPage
  ): DiscoveredElement[] {
    const lowerDesc = description.toLowerCase();
    const words = lowerDesc.split(/\s+/);
    const relevant: DiscoveredElement[] = [];

    for (const element of discoveredPage.elements.all) {
      let relevanceScore = 0;

      if (element.text && words.some(w => element.text!.toLowerCase().includes(w))) {
        relevanceScore += 3;
      }
      if (element.ariaLabel && words.some(w => element.ariaLabel!.toLowerCase().includes(w))) {
        relevanceScore += 2;
      }
      if (element.placeholder && words.some(w => element.placeholder!.toLowerCase().includes(w))) {
        relevanceScore += 2;
      }
      if (element.name && words.some(w => element.name!.toLowerCase().includes(w))) {
        relevanceScore += 1;
      }

      if (relevanceScore > 0) {
        relevant.push(element);
      }
    }

    return relevant.sort((a, b) => {
      // Prioritize visible, enabled elements
      const aScore = (a.visible ? 10 : 0) + (a.enabled ? 5 : 0);
      const bScore = (b.visible ? 10 : 0) + (b.enabled ? 5 : 0);
      return bScore - aScore;
    });
  }

  /**
   * Determine appropriate action for an element
   */
  private determineActionForElement(
    element: DiscoveredElement,
    context: string
  ): TestStep['action'] {
    const lowerContext = context.toLowerCase();

    if (element.tagName === 'a' || element.role === 'link') return 'click';
    if (element.tagName === 'button' || element.role === 'button') return 'click';
    if (element.type === 'checkbox') return lowerContext.includes('check') ? 'check' : 'uncheck';
    if (element.tagName === 'input' || element.tagName === 'textarea') return 'type';
    if (element.tagName === 'select') return 'select';

    return 'click';
  }

  /**
   * Export test model to JSON string
   */
  exportToJSON(testModel: TestModel, pretty: boolean = true): string {
    return JSON.stringify(testModel, null, pretty ? 2 : 0);
  }

  /**
   * Import test model from JSON string
   */
  importFromJSON(json: string): TestModel {
    return JSON.parse(json) as TestModel;
  }
}
