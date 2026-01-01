// Intent Parser routes
import { Router } from 'express';
import { parseIntent, getIntentHistory } from '../controllers/intentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All intent routes require authentication
router.use(authenticate);

// Parse user prompt to extract intent
router.post('/parse', parseIntent);

// Get intent history for current user
router.get('/history', getIntentHistory);

export default router;
