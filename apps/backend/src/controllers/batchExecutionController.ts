// Batch Execution Controller - For parallel test execution
import { Request, Response } from 'express';
import {
  successResponse,
  errorResponse,
  createdResponse,
} from '../utils/response';
import prisma from '../utils/prisma';

// GET /api/executions/batch/:id - Get batch execution details
export const getExecutionBatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const batch = await prisma.executionBatch.findUnique({
      where: { id },
      include: {
        executions: {
          include: {
            testCase: {
              include: {
                project: {
                  select: { id: true, name: true, userId: true },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!batch) {
      return res.status(404).json(errorResponse('Execution batch not found'));
    }

    // Verify user has access
    if (batch.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    res.json(successResponse(batch));
  } catch (error) {
    console.error('Get execution batch error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// POST /api/executions/batch - Create a new batch execution with multiple test cases
export const createExecutionBatch = async (req: Request, res: Response) => {
  try {
    const { projectId, branchId, conversationId, testCaseIds, batchName } = req.body;
    const userId = req.user?.id;

    if (!testCaseIds || testCaseIds.length === 0) {
      return res.status(400).json(errorResponse('testCaseIds are required'));
    }

    // Verify user has access to project (if projectId is provided)
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { userId: true },
      });

      if (!project || project.userId !== userId) {
        return res.status(403).json(errorResponse('Access denied to project'));
      }
    }

    // Verify all test cases exist and belong to user (and project if specified)
    const testCasesQuery: any = {
      id: { in: testCaseIds },
    };
    
    if (projectId) {
      testCasesQuery.projectId = projectId;
    }
    
    const testCases = await prisma.testCase.findMany({
      where: testCasesQuery,
      include: {
        project: {
          select: { userId: true },
        },
      },
    });

    // Verify user owns all test cases
    const allOwnedByUser = testCases.every(tc => tc.project.userId === userId);
    if (!allOwnedByUser || testCases.length !== testCaseIds.length) {
      return res.status(400).json(errorResponse('Some test cases not found or access denied'));
    }

    // Create execution batch
    const batch = await prisma.executionBatch.create({
      data: {
        userId,
        projectId,
        branchId,
        conversationId,
        batchName: batchName || `Batch - ${new Date().toLocaleString()}`,
        status: 'running',
        totalTests: testCaseIds.length,
        executions: {
          create: testCaseIds.map((testCaseId: string, index: number) => ({
            testCaseId,
            status: 'pending',
            order: index,
            executionMetadataJson: {
              projectId,
              branchId,
              conversationId,
              batchName: batchName || `Batch - ${new Date().toLocaleString()}`,
            },
          })),
        },
      },
      include: {
        executions: {
          include: {
            testCase: {
              include: {
                project: {
                  select: { id: true, name: true, userId: true },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    res.status(201).json(createdResponse(batch));
  } catch (error) {
    console.error('Create execution batch error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// PUT /api/executions/batch/:id - Update batch execution status
export const updateExecutionBatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, completedTests, passedTests, failedTests, completedAt } = req.body;
    const userId = req.user?.id;

    // Verify user has access
    const batch = await prisma.executionBatch.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!batch) {
      return res.status(404).json(errorResponse('Execution batch not found'));
    }

    if (batch.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    // Calculate duration if completed
    let duration: number | null = null;
    if (completedAt) {
      const batch = await prisma.executionBatch.findUnique({
        where: { id },
        select: { startedAt: true },
      });
      if (batch?.startedAt) {
        duration = Math.floor((new Date(completedAt).getTime() - new Date(batch.startedAt).getTime()) / 1000);
      }
    }

    const updatedBatch = await prisma.executionBatch.update({
      where: { id },
      data: {
        status,
        completedTests: completedTests ?? undefined,
        passedTests: passedTests ?? undefined,
        failedTests: failedTests ?? undefined,
        completedAt: completedAt ? new Date(completedAt) : undefined,
        duration,
      },
      include: {
        executions: {
          include: {
            testCase: {
              include: {
                project: {
                  select: { id: true, name: true, userId: true },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json(successResponse(updatedBatch));
  } catch (error) {
    console.error('Update execution batch error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GET /api/executions/batches - Get all batches for a user
export const listExecutionBatches = async (req: Request, res: Response) => {
  try {
    const { projectId, status, limit = '20' } = req.query;
    const userId = req.user?.id;

    const where: any = { userId };
    if (projectId) {
      where.projectId = projectId as string;
    }
    if (status) {
      where.status = status as string;
    }

    const batches = await prisma.executionBatch.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: parseInt(limit as string),
      include: {
        executions: {
          select: {
            id: true,
            testCaseId: true,
            status: true,
            order: true,
            startedAt: true,
            completedAt: true,
            duration: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json(successResponse(batches));
  } catch (error) {
    console.error('List execution batches error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GET /api/executions/batch/:id/stream - Stream batch execution updates (for live updates)
export const streamBatchUpdates = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verify user has access
    const batch = await prisma.executionBatch.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!batch) {
      return res.status(404).json(errorResponse('Execution batch not found'));
    }

    if (batch.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial batch data
    const currentBatch = await prisma.executionBatch.findUnique({
      where: { id },
      include: {
        executions: {
          include: {
            testCase: {
              include: {
                project: {
                  select: { id: true, name: true, userId: true },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    res.write(`data: ${JSON.stringify({ type: 'batch_update', data: currentBatch })}\n\n`);

    // Poll for updates every 500ms
    const interval = setInterval(async () => {
      try {
        const updatedBatch = await prisma.executionBatch.findUnique({
          where: { id },
          include: {
            executions: {
              include: {
                testCase: {
                  include: {
                    project: {
                      select: { id: true, name: true, userId: true },
                    },
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        });

        if (updatedBatch) {
          res.write(`data: ${JSON.stringify({ type: 'batch_update', data: updatedBatch })}\n\n`);

          // Close connection when batch is completed or failed
          if (updatedBatch.status === 'completed' || updatedBatch.status === 'failed') {
            res.write(`data: ${JSON.stringify({ type: 'batch_complete' })}\n\n`);
            clearInterval(interval);
            res.end();
          }
        }
      } catch (error) {
        console.error('Stream update error:', error);
        clearInterval(interval);
        res.end();
      }
    }, 500);

    // Handle client disconnect
    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  } catch (error) {
    console.error('Stream batch updates error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};
