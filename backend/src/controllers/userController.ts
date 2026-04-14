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
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, username, password } = validateRegister(req.body);

    const user = await UserService.registerUser(email, username, password);

    res.status(201).json(
      successResponse(user, 'User registered successfully')
    );
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = validateLogin(req.body);

    const { user, token } = await UserService.loginUser(email, password);

    res.json(
      successResponse(
        { user, token },
        'Login successful'
      )
    );
  }
);

export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const user = await UserService.getUserById(req.userId!);

    res.json(
      successResponse(user, 'User profile retrieved successfully')
    );
  }
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { username, email } = req.body;

    const user = await UserService.updateUserProfile(req.userId!, {
      username,
      email,
    });

    res.json(
      successResponse(user, 'User profile updated successfully')
    );
  }
);
