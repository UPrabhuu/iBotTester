// Test management routes
import { Router } from 'express';
import {
  listTestCases,
  getTestCase,
  createTestCase,
  updateTestCase,
  deleteTestCase,
  getTestSteps,
  createTestStep,
  updateTestStep,
  deleteTestStep,
} from '../controllers/testController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All test routes require authentication
router.use(authenticate);

// Test case routes
router.get('/', listTestCases);
router.get('/:id', getTestCase);
router.post('/', createTestCase);
router.put('/:id', updateTestCase);
router.delete('/:id', deleteTestCase);

// Test step routes
router.get('/:id/steps', getTestSteps);
router.post('/:id/steps', createTestStep);

export default router;

// Separate router for test steps
export const testStepRouter = Router();
testStepRouter.use(authenticate);
testStepRouter.put('/:id', updateTestStep);
testStepRouter.delete('/:id', deleteTestStep);
