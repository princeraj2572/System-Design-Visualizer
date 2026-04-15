'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

interface ComplianceFrameworkStatus {
  framework: string;
  score: number;
  status: 'COMPLIANT' | 'MOSTLY_COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
  checksPassed: number;
  checksFailed: number;
  checksWarning: number;
  lastUpdated: Date;
}

interface ComplianceDashboardProps {
  projectId: string;
  projectName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  projectId,
  projectName = 'Project',
  isOpen,
  onClose,
}) => {
  const [frameworks, setFrameworks] = useState<ComplianceFrameworkStatus[]>([
    {
      framework: 'SOC2',
      score: 87,
      status: 'MOSTLY_COMPLIANT',
      checksPassed: 13,
      checksFailed: 1,
      checksWarning: 2,
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60000),
    },
    {
      framework: 'ISO27001',
      score: 72,
      status: 'PARTIAL',
      checksPassed: 10,
      checksFailed: 3,
      checksWarning: 2,
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60000),
    },
    {
      framework: 'HIPAA',
      score: 65,
      status: 'PARTIAL',
      checksPassed: 8,
      checksFailed: 4,
      checksWarning: 1,
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60000),
    },
    {
      framework: 'GDPR',
      score: 91,
      status: 'COMPLIANT',
      checksPassed: 14,
      checksFailed: 0,
      checksWarning: 1,
      lastUpdated: new Date(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-900';
    if (score >= 75) return 'bg-yellow-100 text-yellow-900';
    return 'bg-red-100 text-red-900';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'MOSTLY_COMPLIANT':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'PARTIAL':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'NON_COMPLIANT':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const handleRunCheck = async (framework: string) => {
    setIsLoading(true);
    try {
      // API call would go here
      // const response = await complianceService.runComplianceCheck(projectId, framework);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Update the framework status
      setFrameworks((prevFrameworks) =>
        prevFrameworks.map((f) =>
          f.framework === framework
            ? { ...f, lastUpdated: new Date(), score: Math.floor(Math.random() * 50) + 50 }
            : f
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    // In production, this would call the backend export endpoint
    const reportContent = `
COMPLIANCE DASHBOARD REPORT
Project: ${projectName}
Generated: ${new Date().toLocaleString()}

FRAMEWORK SUMMARY
${frameworks
  .map(
    (f) => `
${f.framework}
Score: ${f.score}/100
Status: ${f.status.replace(/_/g, ' ')}
Passed: ${f.checksPassed} | Failed: ${f.checksFailed} | Warning: ${f.checksWarning}
Last Updated: ${f.lastUpdated.toLocaleString()}
`
  )
  .join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-dashboard-${projectId}-${new Date().toISOString()}.txt`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 size={24} className="text-cyan-600" />
            <h2 className="text-2xl font-bold text-slate-900">Compliance Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6">
            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {frameworks.map((framework) => (
                <div
                  key={framework.framework}
                  className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedFramework(framework.framework)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{framework.framework}</h3>
                    <BarChart3 size={18} className="text-slate-400" />
                  </div>
                  <div className={`text-3xl font-bold mb-2 ${getScoreColor(framework.score)}`}>
                    {framework.score}%
                  </div>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      framework.status
                    )}`}
                  >
                    {framework.status.replace(/_/g, ' ')}
                  </div>
                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Passed:</span>
                      <span className="font-semibold text-green-600">{framework.checksPassed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed:</span>
                      <span className="font-semibold text-red-600">{framework.checksFailed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Warning:</span>
                      <span className="font-semibold text-yellow-600">
                        {framework.checksWarning}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunCheck(framework.framework);
                    }}
                    disabled={isLoading}
                    className="mt-4 w-full px-3 py-2 bg-cyan-50 text-cyan-700 rounded hover:bg-cyan-100 disabled:opacity-50 text-sm font-medium transition-colors"
                  >
                    {isLoading ? <RefreshCw size={14} className="inline animate-spin" /> : 'Run Check'}
                  </button>
                </div>
              ))}
            </div>

            {/* Details Section */}
            {selectedFramework && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {selectedFramework} - Detailed Checks
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      title: 'Data Encryption in Transit',
                      status: 'PASS',
                      severity: 'CRITICAL',
                    },
                    { title: 'Access Control & RBAC', status: 'PASS', severity: 'HIGH' },
                    { title: 'Audit Logging', status: 'WARNING', severity: 'HIGH' },
                    {
                      title: 'Disaster Recovery Plan',
                      status: 'FAIL',
                      severity: 'CRITICAL',
                    },
                  ].map((check, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded border flex items-start gap-3 ${
                        check.status === 'PASS'
                          ? 'bg-green-50 border-green-200'
                          : check.status === 'WARNING'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      {check.status === 'PASS' ? (
                        <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                      ) : check.status === 'WARNING' ? (
                        <AlertTriangle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{check.title}</div>
                        <div className="text-xs text-slate-600 mt-1">
                          Severity: <span className="font-semibold">{check.severity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trends */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-cyan-600" />
                <h3 className="text-lg font-semibold text-slate-900">Compliance Trend</h3>
              </div>
              <div className="bg-white rounded p-4 h-48 flex items-center justify-center border border-slate-200">
                <div className="text-sm text-slate-500">
                  Compliance trend data would be displayed here (Last 30 days)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Last updated: {frameworks[frameworks.length - 1]?.lastUpdated.toLocaleString()}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
            >
              <Download size={18} />
              Export Report
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
