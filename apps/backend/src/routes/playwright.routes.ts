import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { PlaywrightRunnerService, TestStep } from '../services/playwrightRunnerService';
import { DiffValidationAgentService } from '../services/diffValidationAgentService';
import { ReportGeneratorService } from '../services/reportGeneratorService';
import { EvidenceCollectorService } from '../services/evidenceCollectorService';

const router = Router();
const playwrightRunner = new PlaywrightRunnerService();
const diffValidation = new DiffValidationAgentService(process.env.ANTHROPIC_API_KEY);
const reportGenerator = new ReportGeneratorService();
const evidenceCollector = new EvidenceCollectorService();

// Create new playwright execution
router.post('/executions', async (req: Request, res: Response) => {
  try {
    const {
      testCaseId,
      projectId,
      userId,
      executionName,
      testSteps,
      startUrl,
      config,
    } = req.body;

    // Create execution record
    const execution = await prisma.playwrightExecution.create({
      data: {
        testCaseId,
        projectId,
        userId: userId || 'system',
        executionName: executionName || 'Test Execution',
        status: 'pending',
        browserType: config?.browserType || 'chromium',
        viewportJson: config?.viewport as any,
        configJson: config as any,
        triggeredBy: req.body.triggeredBy || 'manual',
        executionType: req.body.executionType || 'manual',
      },
    });

    res.json({
      success: true,
      executionId: execution.id,
      message: 'Execution created',
    });
  } catch (error) {
    console.error('Error creating execution:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create execution',
    });
  }
});

// Start playwright test execution
router.post('/executions/:executionId/start', async (req: Request, res: Response) => {
  try {
    const { executionId } = req.params;
    const { testSteps, startUrl, config } = req.body;

    // Update execution status to running
    await prisma.playwrightExecution.update({
      where: { id: executionId },
      data: { status: 'running', startedAt: new Date() },
    });

    // Execute test in background
    playwrightRunner
      .executeTest(executionId, testSteps, startUrl, config)
      .then(async (result) => {
        // Update execution with results
        await prisma.playwrightExecution.update({
          where: { id: executionId },
          data: {
            status: result.status,
            completedAt: new Date(),
            duration: result.duration,
            errorMessage: result.error,
          },
        });

        // Perform validation
        const validationResult = await diffValidation.validateExecution(
          executionId,
          null,
          config.validation || {}
        );

        // Generate report
        await reportGenerator.generateReport(executionId, 'standard');
      })
      .catch(async (error) => {
        await prisma.playwrightExecution.update({
          where: { id: executionId },
          data: {
            status: 'failed',
            completedAt: new Date(),
            errorMessage: error.message,
          },
        });
      });

    res.json({
      success: true,
      executionId,
      message: 'Execution started',
    });
  } catch (error) {
    console.error('Error starting execution:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start execution',
    });
  }
});

// Get execution status and details
router.get('/executions/:executionId', async (req: Request, res: Response) => {
  try {
    const { executionId } = req.params;

    const execution = await prisma.playwrightExecution.findUnique({
      where: { id: executionId },
      include: {
        evidenceData: {
          orderBy: { timestamp: 'asc' },
        },
        validationResult: true,
        executionReport: true,
      },
    });

    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found',
      });
    }

    res.json({
      success: true,
      execution,
    });
  } catch (error) {
    console.error('Error fetching execution:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch execution',
    });
  }
});

