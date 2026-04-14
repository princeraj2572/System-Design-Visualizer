/**
 * Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors';
import { errorResponse } from '@/utils/response';
import logger from '@/utils/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      errorResponse(err.message, 'APP_ERROR', err.details)
    );
    return;
  }

  res.status(500).json(
    errorResponse(
      'Internal server error',
      'INTERNAL_ERROR'
    )
  );
};

export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
