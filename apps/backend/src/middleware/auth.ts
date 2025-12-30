// Authentication middleware
import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import { users } from '../data/mockData';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
      };
    }
  }
}

// Simple auth middleware (mock implementation)
// In production, this would validate JWT tokens
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Check for Authorization header or session
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  // For mock purposes, extract email from token or use default
  let userEmail = 'john.doe@example.com'; // Default mock user

  // Simple token parsing (in real app, verify JWT)
  if (token && token !== 'null' && token !== 'undefined') {
    try {
      // Mock token decode - in real app use jwt.verify()
      const decoded = JSON.parse(Buffer.from(token.split('.')[1] || '{}', 'base64').toString());
      userEmail = decoded.email || userEmail;
    } catch (e) {
      // Ignore parsing errors, use default
    }
  }

  // Find user
  const user = users.find((u) => u.email === userEmail);

  if (!user) {
    return res.status(401).json(errorResponse('Unauthorized'));
  }

  // Attach user to request
  req.user = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  next();
};

// Optional auth middleware - doesn't fail if no user
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (token && token !== 'null' && token !== 'undefined') {
    try {
      const decoded = JSON.parse(Buffer.from(token.split('.')[1] || '{}', 'base64').toString());
      const user = users.find((u) => u.email === decoded.email);
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      }
    } catch (e) {
      // Ignore errors
    }
  }

  next();
};
