/**
 * Audit Logs Routes
 */

import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import * as auditController from '@/controllers/auditController';

const router = Router();

// Require authentication for all audit routes
router.use(authMiddleware);

// Get audit logs for a project
router.get('/project/:projectId', auditController.getProjectAuditLogs);

// Get audit logs for user
router.get('/user', auditController.getUserAuditLogs);

// Get specific audit log entry
router.get('/:id', auditController.getAuditLogEntry);

// Export audit logs as CSV
router.get('/project/:projectId/export', auditController.exportAuditLogs);

// Create audit log entry
router.post('/', auditController.createAuditLog);

export default router;
