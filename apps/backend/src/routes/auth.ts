// Authentication routes
import { Router } from 'express';
import {
  login,
  register,
  googleLogin,
  githubLogin,
  googleOAuthInitiate,
  googleOAuthCallback,
  githubOAuthInitiate,
  githubOAuthCallback,
  logout,
  forgotPassword,
  getCurrentUser,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Traditional auth
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticate, getCurrentUser);

// OAuth routes
router.get('/google', googleOAuthInitiate);
router.get('/google/callback', googleOAuthCallback);
router.get('/github', githubOAuthInitiate);
router.get('/github/callback', githubOAuthCallback);

export default router;
