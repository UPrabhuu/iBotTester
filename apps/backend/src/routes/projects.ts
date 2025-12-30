// Project routes
import { Router } from 'express';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  listBranches,
  createBranch,
  updateBranch,
} from '../controllers/projectController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.get('/', listProjects);
router.get('/:id', getProject);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Branch routes
router.get('/:id/branches', listBranches);
router.post('/:id/branches', createBranch);
router.put('/:id/branches/:branchId', updateBranch);

export default router;
