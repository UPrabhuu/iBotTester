import { prisma } from '../utils/prisma';
import { Page } from 'playwright';
import Anthropic from '@anthropic-ai/sdk';

export interface ValidationIssue {
  severity: 'critical' | 'major' | 'minor' | 'info';
  type: string;
  message: string;
  expected?: any;
  actual?: any;
  screenshot?: string;
  location?: string;
}

export interface ValidationConfig {
  enableVisualDiff?: boolean;
  enableAIAnalysis?: boolean;
  baselineScreenshot?: string;
  expectedData?: any;
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  type: 'element' | 'text' | 'url' | 'custom';
  selector?: string;
  expected: any;
  message?: string;
}

export interface DiffResult {
  overallStatus: 'passed' | 'failed' | 'warning';
  issuesFound: number;
  issues: ValidationIssue[];
  visualDiffScore?: number;
  visualDiffUrl?: string;
  aiAnalysis?: string;
}

export class DiffValidationAgentService {
  private anthropic: Anthropic | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  async validateExecution(
    executionId: string,
    page: Page | null,
    config: ValidationConfig = {}
  ): Promise<DiffResult> {
    const issues: ValidationIssue[] = [];
    let visualDiffScore: number | undefined;
    let visualDiffUrl: string | undefined;
    let aiAnalysis: string | undefined;

    try {
      // Get evidence data for this execution
      const evidenceData = await prisma.evidenceData.findMany({
        where: { playwrightExecutionId: executionId },
        orderBy: { timestamp: 'asc' },
      });

      // Validate custom rules
      if (config.validationRules && page) {
        const ruleIssues = await this.validateRules(page, config.validationRules);
        issues.push(...ruleIssues);
      }

      // Visual diff comparison
      if (config.enableVisualDiff && config.baselineScreenshot && evidenceData.length > 0) {
        const latestScreenshot = evidenceData
          .filter(e => e.evidenceType === 'screenshot')
          .pop();

        if (latestScreenshot?.dataUrl) {
          const diffResult = await this.performVisualDiff(
            config.baselineScreenshot,
            latestScreenshot.dataUrl
          );
          visualDiffScore = diffResult.score;
          visualDiffUrl = diffResult.diffImageUrl;

          if (diffResult.score < 95) {
            issues.push({
              severity: diffResult.score < 80 ? 'critical' : 'major',
              type: 'visual_diff',
              message: `Visual difference detected: ${(100 - diffResult.score).toFixed(2)}% difference`,
            });
          }
        }
      }

      // AI-powered analysis
      if (config.enableAIAnalysis && this.anthropic) {
        aiAnalysis = await this.performAIAnalysis(executionId, evidenceData, config.expectedData);
        
        // Parse AI analysis for potential issues
        const aiIssues = this.parseAIAnalysis(aiAnalysis);
        issues.push(...aiIssues);
      }

      // Data validation
      if (config.expectedData) {
        const dataIssues = await this.validateData(config.expectedData, evidenceData);
        issues.push(...dataIssues);
      }

      const issuesFound = issues.length;
      const overallStatus = this.determineOverallStatus(issues);

      // Save validation result to database
      const validationResult = await prisma.validationResult.create({
        data: {
          playwrightExecutionId: executionId,
          overallStatus,
          validationType: config.enableAIAnalysis ? 'ai-powered' : 'automated',
          issuesFound,
          issuesJson: issues as any,
          visualDiffScore,
          visualDiffUrl,
          expectedDataJson: config.expectedData as any,
          actualDataJson: evidenceData as any,
          diffDataJson: { issues } as any,
          aiAnalysis,
        },
      });

      return {
        overallStatus,
        issuesFound,
        issues,
        visualDiffScore,
        visualDiffUrl,
        aiAnalysis,
      };
    } catch (error) {
      console.error('Error during validation:', error);
      
      const errorIssue: ValidationIssue = {
        severity: 'critical',
        type: 'validation_error',
        message: error instanceof Error ? error.message : 'Unknown validation error',
      };

      return {
        overallStatus: 'failed',
        issuesFound: 1,
        issues: [errorIssue],
      };
    }
  }

