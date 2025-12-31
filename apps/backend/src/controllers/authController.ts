// Authentication controller
/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import { generateToken, hashPassword, comparePassword, sanitizeUser } from '../utils/auth';
import prisma from '../utils/prisma';
import passport from '../config/passport';

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(errorResponse('Email and password are required'));
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    // Check if user is an OAuth user (no password set)
    if (!user.password || user.password === '') {
      return res.status(401).json(errorResponse('Please sign in using ' + (user.provider || 'OAuth provider')));
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    res.json(
      successResponse({
        user: sanitizeUser(user),
        token,
      })
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json(errorResponse('Email, password, first name, and last name are required'));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json(errorResponse('Invalid email format'));
    }

    // Validate password strength (at least 6 characters)
    if (password.length < 6) {
      return res.status(400).json(errorResponse('Password must be at least 6 characters long'));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json(errorResponse('User with this email already exists'));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        provider: 'local',
      },
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    res.status(201).json(
      successResponse({
        user: sanitizeUser(user),
        token,
      })
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// POST /api/auth/google
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    // TODO: Implement actual Google OAuth verification
    // For now, this is a mock implementation
    
    res.status(501).json(errorResponse('Google login not yet implemented'));
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// Google OAuth initiate
export const googleOAuthInitiate = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// Google OAuth callback
export const googleOAuthCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', (err: any, user: any, info: any) => {
    if (err) {
      console.error('Google OAuth error:', err);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=auth_failed`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=no_user`);
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}&user=${encodeURIComponent(JSON.stringify(sanitizeUser(user)))}`);
  })(req, res, next);
};

// POST /api/auth/github
export const githubLogin = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    // TODO: Implement actual GitHub OAuth
    // For now, this is a mock implementation
    
    res.status(501).json(errorResponse('GitHub login not yet implemented'));
  } catch (error) {
    console.error('GitHub login error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GitHub OAuth initiate
export const githubOAuthInitiate = passport.authenticate('github', {
  scope: ['user:email']
});

// GitHub OAuth callback
export const githubOAuthCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('github', (err: any, user: any, info: any) => {
    if (err) {
      console.error('GitHub OAuth error:', err);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=auth_failed`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=no_user`);
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}&user=${encodeURIComponent(JSON.stringify(sanitizeUser(user)))}`);
  })(req, res, next);
};

// POST /api/auth/logout
export const logout = (req: Request, res: Response) => {
  // With JWT, logout is handled client-side by removing the token
  res.json(successResponse({ message: 'Logged out successfully' }));
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(errorResponse('Email is required'));
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if email exists for security
    // In production, send password reset email here
    
    res.json(
      successResponse({
        message: 'If the email exists, a password reset link has been sent',
      })
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GET /api/auth/me
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse('Not authenticated'));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    res.json(successResponse(sanitizeUser(user)));
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};
