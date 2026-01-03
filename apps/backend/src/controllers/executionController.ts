// Execution controller
import { Request, Response } from 'express';
import {
  successResponse,
  errorResponse,
  createdResponse,
  deletedResponse,
} from '../utils/response';
import prisma from '../utils/prisma';

// GET /api/executions
export const listExecutions = async (req: Request, res: Response) => {
  try {
    const { testCaseId, status, limit = '50' } = req.query;
    const userId = req.user?.id;

    const where: any = {};
    if (testCaseId) {
      where.testCaseId = testCaseId as string;
    }
    if (status) {
      where.status = status as string;
    }

    const executions = await prisma.execution.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: parseInt(limit as string),
      include: {
        testCase: {
          include: {
            project: {
              select: { id: true, name: true, userId: true },
            },
          },
        },
      },
    });

    // Filter by user ownership
    const filtered = executions.filter(ex => ex.testCase.project.userId === userId);

    res.json(successResponse(filtered));
  } catch (error) {
    console.error('List executions error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GET /api/executions/:id
export const getExecution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const execution = await prisma.execution.findUnique({
      where: { id },
      include: {
        testCase: {
          include: {
            project: {
              select: { id: true, name: true, userId: true },
            },
          },
        },
      },
    });

    if (!execution) {
      return res.status(404).json(errorResponse('Execution not found'));
    }

    // Verify user has access
    if (execution.testCase.project.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    res.json(successResponse(execution));
  } catch (error) {
    console.error('Get execution error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// POST /api/executions
export const createExecution = async (req: Request, res: Response) => {
  try {
    const { testCaseId } = req.body;
    const userId = req.user?.id;

    if (!testCaseId) {
      return res.status(400).json(errorResponse('testCaseId is required'));
    }

    // Verify user has access to test case
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
      include: {
        project: {
          select: { userId: true },
        },
      },
    });

    if (!testCase) {
      return res.status(404).json(errorResponse('Test case not found'));
    }

    if (testCase.project.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    // Create execution
    const execution = await prisma.execution.create({
      data: {
        testCaseId,
        status: 'running',
        startedAt: new Date(),
      },
    });

    res.status(201).json(createdResponse(execution));
  } catch (error) {
    console.error('Create execution error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// POST /api/executions/:id/rerun
export const rerunExecution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get original execution
    const execution = await prisma.execution.findUnique({
      where: { id },
      include: {
        testCase: {
          include: {
            project: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!execution) {
      return res.status(404).json(errorResponse('Execution not found'));
    }

    // Verify user has access
    if (execution.testCase.project.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    // Create new execution
    const newExecution = await prisma.execution.create({
      data: {
        testCaseId: execution.testCaseId,
        status: 'running',
        startedAt: new Date(),
      },
    });

    res.status(201).json(createdResponse(newExecution));
  } catch (error) {
    console.error('Rerun execution error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// DELETE /api/executions/:id
export const deleteExecution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get execution
    const execution = await prisma.execution.findUnique({
      where: { id },
      include: {
        testCase: {
          include: {
            project: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!execution) {
      return res.status(404).json(errorResponse('Execution not found'));
    }

    // Verify user has access
    if (execution.testCase.project.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    // Delete execution
    await prisma.execution.delete({
      where: { id },
    });

    res.json(deletedResponse('Execution deleted successfully'));
  } catch (error) {
    console.error('Delete execution error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GET /api/executions/:id/logs
export const getExecutionLogs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const execution = await prisma.execution.findUnique({
      where: { id },
      include: {
        testCase: {
          include: {
            project: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!execution) {
      return res.status(404).json(errorResponse('Execution not found'));
    }

    if (execution.testCase.project.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    const logs = execution.resultsJson || [];
    res.json(successResponse(logs));
  } catch (error) {
    console.error('Get execution logs error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GET /api/executions/:id/screenshots
export const getExecutionScreenshots = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const execution = await prisma.execution.findUnique({
      where: { id },
      include: {
        testCase: {
          include: {
            project: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!execution) {
      return res.status(404).json(errorResponse('Execution not found'));
    }

    if (execution.testCase.project.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    const screenshots = execution.screenshotsJson || [];
    res.json(successResponse(screenshots));
  } catch (error) {
    console.error('Get execution screenshots error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// PUT /api/executions/:id - Update execution status
export const updateExecution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { status, resultsJson, screenshotsJson, errorMessage, completedAt } = req.body;

    // Verify execution exists and user has access
    const execution = await prisma.execution.findUnique({
      where: { id },
      include: {
        testCase: {
          include: {
            project: {
              select: { userId: true },
            },
          },
        },
        batch: true,
      },
    });

    if (!execution) {
      return res.status(404).json(errorResponse('Execution not found'));
    }

    if (execution.testCase.project.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    // Calculate duration if completed
    let duration: number | null = null;
    if (completedAt && execution.startedAt) {
      duration = Math.floor((new Date(completedAt).getTime() - execution.startedAt.getTime()) / 1000);
    }

    // Update execution
    const updatedExecution = await prisma.execution.update({
      where: { id },
      data: {
        status,
        resultsJson: resultsJson ?? undefined,
        screenshotsJson: screenshotsJson ?? undefined,
        errorMessage: errorMessage ?? undefined,
        completedAt: completedAt ? new Date(completedAt) : undefined,
        duration,
      },
      include: {
        testCase: {
          include: {
            project: {
              select: { id: true, name: true, userId: true },
            },
          },
        },
        batch: true,
      },
    });

    // If part of a batch, update batch statistics
    if (execution.batchId) {
      const batch = await prisma.executionBatch.findUnique({
        where: { id: execution.batchId },
        include: {
          executions: true,
        },
      });

      if (batch) {
        // Calculate batch stats
        const allExecutions = await prisma.execution.findMany({
          where: { batchId: execution.batchId },
        });

        const completedTests = allExecutions.filter(e => e.status === 'completed').length;
        const passedTests = allExecutions.filter(e => e.status === 'completed' && !e.errorMessage).length;
        const failedTests = allExecutions.filter(e => e.status === 'failed' || (e.status === 'completed' && e.errorMessage)).length;

        // Check if all tests are completed
        const allCompleted = allExecutions.every(e => ['completed', 'failed'].includes(e.status));
        const batchStatus = allCompleted ? 'completed' : 'running';

        // Update batch
        await prisma.executionBatch.update({
          where: { id: execution.batchId },
          data: {
            status: batchStatus,
            completedTests,
            passedTests,
            failedTests,
            completedAt: allCompleted ? new Date() : undefined,
            duration: allCompleted && batch.startedAt ? Math.floor((new Date().getTime() - batch.startedAt.getTime()) / 1000) : undefined,
          },
        });
      }
    }

    res.json(successResponse(updatedExecution));
  } catch (error) {
    console.error('Update execution error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};
