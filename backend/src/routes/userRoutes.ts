/**
 * User Routes
 */

import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import * as userController from '@/controllers/userController';

const router = Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

export default router;
