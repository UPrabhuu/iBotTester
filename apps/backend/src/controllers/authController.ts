// Authentication controller
import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import { users } from '../data/mockData';
import { User } from '../models/types';

// Mock JWT token generation (in production, use actual JWT library)
const generateMockToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
  // In real app: return jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });
  return Buffer.from(JSON.stringify(payload)).toString('base64') + '.mock.token';
};

// Remove password from user object
const sanitizeUser = (user: User) => {
  const { password, ...sanitized } = user;
  return sanitized;
};

// POST /api/auth/login
export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(errorResponse('Email and password are required'));
  }

  // Find user
  const user = users.find((u) => u.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json(errorResponse('Invalid credentials'));
  }

  // Generate token
  const token = generateMockToken(user);

  res.json(
    successResponse({
      user: sanitizeUser(user),
      token,
    })
  );
};

// POST /api/auth/google
export const googleLogin = (req: Request, res: Response) => {
  const { token } = req.body;

  // Mock Google OAuth
  // In real app, verify Google token and get user info
  const mockUser = {
    id: 'user-google-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gmail.com',
    phone: '',
    company: '',
    role: 'User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const authToken = generateMockToken(mockUser as User);

  res.json(
    successResponse({
      user: mockUser,
      token: authToken,
    })
  );
};

// POST /api/auth/github
export const githubLogin = (req: Request, res: Response) => {
  const { code } = req.body;

  // Mock GitHub OAuth
  // In real app, exchange code for access token and get user info
  const mockUser = {
    id: 'user-github-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@github.com',
    phone: '',
    company: '',
    role: 'Developer',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const authToken = generateMockToken(mockUser as User);

  res.json(
    successResponse({
      user: mockUser,
      token: authToken,
    })
  );
};

// POST /api/auth/logout
export const logout = (req: Request, res: Response) => {
  // In real app, invalidate token or clear session
  res.json(successResponse({ message: 'Logged out successfully' }));
};

// POST /api/auth/forgot-password
export const forgotPassword = (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(errorResponse('Email is required'));
  }

  // Find user
  const user = users.find((u) => u.email === email);

  if (!user) {
    // Don't reveal if email exists for security
    return res.json(
      successResponse({
        message: 'If the email exists, a password reset link has been sent',
      })
    );
  }

  // In real app, send password reset email
  res.json(
    successResponse({
      message: 'Password reset link has been sent to your email',
    })
  );
};

// GET /api/auth/me
export const getCurrentUser = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json(errorResponse('Not authenticated'));
  }

  const user = users.find((u) => u.id === req.user!.id);

  if (!user) {
    return res.status(404).json(errorResponse('User not found'));
  }

  res.json(successResponse(sanitizeUser(user)));
};
