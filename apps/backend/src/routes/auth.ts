// Authentication routes
import { Router } from 'express';
import {
  login,
  googleLogin,
  githubLogin,
  logout,
  forgotPassword,
  getCurrentUser,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/google', googleLogin);
router.post('/github', githubLogin);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticate, getCurrentUser);

export default router;