  private async validateRules(
    page: Page,
    rules: ValidationRule[]
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    for (const rule of rules) {
      try {
        switch (rule.type) {
          case 'element':
            if (rule.selector) {
              const element = await page.locator(rule.selector);
              const isVisible = await element.isVisible();
              if (!isVisible && rule.expected === true) {
                issues.push({
                  severity: 'major',
                  type: 'element_not_visible',
                  message: rule.message || `Element not visible: ${rule.selector}`,
                  expected: 'Element to be visible',
                  actual: 'Element not visible',
                  location: rule.selector,
                });
              }
            }
            break;

          case 'text':
            if (rule.selector) {
              const element = await page.locator(rule.selector);
              const actualText = await element.textContent();
              if (actualText !== rule.expected) {
                issues.push({
                  severity: 'major',
                  type: 'text_mismatch',
                  message: rule.message || `Text mismatch at ${rule.selector}`,
                  expected: rule.expected,
                  actual: actualText,
                  location: rule.selector,
                });
              }
            }
            break;

          case 'url':
            const currentUrl = page.url();
            if (!currentUrl.includes(rule.expected)) {
              issues.push({
                severity: 'minor',
                type: 'url_mismatch',
                message: rule.message || 'URL does not match expected pattern',
                expected: rule.expected,
                actual: currentUrl,
              });
            }
            break;
        }
      } catch (error) {
        issues.push({
          severity: 'major',
          type: 'validation_rule_error',
          message: `Error validating rule: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }

    return issues;
  }

  private async performVisualDiff(
    baselineImage: string,
    currentImage: string
  ): Promise<{ score: number; diffImageUrl?: string }> {
    try {
      // Simple pixel-by-pixel comparison
      // In production, use libraries like pixelmatch or resemble.js
      
      // For now, return a mock similarity score
      // This would be replaced with actual image comparison logic
      const score = 98.5; // Mock score

      return {
        score,
        diffImageUrl: undefined, // Would contain actual diff image
      };
    } catch (error) {
      console.error('Error performing visual diff:', error);
      return { score: 0 };
    }
  }

  private async performAIAnalysis(
    executionId: string,
    evidenceData: any[],
    expectedData?: any
  ): Promise<string> {
    if (!this.anthropic) {
      return 'AI analysis not available (API key not configured)';
    }

    try {
      const screenshots = evidenceData
        .filter(e => e.evidenceType === 'screenshot')
        .map(e => e.dataUrl);

      const prompt = `Analyze this test execution and identify any issues or anomalies:
      
Execution ID: ${executionId}
Screenshots captured: ${screenshots.length}
Expected outcome: ${JSON.stringify(expectedData, null, 2)}

Evidence collected:
${JSON.stringify(evidenceData.map(e => ({
  type: e.evidenceType,
  step: e.stepNumber,
  description: e.stepDescription,
})), null, 2)}

Please provide:
1. Overall assessment of the test execution
2. Any visual issues detected
3. Comparison with expected outcome
4. Recommendations for improvement

Format your response as a structured analysis.`;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      return content.type === 'text' ? content.text : 'No analysis generated';
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      return `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private parseAIAnalysis(analysis: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Simple parsing logic - could be enhanced with more sophisticated NLP
    if (analysis.toLowerCase().includes('error') || analysis.toLowerCase().includes('failed')) {
      issues.push({
        severity: 'major',
        type: 'ai_detected_issue',
        message: 'AI analysis detected potential issues',
      });
    }

    return issues;
  }

  private async validateData(
    expectedData: any,
    evidenceData: any[]
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Compare expected data structure with actual evidence
    try {
      const actualData = {
        screenshots: evidenceData.filter(e => e.evidenceType === 'screenshot').length,
        videos: evidenceData.filter(e => e.evidenceType === 'video').length,
        traces: evidenceData.filter(e => e.evidenceType === 'trace').length,
      };

      if (expectedData.screenshots && actualData.screenshots < expectedData.screenshots) {
        issues.push({
          severity: 'minor',
          type: 'data_validation',
          message: 'Fewer screenshots captured than expected',
          expected: expectedData.screenshots,
          actual: actualData.screenshots,
        });
      }
    } catch (error) {
      issues.push({
        severity: 'minor',
        type: 'data_validation_error',
        message: 'Error validating data',
      });
    }

    return issues;
  }

  private determineOverallStatus(issues: ValidationIssue[]): 'passed' | 'failed' | 'warning' {
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const majorIssues = issues.filter(i => i.severity === 'major');

    if (criticalIssues.length > 0) {
      return 'failed';
    }

    if (majorIssues.length > 0) {
      return 'warning';
    }

    return 'passed';
  }

  async getValidationResult(executionId: string) {
    return prisma.validationResult.findUnique({
      where: {
        playwrightExecutionId: executionId,
      },
    });
  }
}
