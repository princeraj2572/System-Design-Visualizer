'use client';

import React, { useState } from 'react';
import { X, Download } from 'lucide-react';

export interface ComplianceReport {
  id: string;
  projectId: string;
  projectName: string;
  generatedAt: Date;
  framework: 'SOC2' | 'ISO27001' | 'HIPAA' | 'PCI-DSS' | 'GDPR';
  score: number;
  status: 'COMPLIANT' | 'MOSTLY_COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
  checks: ComplianceCheck[];
}

export interface ComplianceCheck {
  id: string;
  title: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'SKIPPED';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  remediation?: string;
  evidence?: string;
}

interface ComplianceReporterProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectName?: string;
}

// Mock compliance data
const MOCK_REPORTS: ComplianceReport[] = [
  {
    id: 'report-soc2-001',
    projectId: 'proj-1',
    projectName: 'E-Commerce Platform',
    generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60000),
    framework: 'SOC2',
    score: 87,
    status: 'MOSTLY_COMPLIANT',
    checks: [
      {
        id: 'check-1',
        title: 'Data Encryption in Transit',
        description: 'All data transmission uses TLS 1.2 or higher',
        status: 'PASS',
        severity: 'CRITICAL',
        evidence: 'All API connections use HTTPS with TLS 1.3',
      },
      {
        id: 'check-2',
        title: 'Data Encryption at Rest',
        description: 'All persistent data is encrypted',
        status: 'PASS',
        severity: 'CRITICAL',
        evidence: 'Database uses AES-256 encryption',
      },
      {
        id: 'check-3',
        title: 'Access Control',
        description: 'Role-based access control is implemented',
        status: 'PASS',
        severity: 'HIGH',
        evidence: '4 roles defined: Admin, Editor, Viewer, Guest',
      },
      {
        id: 'check-4',
        title: 'Audit Logging',
        description: 'All access is logged and monitored',
        status: 'WARNING',
        severity: 'HIGH',
        remediation: 'Increase retention period from 30 to 90 days',
        evidence: 'Basic audit logging in place',
      },
      {
        id: 'check-5',
        title: 'Disaster Recovery',
        description: 'Backup and recovery procedures are documented',
        status: 'FAIL',
        severity: 'CRITICAL',
        remediation: 'Implement automated daily backups with tested recovery procedure',
        evidence: 'Manual backup process only',
      },
    ],
  },
  {
    id: 'report-iso27001-001',
    projectId: 'proj-1',
    projectName: 'E-Commerce Platform',
    generatedAt: new Date(Date.now() - 30 * 24 * 60 * 60000),
    framework: 'ISO27001',
    score: 72,
    status: 'PARTIAL',
    checks: [
      {
        id: 'check-iso-1',
        title: 'Information Classification',
        description: 'Information assets are properly classified',
        status: 'PASS',
        severity: 'HIGH',
      },
      {
        id: 'check-iso-2',
        title: 'Asset Management',
        description: 'All assets are registered and tracked',
        status: 'WARNING',
        severity: 'MEDIUM',
        remediation: 'Create comprehensive asset inventory',
      },
      {
        id: 'check-iso-3',
        title: 'Supplier Contracts',
        description: 'Suppliers have security clauses in contracts',
        status: 'FAIL',
        severity: 'HIGH',
        remediation: 'Review and update all supplier agreements',
      },
    ],
  },
];

const STATUS_COLORS: Record<string, string> = {
  'PASS': 'bg-green-50 border-green-200 text-green-900',
  'FAIL': 'bg-red-50 border-red-200 text-red-900',
  'WARNING': 'bg-yellow-50 border-yellow-200 text-yellow-900',
  'SKIPPED': 'bg-slate-50 border-slate-200 text-slate-900',
};

const STATUS_ICONS: Record<string, string> = {
  'PASS': '✅',
  'FAIL': '❌',
  'WARNING': '⚠️',
  'SKIPPED': '⏭️',
};

const SCORE_COLOR = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-yellow-600';
  return 'text-red-600';
};

