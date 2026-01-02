// AI Agent Service for iBotTester
import OpenAI from 'openai';
import { AGENT_SYSTEM_PROMPT, TEST_PLANNER_PROMPT } from '../config/agentPrompt';
import { TestInput, TestPlan, TestStep } from '../models/agentTypes';

export class AIAgentService {
  private openai: OpenAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Generate a structured test plan from natural language prompt
   */
  async generateTestPlan(input: TestInput): Promise<TestPlan> {
    if (!this.openai) {
      // Fallback to basic test plan without AI
      return this.generateBasicTestPlan(input);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-5-nano',
        messages: [
          {
            role: 'system',
            content: AGENT_SYSTEM_PROMPT + '\n\n' + TEST_PLANNER_PROMPT,
          },
          {
            role: 'user',
            content: `Generate a test plan for: ${input.prompt}`,
          },
        ],
        temperature: 0.3, // Lower temperature for more deterministic output
        max_completion_tokens: 1500,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from AI');
      }

      // Parse the JSON response
      const parsedPlan = this.parseTestPlan(content);
      
      return {
        ...parsedPlan,
        testId: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('AI test plan generation error:', error);
      // Fallback to basic plan on error
      return this.generateBasicTestPlan(input);
    }
  }

  /**
   * Parse test plan from AI response
   */
  private parseTestPlan(content: string): Pick<TestPlan, 'name' | 'steps'> {
    try {
      // Remove markdown code blocks if present
      let cleaned = content.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleaned);
      
      // Validate the structure
      if (!parsed.name || !Array.isArray(parsed.steps)) {
        throw new Error('Invalid test plan structure');
      }

      return {
        name: parsed.name,
        steps: parsed.steps.map((step: any, index: number) => ({
          step: step.step || index + 1,
          action: step.action,
          url: step.url,
          target: step.target,
          query: step.query,
          rule: step.rule,
          value: step.value,
          retryPolicy: step.retryPolicy || {
            maxRetries: 2,
            timeout: 30000,
          },
        })),
      };
    } catch (error) {
      console.error('Error parsing test plan:', error);
      throw new Error('Failed to parse test plan from AI response');
    }
  }

  /**
   * Generate a basic test plan without AI
   */
  private generateBasicTestPlan(input: TestInput): TestPlan {
    const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract URL from prompt if present
    const urlMatch = input.prompt.match(/(?:on|at|from)\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    const url = urlMatch ? `https://${urlMatch[1]}` : 'https://example.com';

    const steps: TestStep[] = [
      {
        step: 1,
        action: 'navigate',
        url: url,
        retryPolicy: {
          maxRetries: 2,
          timeout: 30000,
        },
      },
      {
        step: 2,
        action: 'validate',
        rule: 'page loaded successfully',
        retryPolicy: {
          maxRetries: 2,
          timeout: 30000,
        },
      },
    ];

    return {
      name: `Test: ${input.prompt.substring(0, 50)}${input.prompt.length > 50 ? '...' : ''}`,
      testId,
      steps,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generate human-readable summary from test results
   */
  async generateTestSummary(
    testPlan: TestPlan,
    results: any[]
  ): Promise<string> {
    if (!this.openai) {
      return this.generateBasicSummary(testPlan, results);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-5-nano',
        messages: [
          {
            role: 'system',
            content: `${AGENT_SYSTEM_PROMPT}\n\nYou are analyzing test execution results. Provide a clear, concise summary explaining what happened, any failures, and suggested fixes. Explain like a senior QA engineer.`,
          },
          {
            role: 'user',
            content: `Test Plan: ${JSON.stringify(testPlan, null, 2)}\n\nResults: ${JSON.stringify(results, null, 2)}\n\nProvide a summary:`,
          },
        ],
        temperature: 0.5,
        max_completion_tokens: 500,
      });

      return completion.choices[0]?.message?.content || this.generateBasicSummary(testPlan, results);
    } catch (error) {
      console.error('AI summary generation error:', error);
      return this.generateBasicSummary(testPlan, results);
    }
  }

  /**
   * Generate basic summary without AI
   */
  private generateBasicSummary(testPlan: TestPlan, results: any[]): string {
    const totalSteps = results.length;
    const passedSteps = results.filter(r => r.status === 'PASS').length;
    const failedSteps = results.filter(r => r.status === 'FAIL').length;

    if (failedSteps === 0) {
      return `Test "${testPlan.name}" completed successfully. All ${totalSteps} steps passed.`;
    } else {
      const firstFailure = results.find(r => r.status === 'FAIL');
      return `Test "${testPlan.name}" failed at step ${firstFailure?.step || 'unknown'}. ${passedSteps}/${totalSteps} steps passed. Action: ${firstFailure?.action || 'unknown'}.`;
    }
  }

  /**
   * Check if AI is available
   */
  isAIAvailable(): boolean {
    return this.openai !== null;
  }
}
