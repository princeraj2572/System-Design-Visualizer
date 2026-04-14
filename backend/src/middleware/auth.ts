/**
 * Authentication Middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { AuthenticationError } from '@/utils/errors';

export interface AuthRequest extends Request {
  userId?: string;
  user?: { id: string; email: string };
}

export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string };

    req.userId = decoded.userId;
    req.user = { id: decoded.userId, email: decoded.email };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid or expired token');
    }
    throw error;
  }
};

export const optionalAuthMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string };
      req.userId = decoded.userId;
      req.user = { id: decoded.userId, email: decoded.email };
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};
