/**
 * Project Routes
 */

import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import * as projectController from '@/controllers/projectController';

const router = Router();

// Require authentication for all project routes
router.use(authMiddleware);

// Create project
router.post('/', projectController.createProject);

// List user's projects
router.get('/', projectController.listProjects);

// Get specific project
router.get('/:id', projectController.getProject);

// Update project
router.put('/:id', projectController.updateProject);

// Delete project
router.delete('/:id', projectController.deleteProject);

// Export project
router.get('/:id/export', projectController.exportProject);

export default router;
