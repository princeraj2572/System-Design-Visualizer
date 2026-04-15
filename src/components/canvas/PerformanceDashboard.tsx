'use client';

import React, { useState, useEffect } from 'react';
import { X, BarChart3, AlertCircle, Download } from 'lucide-react';
import { performanceMonitor } from '@/lib/performance-monitor';

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState(performanceMonitor.getReport());
  const [warnings, setWarnings] = useState(performanceMonitor.getWarnings());

  useEffect(() => {
    const interval = setInterval(() => {
      setReport(performanceMonitor.getReport());
      setWarnings(performanceMonitor.getWarnings());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const handleExport = () => {
    const csv = performanceMonitor.exportAsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 size={24} className="text-cyan-600" />
            <h2 className="text-2xl font-bold text-slate-900">Performance Metrics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Score Card */}
          <div className={`rounded-lg p-6 ${getScoreColor(report.summary.performanceScore)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">Performance Score</h3>
                <div className="text-5xl font-bold">{report.summary.performanceScore}</div>
                <p className="text-sm mt-2 opacity-80">
                  {report.summary.performanceScore >= 80
                    ? 'Excellent performance'
                    : report.summary.performanceScore >= 60
                    ? 'Good performance with room for improvement'
                    : 'Performance optimization needed'}
                </p>
              </div>
              <div className="text-6xl opacity-20">
                {report.summary.performanceScore >= 80 ? '✓' : '⚠️'}
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="text-xs text-slate-600 font-medium mb-2">Avg Render Time</div>
              <div className="text-2xl font-bold text-slate-900">
                {report.summary.avgRenderTime.toFixed(2)}
              </div>
              <div className="text-xs text-slate-600 mt-1">ms</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="text-xs text-slate-600 font-medium mb-2">Avg Network Time</div>
              <div className="text-2xl font-bold text-slate-900">
                {report.summary.avgNetworkTime.toFixed(2)}
              </div>
              <div className="text-xs text-slate-600 mt-1">ms</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="text-xs text-slate-600 font-medium mb-2">Memory Usage</div>
              <div className="text-2xl font-bold text-slate-900">
                {report.summary.memoryUsage.toFixed(1)}
              </div>
              <div className="text-xs text-slate-600 mt-1">MB</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="text-xs text-slate-600 font-medium mb-2">Avg Interaction Time</div>
              <div className="text-2xl font-bold text-slate-900">
                {report.summary.avgInteractionTime.toFixed(2)}
              </div>
              <div className="text-xs text-slate-600 mt-1">ms</div>
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={20} className="text-red-600" />
                <h3 className="font-semibold text-red-900">Performance Warnings</h3>
              </div>
              <div className="space-y-2">
                {warnings.map((warning, idx) => (
                  <div key={idx} className="text-sm text-red-800">
                    <strong>{warning.name}</strong>: {warning.value.toFixed(2)} {warning.unit}
                    {warning.threshold && (
                      <span> (threshold: {warning.threshold.toFixed(2)} {warning.unit})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Metrics */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Detailed Metrics</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {report.metrics.slice().reverse().map((metric, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded flex justify-between items-center text-sm ${
                    metric.warning
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-white border border-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-medium text-slate-900">{metric.name}</span>
                    <span className="text-slate-600 ml-2">
                      {metric.value.toFixed(2)} {metric.unit}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(metric.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Report generated: {report.timestamp.toLocaleString()}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
            >
              <Download size={18} />
              Export CSV
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
