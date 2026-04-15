/**
 * Audit Controller
 * Handles audit log retrieval, creation, and export
 */

import { Request, Response, NextFunction } from 'express';
import { AuditService } from '@/services/auditService';

const auditService = new AuditService();

/**
 * Get audit logs for a specific project
 */
export async function getProjectAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const { skip = 0, take = 50, action, resourceType, startDate, endDate } = req.query;

    const logs = await auditService.getProjectAuditLogs(
      projectId,
      {
        skip: Number(skip),
        take: Number(take),
        action: action as string,
        resourceType: resourceType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      }
    );

    res.json({
      success: true,
      data: logs,
      message: 'Audit logs retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get audit logs for current user
 */
export async function getUserAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const { skip = 0, take = 50, startDate, endDate } = req.query;

    const logs = await auditService.getUserAuditLogs(userId, {
      skip: Number(skip),
      take: Number(take),
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({
      success: true,
      data: logs,
      message: 'User audit logs retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get specific audit log entry
 */
export async function getAuditLogEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const log = await auditService.getAuditLogEntry(id);

    res.json({
      success: true,
      data: log,
      message: 'Audit log entry retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create audit log entry
 */
export async function createAuditLog(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const { projectId, action, resourceType, resourceId, changes, metadata } = req.body;

    const log = await auditService.createAuditLog({
      userId,
      projectId,
      action,
      resourceType,
      resourceId,
      changes,
      metadata,
    });

    res.status(201).json({
      success: true,
      data: log,
      message: 'Audit log created successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Export audit logs as CSV
 */
export async function exportAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;

    const csv = await auditService.exportAuditLogsAsCSV(projectId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${projectId}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
}
