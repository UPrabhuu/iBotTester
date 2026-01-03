import { prisma } from '../utils/prisma';
import { createLogger } from '../utils/logger';

const logger = createLogger('ReportGenerator');

export interface ReportMetrics {
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  skippedSteps: number;
  successRate: number;
  averageStepDuration: number;
}

export interface PerformanceMetrics {
  totalDuration: number;
  pageLoadTime?: number;
  networkRequests?: number;
  averageResponseTime?: number;
  resourcesLoaded?: number;
}

export interface Recommendation {
  type: 'performance' | 'reliability' | 'best_practice';
  priority: 'high' | 'medium' | 'low';
  message: string;
  details?: string;
}

export interface ExecutionReportData {
  summary: string;
  metrics: ReportMetrics;
  performanceMetrics?: PerformanceMetrics;
  recommendations: Recommendation[];
  evidenceSummary: {
    screenshots: number;
    videos: number;
    traces: number;
    networkLogs: number;
    consoleLogs: number;
  };
  validationSummary?: {
    status: string;
    issuesFound: number;
    criticalIssues: number;
    majorIssues: number;
  };
}

export class ReportGeneratorService {
  async generateReport(
    executionId: string,
    reportType: 'standard' | 'detailed' | 'summary' = 'standard'
  ): Promise<string> {
    try {
      // Get execution data
      const execution = await prisma.playwrightExecution.findUnique({
        where: { id: executionId },
        include: {
          evidenceData: true,
          validationResult: true,
        },
      });

      if (!execution) {
        throw new Error('Execution not found');
      }

      // Calculate metrics
      const metrics = this.calculateMetrics(execution);
      const performanceMetrics = this.calculatePerformanceMetrics(execution);
      const recommendations = this.generateRecommendations(execution, metrics);

      // Evidence summary
      const evidenceSummary = {
        screenshots: execution.evidenceData.filter(e => e.evidenceType === 'screenshot').length,
        videos: execution.evidenceData.filter(e => e.evidenceType === 'video').length,
        traces: execution.evidenceData.filter(e => e.evidenceType === 'trace').length,
        networkLogs: execution.evidenceData.filter(e => e.evidenceType === 'network').length,
        consoleLogs: execution.evidenceData.filter(e => e.evidenceType === 'console').length,
      };

      // Validation summary
      let validationSummary;
      if (execution.validationResult) {
        const issues = (execution.validationResult.issuesJson as any[]) || [];
        validationSummary = {
          status: execution.validationResult.overallStatus,
          issuesFound: execution.validationResult.issuesFound,
          criticalIssues: issues.filter(i => i.severity === 'critical').length,
          majorIssues: issues.filter(i => i.severity === 'major').length,
        };
      }

      // Generate summary text
      const summary = this.generateSummary(execution, metrics, validationSummary);

      const reportData: ExecutionReportData = {
        summary,
        metrics,
        performanceMetrics,
        recommendations,
        evidenceSummary,
        validationSummary,
      };

      // Save report to database
      const report = await prisma.executionReport.create({
        data: {
          playwrightExecutionId: executionId,
          reportType,
          summary,
          totalSteps: metrics.totalSteps,
          passedSteps: metrics.passedSteps,
          failedSteps: metrics.failedSteps,
          skippedSteps: metrics.skippedSteps,
          performanceMetrics: performanceMetrics as any,
          recommendationsJson: recommendations as any,
          reportDataJson: reportData as any,
        },
      });

      return report.id;
    } catch (error) {
      logger.error('Error generating report', { error });
      throw error;
    }
  }

