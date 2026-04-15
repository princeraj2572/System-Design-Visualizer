'use client'

import React, { useState, useMemo } from 'react'
import { BarChart3, TrendingUp, CheckCircle, AlertTriangle, Zap } from 'lucide-react'
import { useArchitectureStore } from '@/store/architecture-store'
import { AnalyticsService } from '@/lib/analytics-service'
import { HealthScoringService } from '@/lib/health-scoring-service'

export interface ArchitectureHealthDashboardProps {
  onClose?: () => void
}

/**
 * Architecture Health Dashboard
 * Displays comprehensive system metrics, health scores, and recommendations
 */
export const ArchitectureHealthDashboard: React.FC<ArchitectureHealthDashboardProps> = ({
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'issues' | 'trends'>('overview')
  const { nodes, edges } = useArchitectureStore()

  // Calculate all metrics
  const analysis = useMemo(() => {
    if (nodes.length === 0) {
      return {
        metrics: null,
        nodeMetrics: [],
        healthReport: null,
        report: null,
      }
    }

    const metrics = AnalyticsService.calculateMetrics(nodes, edges)
    const nodeMetrics = AnalyticsService.calculateNodeMetrics(nodes, edges)
    const healthScore = HealthScoringService.calculateHealthScore(metrics, nodeMetrics)
    const healthReport = HealthScoringService.generateHealthReport(metrics, nodeMetrics)
    const report = AnalyticsService.generateReport('current', nodes, edges, healthScore)

    return {
      metrics,
      nodeMetrics,
      healthReport,
      report,
    }
  }, [nodes, edges])

  if (!analysis.metrics) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4">
          <h2 className="text-2xl font-bold mb-4">Architecture Health Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Create some components to analyze architecture health
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-6 px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Close
            </button>
          )}
        </div>
      </div>
    )
  }

  const { metrics, healthReport } = analysis

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-750 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Architecture Health Dashboard</h1>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-400"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Health Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Main Score Card */}
            <div className="col-span-1 md:col-span-2">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">Overall Health Score</p>
                    <div className="flex items-end gap-3">
                      <span className="text-6xl font-bold text-blue-600">
                        {healthReport.score}
                      </span>
                      <div className="mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                            healthReport.status === 'excellent'
                              ? 'bg-green-500'
                              : healthReport.status === 'good'
                                ? 'bg-blue-500'
                                : healthReport.status === 'fair'
                                  ? 'bg-yellow-500'
                                  : healthReport.status === 'poor'
                                    ? 'bg-orange-500'
                                    : 'bg-red-500'
                          }`}
                        >
                          {healthReport.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-800 dark:text-white">
                        {healthReport.scalability}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Scalability</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-800 dark:text-white">
                        {healthReport.maintainability}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Maintainability</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-800 dark:text-white">
                        {healthReport.reliability}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Reliability</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Metrics */}
            <ScoreCard
              icon={Zap}
              label="Performance"
              score={healthReport.performance}
              color="text-yellow-600"
              bgColor="bg-yellow-50 dark:bg-yellow-900/20"
              borderColor="border-yellow-200 dark:border-yellow-800"
            />
            <ScoreCard
              icon={AlertTriangle}
              label="Security"
              score={healthReport.security}
              color="text-red-600"
              bgColor="bg-red-50 dark:bg-red-900/20"
              borderColor="border-red-200 dark:border-red-800"
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700 mb-6 flex gap-1">
            {(['overview', 'metrics', 'issues', 'trends'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-semibold text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Architecture Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <MetricBox label="Components" value={metrics.nodeCount} />
                <MetricBox label="Connections" value={metrics.edgeCount} />
                <MetricBox label="Avg Connectivity" value={metrics.averageConnectivity.toFixed(1)} />
                <MetricBox label="Avg Path Length" value={metrics.avgPathLength.toFixed(1)} />
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">Recommendations</h4>
                {healthReport.suggestions.map((suggestion, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 dark:text-slate-300">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
              <div className="grid gap-4">
                <MetricRow label="Cyclomatic Complexity" value={metrics.cyclomaticComplexity} />
                <MetricRow label="Graph Density" value={(metrics.graphDensity * 100).toFixed(1) + '%'} />
                <MetricRow label="Max Connectivity" value={metrics.maxConnectivity} />
                <MetricRow label="Min Connectivity" value={metrics.minConnectivity} />
                <MetricRow label="Component Clusters" value={metrics.componentClusters} />
              </div>
            </div>
          )}

          {activeTab === 'issues' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Issues & Alerts</h3>
              {healthReport.issues.length > 0 ? (
                <div className="space-y-3">
                  {healthReport.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`p-4 rounded border-l-4 ${
                        issue.severity === 'critical'
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-400'
                          : issue.severity === 'high'
                            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400'
                            : issue.severity === 'medium'
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400'
                              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-400'
                      }`}
                    >
                      <p className="font-semibold text-slate-800 dark:text-white mb-1">
                        {issue.description}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <strong>Impact:</strong> {issue.impact}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        <strong>Resolution:</strong> {issue.resolution}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">No critical issues detected!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'trends' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">30-Day Trends</h3>
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Component Growth</p>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">
                    {analysis.report?.trends[analysis.report.trends.length - 1]?.nodeCount || 0}
                    <span className="text-xs text-slate-500 ml-2">
                      (+
                      {(analysis.report?.trends[analysis.report.trends.length - 1]?.nodeCount || 0) -
                        (analysis.report?.trends[0]?.nodeCount || 0)}
                      )
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Complexity Trend</p>
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6 flex justify-end gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold transition-colors"
            >
              Close
            </button>
          )}
          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition-colors">
            Export Report
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper Components

interface ScoreCardProps {
  icon: React.ElementType
  label: string
  score: number
  color: string
  bgColor: string
  borderColor: string
}

const ScoreCard: React.FC<ScoreCardProps> = ({ icon: Icon, label, score, color, bgColor, borderColor }) => (
  <div className={`${bgColor} ${borderColor} rounded-lg p-4 border`}>
    <div className="flex items-center gap-3">
      <Icon className={`w-8 h-8 ${color}`} />
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{score}</p>
      </div>
    </div>
  </div>
)

interface MetricBoxProps {
  label: string
  value: string | number
}

const MetricBox: React.FC<MetricBoxProps> = ({ label, value }) => (
  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{label}</p>
    <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
  </div>
)

interface MetricRowProps {
  label: string
  value: string | number
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value }) => (
  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded">
    <span className="text-slate-700 dark:text-slate-300">{label}</span>
    <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
  </div>
)
