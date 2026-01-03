// Batch Execution Routes
import { Router } from 'express';
import {
  getExecutionBatch,
  createExecutionBatch,
  updateExecutionBatch,
  listExecutionBatches,
  streamBatchUpdates,
} from '../controllers/batchExecutionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All batch execution routes require authentication
router.use(authenticate);

// List all execution batches
router.get('/', listExecutionBatches);

// Get specific batch details
router.get('/:id', getExecutionBatch);

// Create new execution batch with multiple test cases
router.post('/', createExecutionBatch);

// Update batch status
router.put('/:id', updateExecutionBatch);

// Stream batch updates (SSE)
router.get('/:id/stream', streamBatchUpdates);

export default router;