  private calculateMetrics(execution: any): ReportMetrics {
    const evidenceByStep = new Map<number, any[]>();
    
    execution.evidenceData.forEach((evidence: any) => {
      if (evidence.stepNumber !== null) {
        const existing = evidenceByStep.get(evidence.stepNumber) || [];
        existing.push(evidence);
        evidenceByStep.set(evidence.stepNumber, existing);
      }
    });

    const totalSteps = evidenceByStep.size;
    const passedSteps = execution.status === 'completed' ? totalSteps : totalSteps - 1;
    const failedSteps = execution.status === 'failed' ? 1 : 0;
    const skippedSteps = 0;

    const successRate = totalSteps > 0 ? (passedSteps / totalSteps) * 100 : 0;
    const averageStepDuration = execution.duration && totalSteps > 0 
      ? execution.duration / totalSteps 
      : 0;

    return {
      totalSteps,
      passedSteps,
      failedSteps,
      skippedSteps,
      successRate,
      averageStepDuration,
    };
  }

  private calculatePerformanceMetrics(execution: any): PerformanceMetrics {
    const networkLogs = execution.evidenceData.filter(
      (e: any) => e.evidenceType === 'network'
    );

    let networkRequests = 0;
    if (networkLogs.length > 0) {
      networkLogs.forEach((log: any) => {
        try {
          const logData = JSON.parse(log.dataUrl || '[]');
          networkRequests += logData.length;
        } catch (error) {
          // Ignore parse errors
        }
      });
    }

    return {
      totalDuration: execution.duration || 0,
      pageLoadTime: undefined, // Could be calculated from network logs
      networkRequests,
      averageResponseTime: undefined,
      resourcesLoaded: undefined,
    };
  }

  private generateRecommendations(
    execution: any,
    metrics: ReportMetrics
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Performance recommendations
    if (execution.duration && execution.duration > 60000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Test execution took longer than 1 minute',
        details: 'Consider optimizing test steps or increasing timeout values',
      });
    }

    // Reliability recommendations
    if (metrics.successRate < 100) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: `Success rate is ${metrics.successRate.toFixed(1)}%`,
        details: 'Review failed steps and add better error handling or waits',
      });
    }

    // Best practice recommendations
    const screenshotCount = execution.evidenceData.filter(
      (e: any) => e.evidenceType === 'screenshot'
    ).length;

    if (screenshotCount < metrics.totalSteps) {
      recommendations.push({
        type: 'best_practice',
        priority: 'medium',
        message: 'Not all steps have screenshot evidence',
        details: 'Enable screenshot capture for all steps to improve debugging',
      });
    }

    if (execution.evidenceData.filter((e: any) => e.evidenceType === 'trace').length === 0) {
      recommendations.push({
        type: 'best_practice',
        priority: 'low',
        message: 'No trace data collected',
        details: 'Enable trace recording for detailed debugging information',
      });
    }

    return recommendations;
  }

  private generateSummary(
    execution: any,
    metrics: ReportMetrics,
    validationSummary?: any
  ): string {
    const duration = execution.duration 
      ? `${(execution.duration / 1000).toFixed(2)}s`
      : 'N/A';

    let summary = `Test execution "${execution.executionName}" ${execution.status}.\n\n`;
    summary += `Duration: ${duration}\n`;
    summary += `Steps: ${metrics.passedSteps}/${metrics.totalSteps} passed`;
    
    if (metrics.failedSteps > 0) {
      summary += `, ${metrics.failedSteps} failed`;
    }
    
    summary += `\nSuccess Rate: ${metrics.successRate.toFixed(1)}%\n`;

    if (validationSummary) {
      summary += `\nValidation: ${validationSummary.status}`;
      if (validationSummary.issuesFound > 0) {
        summary += ` (${validationSummary.issuesFound} issues found`;
        if (validationSummary.criticalIssues > 0) {
          summary += `, ${validationSummary.criticalIssues} critical`;
        }
        summary += ')';
      }
    }

    return summary;
  }

  async getReport(executionId: string) {
    return prisma.executionReport.findUnique({
      where: {
        playwrightExecutionId: executionId,
      },
    });
  }

  async getAllReports(projectId?: string) {
    const where: any = {};
    
    if (projectId) {
      where.playwrightExecution = {
        projectId,
      };
    }

    return prisma.executionReport.findMany({
      where,
      include: {
        playwrightExecution: {
          select: {
            id: true,
            executionName: true,
            status: true,
            startedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
