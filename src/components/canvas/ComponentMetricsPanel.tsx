'use client'

import React, { useState, useMemo } from 'react'
import { Activity, TrendingDown, TrendingUp, Zap, AlertCircle } from 'lucide-react'
import { useArchitectureStore } from '@/store/architecture-store'
import { AnalyticsService } from '@/lib/analytics-service'
import type { NodeMetrics } from '@/lib/analytics-service'

export interface ComponentMetricsPanelProps {
  onClose?: () => void
}

/**
 * Component Metrics Panel
 * Displays detailed metrics for each component in the architecture
 */
export const ComponentMetricsPanel: React.FC<ComponentMetricsPanelProps> = ({ onClose }) => {
  const [sortBy, setSortBy] = useState<'importance' | 'connectivity' | 'name'>('importance')
  const [filterImportance, setFilterImportance] = useState<string | null>(null)
  const { nodes, edges } = useArchitectureStore()

  const nodeMetrics = useMemo(() => {
    if (nodes.length === 0) return []

    let metrics = AnalyticsService.calculateNodeMetrics(nodes, edges)

    // Filter
    if (filterImportance) {
      metrics = metrics.filter((m) => m.importance === filterImportance)
    }

    // Sort
    switch (sortBy) {
      case 'connectivity':
        metrics.sort((a, b) => b.inDegree + b.outDegree - (a.inDegree + a.outDegree))
        break
      case 'name':
        metrics.sort((a, b) => a.label.localeCompare(b.label))
        break
      case 'importance':
      default:
        const importanceOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        metrics.sort(
          (a, b) => importanceOrder[a.importance] - importanceOrder[b.importance] || b.betweennessCentrality - a.betweennessCentrality,
        )
    }

    return metrics
  }, [nodes, edges, sortBy, filterImportance])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-750 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-emerald-600" />
              <h1 className="text-2xl font-bold">Component Metrics</h1>
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

        {/* Controls */}
        <div className="border-b border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="importance">Importance</option>
                <option value="connectivity">Connectivity</option>
                <option value="name">Name</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Filter by Importance</label>
              <select
                value={filterImportance || ''}
                onChange={(e) => setFilterImportance(e.target.value || null)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">All</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="ms-auto">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Showing {nodeMetrics.length} of {nodes.length}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {nodeMetrics.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400">No components to display</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-x-auto">
              {nodeMetrics.map((metric) => (
                <ComponentMetricRow key={metric.id} metric={metric} />
              ))}
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
        </div>
      </div>
    </div>
  )
}

interface ComponentMetricRowProps {
  metric: NodeMetrics
}

const ComponentMetricRow: React.FC<ComponentMetricRowProps> = ({ metric }) => {
  const importanceColors = {
    critical: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
    high: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
    low: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
  }

  const importanceBadgeColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  }

  const totalDegree = metric.inDegree + metric.outDegree

  return (
    <div
      className={`p-4 rounded border border-l-4 ${importanceColors[metric.importance]} space-y-3`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-grow">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">{metric.label}</h3>
            <span
              className={`${importanceBadgeColors[metric.importance]} text-white text-xs px-2 py-1 rounded-full font-semibold`}
            >
              {metric.importance.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Component ID: <code className="font-mono text-slate-500">{metric.id.slice(0, 8)}...</code>
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {metric.betweennessCentrality.toFixed(1)}%
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Centrality</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-3 pt-2 border-t border-slate-300/50 dark:border-slate-600/50">
        <MetricItem
          label="In Degree"
          value={metric.inDegree}
          icon={<TrendingDown className="w-4 h-4" />}
          color="text-blue-600"
        />
        <MetricItem
          label="Out Degree"
          value={metric.outDegree}
          icon={<TrendingUp className="w-4 h-4" />}
          color="text-green-600"
        />
        <MetricItem
          label="Total Links"
          value={totalDegree}
          icon={<Zap className="w-4 h-4" />}
          color="text-purple-600"
        />
        <MetricItem
          label="Avg Links"
          value={(totalDegree / 2).toFixed(1)}
          icon={<Activity className="w-4 h-4" />}
          color="text-slate-600 dark:text-slate-400"
        />
      </div>

      {/* Analysis */}
      {metric.importance === 'critical' && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          ⚠️ Critical component - Single point of failure. Consider redundancy.
        </div>
      )}

      {metric.outDegree === 0 && metric.inDegree > 2 && (
        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-xs text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
          🔴 Dead end detected - Receives requests but doesn't forward them.
        </div>
      )}

      {metric.inDegree + metric.outDegree > 8 && (
        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
          🟡 Highly coupled - Connected to 8+ other components.
        </div>
      )}
    </div>
  )
}

interface MetricItemProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value, icon, color }) => (
  <div className="flex items-center gap-2">
    <div className={`${color}`}>{icon}</div>
    <div>
      <p className="text-xs text-slate-600 dark:text-slate-400">{label}</p>
      <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
)
