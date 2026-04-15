/**
 * Compliance Routes
 */

import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import * as complianceController from '@/controllers/complianceController';

const router = Router();

// Require authentication for all compliance routes
router.use(authMiddleware);

// Run compliance check for a project
router.post('/check/:projectId', complianceController.runComplianceCheck);

// Get compliance report for a project
router.get('/report/:projectId', complianceController.getComplianceReport);

// Get all compliance reports for user
router.get('/', complianceController.getUserComplianceReports);

// Get specific compliance framework details
router.get('/framework/:framework', complianceController.getFrameworkDetails);

// Update compliance check result (mark as resolved, add evidence)
router.put('/check/:checkId', complianceController.updateComplianceCheck);

// Export compliance report as PDF
router.get('/report/:projectId/export', complianceController.exportComplianceReport);

// Get compliance trend over time
router.get('/project/:projectId/trends', complianceController.getComplianceTrends);

// Acknowledge compliance issue and set remediation date
router.post('/acknowledge/:checkId', complianceController.acknowledgeIssue);

export default router;
