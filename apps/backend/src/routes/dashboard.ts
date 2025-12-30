// Dashboard routes
import { Router } from 'express';
import {
  getDashboardMetrics,
  getRecentActivity,
  getExecutionTrends,
} from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

router.get('/metrics', getDashboardMetrics);
router.get('/activity', getRecentActivity);
router.get('/trends', getExecutionTrends);

export default router;
