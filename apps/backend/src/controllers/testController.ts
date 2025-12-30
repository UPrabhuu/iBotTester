// Test management controller
import { Request, Response } from 'express';
import {
  successResponse,
  errorResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
} from '../utils/response';
import { testCases, testSteps, generateId, projects } from '../data/mockData';
import { TestCase, TestStep } from '../models/types';

// GET /api/test-cases
export const listTestCases = (req: Request, res: Response) => {
  const { projectId, branchId, status } = req.query;
  const userId = req.user?.id;

  let filtered = [...testCases];

  // Filter by project and verify user access
  if (projectId) {
    const project = projects.find((p) => p.id === projectId && p.userId === userId);
    if (!project) {
      return res.status(403).json(errorResponse('Access denied to this project'));
    }
    filtered = filtered.filter((tc) => tc.projectId === projectId);
  }

  // Filter by branch
  if (branchId) {
    filtered = filtered.filter((tc) => tc.branchId === branchId);
  }

  // Filter by status
  if (status) {
    filtered = filtered.filter((tc) => tc.status === status);
  }

  res.json(successResponse(filtered));
};

// GET /api/test-cases/:id
export const getTestCase = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const testCase = testCases.find((tc) => tc.id === id);

  if (!testCase) {
    return res.status(404).json(errorResponse('Test case not found'));
  }

  // Verify user has access to project
  const project = projects.find((p) => p.id === testCase.projectId && p.userId === userId);
  if (!project) {
    return res.status(403).json(errorResponse('Access denied'));
  }

  res.json(successResponse(testCase));
};

// POST /api/test-cases
export const createTestCase = (req: Request, res: Response) => {
  const { name, description, projectId, branchId, status } = req.body;
  const userId = req.user?.id;

  if (!name || !projectId || !branchId) {
    return res.status(400).json(errorResponse('Name, projectId, and branchId are required'));
  }

  // Verify user has access to project
  const project = projects.find((p) => p.id === projectId && p.userId === userId);
  if (!project) {
    return res.status(403).json(errorResponse('Access denied to this project'));
  }

  const newTestCase: TestCase = {
    id: generateId('test'),
    name,
    description: description || '',
    status: status || 'draft',
    projectId,
    branchId,
    steps: [],
    createdAt: new Date(),
    lastModified: new Date(),
  };

  testCases.push(newTestCase);

  res.status(201).json(createdResponse(newTestCase));
};

// PUT /api/test-cases/:id
export const updateTestCase = (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, status } = req.body;
  const userId = req.user?.id;

  const testCaseIndex = testCases.findIndex((tc) => tc.id === id);

  if (testCaseIndex === -1) {
    return res.status(404).json(errorResponse('Test case not found'));
  }

  // Verify user has access to project
  const project = projects.find(
    (p) => p.id === testCases[testCaseIndex].projectId && p.userId === userId
  );
  if (!project) {
    return res.status(403).json(errorResponse('Access denied'));
  }

  // Update fields
  if (name) testCases[testCaseIndex].name = name;
  if (description !== undefined) testCases[testCaseIndex].description = description;
  if (status) testCases[testCaseIndex].status = status;
  testCases[testCaseIndex].lastModified = new Date();

  res.json(updatedResponse(testCases[testCaseIndex]));
};

// DELETE /api/test-cases/:id
export const deleteTestCase = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const testCaseIndex = testCases.findIndex((tc) => tc.id === id);

  if (testCaseIndex === -1) {
    return res.status(404).json(errorResponse('Test case not found'));
  }

  // Verify user has access to project
  const project = projects.find(
    (p) => p.id === testCases[testCaseIndex].projectId && p.userId === userId
  );
  if (!project) {
    return res.status(403).json(errorResponse('Access denied'));
  }

  // Delete associated steps
  const stepsToDelete = testSteps.filter((s) => s.testCaseId === id);
  stepsToDelete.forEach((step) => {
    const stepIndex = testSteps.findIndex((s) => s.id === step.id);
    if (stepIndex > -1) testSteps.splice(stepIndex, 1);
  });

  testCases.splice(testCaseIndex, 1);

  res.json(deletedResponse('Test case deleted successfully'));
};

