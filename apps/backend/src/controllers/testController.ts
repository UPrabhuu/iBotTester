// Test management controller
import { Request, Response } from 'express';
import {
  successResponse,
  errorResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
} from '../utils/response';
import prisma from '../utils/prisma';

// GET /api/test-cases
export const listTestCases = async (req: Request, res: Response) => {
  try {
    const { projectId, status } = req.query;
    const userId = req.user?.id;

    // If projectId provided, verify user has access
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId as string, userId },
      });

      if (!project) {
        return res.status(403).json(errorResponse('Access denied to this project'));
      }
    }

    // Build filter
    const where: any = {};
    if (projectId) {
      where.projectId = projectId as string;
    }
    if (status) {
      where.status = status as string;
    }

    // Get test cases
    const testCases = await prisma.testCase.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
        _count: {
          select: { testSteps: true, executions: true },
        },
      },
    });

    // Filter by user ownership
    const filtered = testCases.filter(tc => tc.project.userId === userId);

    res.json(successResponse(filtered));
  } catch (error) {
    console.error('List test cases error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GET /api/test-cases/:id
export const getTestCase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const testCase = await prisma.testCase.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
        testSteps: {
          orderBy: { stepNumber: 'asc' },
        },
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!testCase) {
      return res.status(404).json(errorResponse('Test case not found'));
    }

    // Verify user has access
    if (testCase.project.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    res.json(successResponse(testCase));
  } catch (error) {
    console.error('Get test case error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// POST /api/test-cases
export const createTestCase = async (req: Request, res: Response) => {
  try {
    const { name, description, projectId, status, stepsJson } = req.body;
    const userId = req.user?.id;

    if (!name || !projectId) {
      return res.status(400).json(errorResponse('Name and projectId are required'));
    }

    // Verify user has access to project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(403).json(errorResponse('Access denied to this project'));
    }

    const newTestCase = await prisma.testCase.create({
      data: {
        name,
        description: description || null,
        projectId,
        status: status || 'active',
        stepsJson: stepsJson || null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(createdResponse(newTestCase));
  } catch (error) {
    console.error('Create test case error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// PUT /api/test-cases/:id
export const updateTestCase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status, stepsJson } = req.body;
    const userId = req.user?.id;

    // Get test case with project
    const testCase = await prisma.testCase.findUnique({
      where: { id },
      include: {
        project: {
          select: { userId: true },
        },
      },
    });

    if (!testCase) {
      return res.status(404).json(errorResponse('Test case not found'));
    }

    // Verify user has access
    if (testCase.project.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    // Update test case
    const updated = await prisma.testCase.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(stepsJson !== undefined && { stepsJson }),
      },
    });

    res.json(updatedResponse(updated));
  } catch (error) {
    console.error('Update test case error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// DELETE /api/test-cases/:id
export const deleteTestCase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get test case with project
    const testCase = await prisma.testCase.findUnique({
      where: { id },
      include: {
        project: {
          select: { userId: true },
        },
      },
    });

    if (!testCase) {
      return res.status(404).json(errorResponse('Test case not found'));
    }

    // Verify user has access
    if (testCase.project.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    // Delete test case (cascades to steps and executions)
    await prisma.testCase.delete({
      where: { id },
    });

    res.json(deletedResponse('Test case deleted successfully'));
  } catch (error) {
    console.error('Delete test case error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GET /api/test-cases/:id/steps
export const getTestSteps = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get test case with project
    const testCase = await prisma.testCase.findUnique({
      where: { id },
      include: {
        project: {
          select: { userId: true },
        },
        testSteps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
    });

    if (!testCase) {
      return res.status(404).json(errorResponse('Test case not found'));
    }

    // Verify user has access
    if (testCase.project.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    res.json(successResponse(testCase.testSteps));
  } catch (error) {
    console.error('Get test steps error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// POST /api/test-cases/:id/steps
export const createTestStep = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, expectedResult, selector, uiSection, stepNumber } = req.body;
    const userId = req.user?.id;

    // Get test case with project
    const testCase = await prisma.testCase.findUnique({
      where: { id },
      include: {
        project: {
          select: { userId: true },
        },
        testSteps: {
          orderBy: { stepNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!testCase) {
      return res.status(404).json(errorResponse('Test case not found'));
    }

    // Verify user has access
    if (testCase.project.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    if (!action || !expectedResult) {
      return res.status(400).json(errorResponse('Action and expectedResult are required'));
    }

    // Calculate step number if not provided
    const maxStepNumber = testCase.testSteps.length > 0 
      ? testCase.testSteps[0].stepNumber 
      : 0;

    const newStep = await prisma.testStep.create({
      data: {
        testCaseId: id,
        stepNumber: stepNumber || maxStepNumber + 1,
        action,
        expectedResult,
        selector: selector || null,
        uiSection: uiSection || null,
      },
    });

    // Update test case updatedAt
    await prisma.testCase.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json(createdResponse(newStep));
  } catch (error) {
    console.error('Create test step error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// PUT /api/test-steps/:id
export const updateTestStep = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, expectedResult, selector, uiSection, stepNumber } = req.body;
    const userId = req.user?.id;

    // Get test step with test case and project
    const step = await prisma.testStep.findUnique({
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

    if (!step) {
      return res.status(404).json(errorResponse('Test step not found'));
    }

    // Verify user has access
    if (step.testCase.project.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    // Update test step
    const updated = await prisma.testStep.update({
      where: { id },
      data: {
        ...(action && { action }),
        ...(expectedResult && { expectedResult }),
        ...(selector !== undefined && { selector }),
        ...(uiSection && { uiSection }),
        ...(stepNumber && { stepNumber }),
      },
    });

    // Update test case updatedAt
    await prisma.testCase.update({
      where: { id: step.testCaseId },
      data: { updatedAt: new Date() },
    });

    res.json(updatedResponse(updated));
  } catch (error) {
    console.error('Update test step error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// DELETE /api/test-steps/:id
export const deleteTestStep = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get test step with test case and project
    const step = await prisma.testStep.findUnique({
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

    if (!step) {
      return res.status(404).json(errorResponse('Test step not found'));
    }

    // Verify user has access
    if (step.testCase.project.userId !== userId) {
      return res.status(403).json(errorResponse('Access denied'));
    }

    // Delete test step
    await prisma.testStep.delete({
      where: { id },
    });

    // Update test case updatedAt
    await prisma.testCase.update({
      where: { id: step.testCaseId },
      data: { updatedAt: new Date() },
    });

    res.json(deletedResponse('Test step deleted successfully'));
  } catch (error) {
    console.error('Delete test step error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};
