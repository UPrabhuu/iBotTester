// Test management routes
import { Router } from 'express';
import {
  listTestCases,
  getTestCase,
  createTestCase,
  updateTestCase,
  deleteTestCase,
  deleteBulkTestCases,
  getTestSteps,
  createTestStep,
  updateTestStep,
  deleteTestStep,
  migrateTestSteps,
} from '../controllers/testController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All test routes require authentication
router.use(authenticate);

// Test case routes
router.get('/', listTestCases);

// Migration route - must come BEFORE /:id to avoid being caught by it
router.post('/migrate/add-default-steps', migrateTestSteps);

// Bulk operations - must come BEFORE /:id to avoid being caught by it
router.delete('/bulk', deleteBulkTestCases);

// Individual test case routes
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
