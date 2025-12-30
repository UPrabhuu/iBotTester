// Configuration routes
import { Router } from 'express';
import { getConfiguration, updateConfiguration } from '../controllers/configController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All config routes require authentication
router.use(authenticate);

router.get('/:projectId', getConfiguration);
router.put('/:projectId', updateConfiguration);

export default router;
