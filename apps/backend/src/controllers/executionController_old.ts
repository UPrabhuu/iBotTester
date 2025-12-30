// Execution controller
import { Request, Response } from 'express';
import {
  successResponse,
  errorResponse,
  createdResponse,
  deletedResponse,
} from '../utils/response';
import { testExecutions, testCases, projects, generateId } from '../data/mockData';
import { TestExecution } from '../models/types';

// GET /api/executions
export const listExecutions = (req: Request, res: Response) => {
  const { projectId, branchId, status } = req.query;
  const userId = req.user?.id;

  let filtered = [...testExecutions];

  // Filter by project and verify user access
  if (projectId) {
    const project = projects.find((p) => p.id === projectId && p.userId === userId);
    if (!project) {
      return res.status(403).json(errorResponse('Access denied to this project'));
    }
    filtered = filtered.filter((ex) => ex.projectId === projectId);
  }

  // Filter by branch
  if (branchId) {
    filtered = filtered.filter((ex) => ex.branchId === branchId);
  }

  // Filter by status
  if (status) {
    filtered = filtered.filter((ex) => ex.status === status);
  }

  // Sort by timestamp descending
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  res.json(successResponse(filtered));
};

// GET /api/executions/:id
export const getExecution = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const execution = testExecutions.find((ex) => ex.id === id);

  if (!execution) {
    return res.status(404).json(errorResponse('Execution not found'));
  }

  // Verify user has access to project
  const project = projects.find((p) => p.id === execution.projectId && p.userId === userId);
  if (!project) {
    return res.status(403).json(errorResponse('Access denied'));
  }

  res.json(successResponse(execution));
};

// POST /api/executions
export const createExecution = (req: Request, res: Response) => {
  const { testCaseId, projectId, branchId } = req.body;
  const userId = req.user?.id;

  if (!testCaseId && !projectId) {
    return res.status(400).json(errorResponse('testCaseId or projectId is required'));
  }

  // Verify user has access to project
  const project = projects.find((p) => p.id === projectId && p.userId === userId);
  if (!project) {
    return res.status(403).json(errorResponse('Access denied to this project'));
  }

  // Get test case if provided
  let testCase = null;
  if (testCaseId) {
    testCase = testCases.find((tc) => tc.id === testCaseId);
    if (!testCase) {
      return res.status(404).json(errorResponse('Test case not found'));
    }
  }

  const newExecution: TestExecution = {
    id: generateId('exec'),
    suiteName: testCase?.name || 'Manual Execution',
    labels: testCase ? ['automated'] : ['manual'],
    status: 'running',
    timestamp: new Date(),
    duration: 0,
    triggeredBy: req.user?.email || 'unknown',
    projectId: projectId,
    branchId: branchId || project.currentBranch,
    testCaseId: testCaseId,
    logs: [],
    screenshots: [],
    createdAt: new Date(),
  };

  testExecutions.push(newExecution);

  // Simulate execution completing after a delay
  setTimeout(() => {
    const execIndex = testExecutions.findIndex((e) => e.id === newExecution.id);
    if (execIndex > -1) {
      testExecutions[execIndex].status = 'passed';
      testExecutions[execIndex].duration = Math.floor(Math.random() * 50000) + 10000;
      testExecutions[execIndex].results = 'All tests passed';
    }
  }, 5000);

  res.status(201).json(createdResponse(newExecution));
};

// POST /api/executions/:id/rerun
export const rerunExecution = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const execution = testExecutions.find((ex) => ex.id === id);

  if (!execution) {
    return res.status(404).json(errorResponse('Execution not found'));
  }

  // Verify user has access to project
  const project = projects.find((p) => p.id === execution.projectId && p.userId === userId);
  if (!project) {
    return res.status(403).json(errorResponse('Access denied'));
  }

  // Create new execution based on the old one
  const newExecution: TestExecution = {
    ...execution,
    id: generateId('exec'),
    status: 'running',
    timestamp: new Date(),
    duration: 0,
    results: undefined,
    createdAt: new Date(),
  };

  testExecutions.push(newExecution);

  // Simulate execution completing
  setTimeout(() => {
    const execIndex = testExecutions.findIndex((e) => e.id === newExecution.id);
    if (execIndex > -1) {
      testExecutions[execIndex].status = 'passed';
      testExecutions[execIndex].duration = Math.floor(Math.random() * 50000) + 10000;
      testExecutions[execIndex].results = 'All tests passed';
    }
  }, 5000);

  res.status(201).json(createdResponse(newExecution));
};

// DELETE /api/executions/:id
export const deleteExecution = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const executionIndex = testExecutions.findIndex((ex) => ex.id === id);

  if (executionIndex === -1) {
    return res.status(404).json(errorResponse('Execution not found'));
  }

  // Verify user has access to project
  const project = projects.find(
    (p) => p.id === testExecutions[executionIndex].projectId && p.userId === userId
  );
  if (!project) {
    return res.status(403).json(errorResponse('Access denied'));
  }

  testExecutions.splice(executionIndex, 1);

  res.json(deletedResponse('Execution deleted successfully'));
};

// GET /api/executions/:id/logs
export const getExecutionLogs = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const execution = testExecutions.find((ex) => ex.id === id);

  if (!execution) {
    return res.status(404).json(errorResponse('Execution not found'));
  }

  // Verify user has access to project
  const project = projects.find((p) => p.id === execution.projectId && p.userId === userId);
  if (!project) {
    return res.status(403).json(errorResponse('Access denied'));
  }

  const logs = execution.logs || [
    '[INFO] Starting test execution',
    '[INFO] Navigating to target URL',
    '[INFO] Performing test actions',
    '[SUCCESS] Test completed successfully',
  ];

  res.json(successResponse(logs));
};

// GET /api/executions/:id/screenshots
export const getExecutionScreenshots = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const execution = testExecutions.find((ex) => ex.id === id);

  if (!execution) {
    return res.status(404).json(errorResponse('Execution not found'));
  }

  // Verify user has access to project
  const project = projects.find((p) => p.id === execution.projectId && p.userId === userId);
  if (!project) {
    return res.status(403).json(errorResponse('Access denied'));
  }

  const screenshots = execution.screenshots || [];

  res.json(successResponse(screenshots));
};
