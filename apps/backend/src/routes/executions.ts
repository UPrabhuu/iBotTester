// Execution routes
import { Router } from 'express';
import {
  listExecutions,
  getExecution,
  createExecution,
  rerunExecution,
  deleteExecution,
  getExecutionLogs,
  getExecutionScreenshots,
} from '../controllers/executionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All execution routes require authentication
router.use(authenticate);

router.get('/', listExecutions);
router.get('/:id', getExecution);
router.post('/', createExecution);
router.post('/:id/rerun', rerunExecution);
router.delete('/:id', deleteExecution);
router.get('/:id/logs', getExecutionLogs);
router.get('/:id/screenshots', getExecutionScreenshots);

export default router;
