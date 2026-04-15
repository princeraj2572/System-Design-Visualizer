/**
 * Compliance Controller
 * Handles compliance checks, reports, and remediation
 */

import { Request, Response, NextFunction } from 'express';
import { ComplianceService } from '@/services/complianceService';

const complianceService = new ComplianceService();

/**
 * Run compliance check for a project against a framework
 */
export async function runComplianceCheck(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const { framework } = req.body;
    const userId = (req as any).user?.id;

    const report = await complianceService.runComplianceCheck(projectId, framework, userId);

    res.status(201).json({
      success: true,
      data: report,
      message: `Compliance check completed for ${framework}`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get compliance report for a project
 */
export async function getComplianceReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;

    const report = await complianceService.getLatestComplianceReport(projectId);

    res.json({
      success: true,
      data: report,
      message: 'Compliance report retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all compliance reports for user
 */
export async function getUserComplianceReports(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const { skip = 0, take = 50, framework } = req.query;

    const reports = await complianceService.getUserComplianceReports(userId, {
      skip: Number(skip),
      take: Number(take),
      framework: framework as string,
    });

    res.json({
      success: true,
      data: reports,
      message: 'User compliance reports retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get specific compliance framework details
 */
export async function getFrameworkDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const { framework } = req.params;

    const details = await complianceService.getFrameworkDetails(framework);

    res.json({
      success: true,
      data: details,
      message: 'Framework details retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update compliance check result (mark as resolved, add evidence)
 */
export async function updateComplianceCheck(req: Request, res: Response, next: NextFunction) {
  try {
    const { checkId } = req.params;
    const { status, evidence, remediation } = req.body;

    const updated = await complianceService.updateComplianceCheck(checkId, {
      status,
      evidence,
      remediation,
    });

    res.json({
      success: true,
      data: updated,
      message: 'Compliance check updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Export compliance report as PDF
 */
export async function exportComplianceReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;

    const pdfBuffer = await complianceService.exportReportAsPDF(projectId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="compliance-report-${projectId}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

/**
 * Get compliance trend over time
 */
export async function getComplianceTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const { days = 30 } = req.query;

    const trends = await complianceService.getComplianceTrends(projectId, Number(days));

    res.json({
      success: true,
      data: trends,
      message: 'Compliance trends retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Acknowledge compliance issue and set remediation date
 */
export async function acknowledgeIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const { checkId } = req.params;
    const { remediationDate, notes } = req.body;
    const userId = (req as any).user?.id;

    const acknowledged = await complianceService.acknowledgeIssue(checkId, {
      userId,
      remediationDate: new Date(remediationDate),
      notes,
    });

    res.json({
      success: true,
      data: acknowledged,
      message: 'Compliance issue acknowledged successfully',
    });
  } catch (error) {
    next(error);
  }
}
