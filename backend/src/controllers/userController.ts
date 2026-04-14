/**
 * User Controller
 */

import { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/userService';
import { validateRegister, validateLogin } from '@/validators/user';
import { asyncHandler } from '@/middleware/errorHandler';
import { successResponse } from '@/utils/response';
import { AuthRequest } from '@/middleware/auth';

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, username, password } = validateRegister(req.body);

    const user = await UserService.registerUser(email, username, password);

    res.status(201).json(
      successResponse(user, 'User registered successfully', 'create')
    );
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = validateLogin(req.body);

    const { user, token } = await UserService.loginUser(email, password);

    res.json(
      successResponse(
        { user, token },
        'Login successful',
        'read'
      )
    );
  }
);

export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await UserService.getUserById(req.userId!);

    res.json(
      successResponse(user, 'User profile retrieved successfully', 'read')
    );
  }
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { username, email } = req.body;

    const user = await UserService.updateUserProfile(req.userId!, {
      username,
      email,
    });

    res.json(
      successResponse(user, 'User profile updated successfully', 'update')
    );
  }
);