// Get all executions (with optional filters)
router.get('/executions', async (req: Request, res: Response) => {
  try {
    const { projectId, userId, status, limit = '50' } = req.query;

    const where: any = {};
    if (projectId) where.projectId = projectId as string;
    if (userId) where.userId = userId as string;
    if (status) where.status = status as string;

    const executions = await prisma.playwrightExecution.findMany({
      where,
      include: {
        evidenceData: {
          select: {
            id: true,
            evidenceType: true,
            timestamp: true,
          },
        },
        validationResult: {
          select: {
            overallStatus: true,
            issuesFound: true,
          },
        },
        executionReport: {
          select: {
            summary: true,
            totalSteps: true,
            passedSteps: true,
            failedSteps: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: parseInt(limit as string, 10),
    });

    res.json({
      success: true,
      executions,
      total: executions.length,
    });
  } catch (error) {
    console.error('Error fetching executions:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch executions',
    });
  }
});

// Get evidence for execution
router.get('/executions/:executionId/evidence', async (req: Request, res: Response) => {
  try {
    const { executionId } = req.params;
    const { type } = req.query;

    let evidence;
    if (type) {
      evidence = await evidenceCollector.getEvidenceByType(executionId, type as string);
    } else {
      evidence = await evidenceCollector.getAllEvidence(executionId);
    }

    res.json({
      success: true,
      evidence,
      total: evidence.length,
    });
  } catch (error) {
    console.error('Error fetching evidence:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch evidence',
    });
  }
});

// Get validation result
router.get('/executions/:executionId/validation', async (req: Request, res: Response) => {
  try {
    const { executionId } = req.params;

    const validation = await diffValidation.getValidationResult(executionId);

    if (!validation) {
      return res.status(404).json({
        success: false,
        error: 'Validation result not found',
      });
    }

    res.json({
      success: true,
      validation,
    });
  } catch (error) {
    console.error('Error fetching validation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch validation',
    });
  }
});

// Get execution report
router.get('/executions/:executionId/report', async (req: Request, res: Response) => {
  try {
    const { executionId } = req.params;

    const report = await reportGenerator.getReport(executionId);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch report',
    });
  }
});

// Generate report manually
router.post('/executions/:executionId/report', async (req: Request, res: Response) => {
  try {
    const { executionId } = req.params;
    const { reportType = 'standard' } = req.body;

    const reportId = await reportGenerator.generateReport(executionId, reportType);

    res.json({
      success: true,
      reportId,
      message: 'Report generated successfully',
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate report',
    });
  }
});

// Stop execution
router.post('/executions/:executionId/stop', async (req: Request, res: Response) => {
  try {
    const { executionId } = req.params;

    await playwrightRunner.stopExecution();

    await prisma.playwrightExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: 'Execution stopped by user',
      },
    });

    res.json({
      success: true,
      message: 'Execution stopped',
    });
  } catch (error) {
    console.error('Error stopping execution:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to stop execution',
    });
  }
});

// Delete execution
router.delete('/executions/:executionId', async (req: Request, res: Response) => {
  try {
    const { executionId } = req.params;

    await prisma.playwrightExecution.delete({
      where: { id: executionId },
    });

    res.json({
      success: true,
      message: 'Execution deleted',
    });
  } catch (error) {
    console.error('Error deleting execution:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete execution',
    });
  }
});

// Quick test execution (create + start in one call)
router.post('/execute-test', async (req: Request, res: Response) => {
  try {
    const {
      testCaseId,
      projectId,
      userId,
      executionName,
      testSteps,
      startUrl,
      config,
    } = req.body;

    // Create execution
    const execution = await prisma.playwrightExecution.create({
      data: {
        testCaseId,
        projectId,
        userId: userId || 'system',
        executionName: executionName || 'Quick Test',
        status: 'running',
        startedAt: new Date(),
        browserType: config?.browserType || 'chromium',
        viewportJson: config?.viewport as any,
        configJson: config as any,
        triggeredBy: 'api',
        executionType: 'manual',
      },
    });

    // Execute test
    playwrightRunner
      .executeTest(execution.id, testSteps, startUrl, config)
      .then(async (result) => {
        await prisma.playwrightExecution.update({
          where: { id: execution.id },
          data: {
            status: result.status,
            completedAt: new Date(),
            duration: result.duration,
            errorMessage: result.error,
          },
        });

        await diffValidation.validateExecution(execution.id, null, config.validation || {});
        await reportGenerator.generateReport(execution.id, 'standard');
      })
      .catch(async (error) => {
        await prisma.playwrightExecution.update({
          where: { id: execution.id },
          data: {
            status: 'failed',
            completedAt: new Date(),
            errorMessage: error.message,
          },
        });
      });

    res.json({
      success: true,
      executionId: execution.id,
      message: 'Test execution started',
    });
  } catch (error) {
    console.error('Error executing test:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to execute test',
    });
  }
});

export default router;
