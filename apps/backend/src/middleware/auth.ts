// Authentication middleware
import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import { verifyToken } from '../utils/auth';
import prisma from '../utils/prisma';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

// Authentication middleware using JWT
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for Authorization header or query parameter (for SSE/EventSource)
    let token = '';
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else if (req.query.token) {
      // Allow token in query parameter for EventSource connections (SSE)
      token = req.query.token as string;
    } else {
      return res.status(401).json(errorResponse('No token provided'));
    }

    if (!token) {
      return res.status(401).json(errorResponse('No token provided'));
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return res.status(401).json(errorResponse('User not found'));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json(errorResponse('Invalid or expired token'));
  }
};

// Optional auth middleware - doesn't fail if no user
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true },
      });
      
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    console.log('Optional auth failed:', error);
  }
  
  next();
};