// GET /api/test-cases/:id/steps
export const getTestSteps = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const testCase = testCases.find((tc) => tc.id === id);

  if (!testCase) {
    return res.status(404).json(errorResponse('Test case not found'));
  }

  // Verify user has access to project
  const project = projects.find((p) => p.id === testCase.projectId && p.userId === userId);
  if (!project) {
    return res.status(403).json(errorResponse('Access denied'));
  }

  const steps = testSteps.filter((s) => s.testCaseId === id).sort((a, b) => a.stepNumber - b.stepNumber);

  res.json(successResponse(steps));
};

// POST /api/test-cases/:id/steps
export const createTestStep = (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, expectedResult, elementLocator, uiSection, stepNumber } = req.body;
  const userId = req.user?.id;

  const testCase = testCases.find((tc) => tc.id === id);

  if (!testCase) {
    return res.status(404).json(errorResponse('Test case not found'));
  }

  // Verify user has access to project
  const project = projects.find((p) => p.id === testCase.projectId && p.userId === userId);
  if (!project) {
    return res.status(403).json(errorResponse('Access denied'));
  }

  if (!action || !expectedResult) {
    return res.status(400).json(errorResponse('Action and expectedResult are required'));
  }

  // Calculate step number if not provided
  const existingSteps = testSteps.filter((s) => s.testCaseId === id);
  const maxStepNumber = existingSteps.length > 0 
    ? Math.max(...existingSteps.map((s) => s.stepNumber)) 
    : 0;

  const newStep: TestStep = {
    id: generateId('step'),
    stepNumber: stepNumber || maxStepNumber + 1,
    action,
    expectedResult,
    elementLocator,
    uiSection: uiSection || 'General',
    testCaseId: id,
  };

  testSteps.push(newStep);

  // Update test case
  const testCaseIndex = testCases.findIndex((tc) => tc.id === id);
  if (testCaseIndex > -1) {
    testCases[testCaseIndex].steps.push(newStep.id);
    testCases[testCaseIndex].lastModified = new Date();
  }

  res.status(201).json(createdResponse(newStep));
};

// PUT /api/test-steps/:id
export const updateTestStep = (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, expectedResult, elementLocator, uiSection, stepNumber } = req.body;
  const userId = req.user?.id;

  const stepIndex = testSteps.findIndex((s) => s.id === id);

  if (stepIndex === -1) {
    return res.status(404).json(errorResponse('Test step not found'));
  }

  const step = testSteps[stepIndex];
  const testCase = testCases.find((tc) => tc.id === step.testCaseId);

  if (!testCase) {
    return res.status(404).json(errorResponse('Associated test case not found'));
  }

  // Verify user has access to project
  const project = projects.find((p) => p.id === testCase.projectId && p.userId === userId);
  if (!project) {
    return res.status(403).json(errorResponse('Access denied'));
  }

  // Update fields
  if (action) testSteps[stepIndex].action = action;
  if (expectedResult) testSteps[stepIndex].expectedResult = expectedResult;
  if (elementLocator !== undefined) testSteps[stepIndex].elementLocator = elementLocator;
  if (uiSection) testSteps[stepIndex].uiSection = uiSection;
  if (stepNumber) testSteps[stepIndex].stepNumber = stepNumber;

  // Update test case lastModified
  const testCaseIndex = testCases.findIndex((tc) => tc.id === step.testCaseId);
  if (testCaseIndex > -1) {
    testCases[testCaseIndex].lastModified = new Date();
  }

  res.json(updatedResponse(testSteps[stepIndex]));
};

// DELETE /api/test-steps/:id
export const deleteTestStep = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const stepIndex = testSteps.findIndex((s) => s.id === id);

  if (stepIndex === -1) {
    return res.status(404).json(errorResponse('Test step not found'));
  }

  const step = testSteps[stepIndex];
  const testCase = testCases.find((tc) => tc.id === step.testCaseId);

  if (!testCase) {
    return res.status(404).json(errorResponse('Associated test case not found'));
  }

  // Verify user has access to project
  const project = projects.find((p) => p.id === testCase.projectId && p.userId === userId);
  if (!project) {
    return res.status(403).json(errorResponse('Access denied'));
  }

  // Remove from test case steps array
  const testCaseIndex = testCases.findIndex((tc) => tc.id === step.testCaseId);
  if (testCaseIndex > -1) {
    testCases[testCaseIndex].steps = testCases[testCaseIndex].steps.filter((sid) => sid !== id);
    testCases[testCaseIndex].lastModified = new Date();
  }

  testSteps.splice(stepIndex, 1);

  res.json(deletedResponse('Test step deleted successfully'));
};
