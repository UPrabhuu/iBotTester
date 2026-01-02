import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  executeWorkflow,
  listWorkflows,
  getWorkflow,
  getWorkflowActivities,
  deleteWorkflow,
  getWorkflowTestModel,
  getWorkflowDiscovery,
} from '../controllers/workflowController';

const router = Router();

// All workflow routes require authentication
router.use(authenticate);

/**
 * POST /api/workflows/execute
 * Execute the complete agent workflow and save to database
 */
router.post('/execute', executeWorkflow);

/**
 * GET /api/workflows
 * List user's workflow executions with pagination
 */
router.get('/', listWorkflows);

/**
 * GET /api/workflows/:id
 * Get workflow execution details with all activities
 */
router.get('/:id', getWorkflow);

/**
 * GET /api/workflows/:id/activities
 * Get workflow activities (intent, discovery, generation)
 */
router.get('/:id/activities', getWorkflowActivities);

/**
 * GET /api/workflows/:id/test-model
 * Get generated test model JSON from workflow
 */
router.get('/:id/test-model', getWorkflowTestModel);

/**
 * GET /api/workflows/:id/discovery
 * Get discovered page snapshot from workflow
 */
router.get('/:id/discovery', getWorkflowDiscovery);

/**
 * DELETE /api/workflows/:id
 * Delete workflow execution
 */
router.delete('/:id', deleteWorkflow);

export default router;