export const ComplianceReporter: React.FC<ComplianceReporterProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(
    MOCK_REPORTS[0]
  );
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);

  const handleGenerateReport = () => {
    // In a real implementation, this would trigger an API call
    alert('Compliance report generation requested. This would generate a new SOC2 report.');
  };

  const handleExportReport = () => {
    if (!selectedReport) return;

    const reportContent = `
COMPLIANCE REPORT
Framework: ${selectedReport.framework}
Project: ${selectedReport.projectName}
Generated: ${selectedReport.generatedAt.toLocaleString()}

EXECUTIVE SUMMARY
Score: ${selectedReport.score}/100
Status: ${selectedReport.status.replace(/_/g, ' ')}

COMPLIANCE CHECKS
${selectedReport.checks
  .map(
    (check) => `
${check.title}
Status: ${check.status}
Severity: ${check.severity}
${check.remediation ? `Remediation: ${check.remediation}` : ''}
`
  )
  .join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${selectedReport.framework}-${new Date().toISOString()}.txt`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Compliance Reports</h2>
            <p className="text-sm text-slate-500 mt-1">
              Verify compliance with security frameworks and standards
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-2"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Report List */}
          <div className="w-64 border-r border-slate-200 bg-slate-50 overflow-y-auto p-4 space-y-2">
            <button
              onClick={handleGenerateReport}
              className="w-full px-4 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition text-sm mb-4"
            >
              Generate New Report
            </button>

            <div className="font-semibold text-sm text-slate-700 mb-3 px-2">RECENT REPORTS</div>

            {MOCK_REPORTS.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm transition ${
                  selectedReport?.id === report.id
                    ? 'bg-cyan-100 border-2 border-cyan-500 font-semibold'
                    : 'hover:bg-slate-200 border-2 border-transparent'
                }`}
              >
                <div className="font-semibold text-slate-900">{report.framework}</div>
                <div className={`text-lg font-bold ${SCORE_COLOR(report.score)}`}>
                  {report.score}%
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {report.generatedAt.toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedReport ? (
              <>
                {/* Report Header */}
                <div className="px-8 py-6 border-b border-slate-200 bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {selectedReport.framework} Compliance Report
                      </h3>
                      <p className="text-sm text-slate-600">{selectedReport.projectName}</p>
                    </div>
                    <button
                      onClick={handleExportReport}
                      className="px-4 py-2 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>

                  {/* Score Card */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <div className={`text-4xl font-bold ${SCORE_COLOR(selectedReport.score)}`}>
                        {selectedReport.score}%
                      </div>
                      <div className="text-sm text-slate-600 mt-1">Compliance Score</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-slate-900">
                        {selectedReport.checks.filter((c) => c.status === 'PASS').length}/
                        {selectedReport.checks.length}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">Checks Passed</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <div className={`text-3xl font-bold ${
                        selectedReport.status === 'COMPLIANT' ? 'text-green-600' :
                        selectedReport.status === 'MOSTLY_COMPLIANT' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {selectedReport.status.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">Status</div>
                    </div>
                  </div>
                </div>

                {/* Compliance Checks */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {selectedReport.checks.map((check) => (
                    <div
                      key={check.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        STATUS_COLORS[check.status]
                      }`}
                      onClick={() =>
                        setExpandedCheck(expandedCheck === check.id ? null : check.id)
                      }
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{STATUS_ICONS[check.status]}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-slate-900">{check.title}</h4>
                            <span className="text-xs font-semibold px-2 py-1 bg-slate-200 rounded">
                              {check.severity}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700">{check.description}</p>

                          {expandedCheck === check.id && (
                            <div className="mt-3 pt-3 border-t border-slate-300 space-y-2">
                              {check.evidence && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-600 mb-1">EVIDENCE</p>
                                  <p className="text-sm text-slate-700 bg-white bg-opacity-70 p-2 rounded">
                                    {check.evidence}
                                  </p>
                                </div>
                              )}
                              {check.remediation && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-600 mb-1">REMEDIATION</p>
                                  <p className="text-sm text-slate-700 bg-white bg-opacity-70 p-2 rounded">
                                    {check.remediation}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="font-semibold">No report selected</p>
                  <p className="text-sm mt-1">Start by generating a compliance report</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceReporter;
