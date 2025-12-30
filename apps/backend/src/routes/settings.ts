// Settings routes
import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getIntegrations,
  connectIntegration,
  disconnectIntegration,
} from '../controllers/settingsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All settings routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.get('/integrations', getIntegrations);
router.post('/integrations', connectIntegration);
router.delete('/integrations/:name', disconnectIntegration);

export default router;
