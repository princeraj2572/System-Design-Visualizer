'use client'

import React, { useState, useMemo } from 'react'
import { GitBranch, AlertTriangle, CheckCircle } from 'lucide-react'
import { useArchitectureStore } from '@/store/architecture-store'
import { RelationshipAnalyzerService } from '@/lib/relationship-analyzer-service'

export interface DependencyTracerProps {
  onClose?: () => void
}

/**
 * Dependency Tracer Component
 * Visualizes and analyzes component dependencies and relationships
 */
export const DependencyTracer: React.FC<DependencyTracerProps> = ({ onClose }) => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'dependencies' | 'layers' | 'coupling'>('dependencies')
  const { nodes, edges } = useArchitectureStore()

  const analysis = useMemo(() => {
    if (nodes.length === 0) {
      return {
        dependencies: [],
        layers: new Map(),
        cycles: [],
        coupling: [],
        decouplingOpportunities: [],
        globalMetrics: null,
      }
    }

    const selected = selectedComponent || nodes[0]?.id
    const dependencies = RelationshipAnalyzerService.findDependencies(selected, edges)
    const layers = RelationshipAnalyzerService.analyzeDependencyLayers(nodes, edges)
    const cycles = RelationshipAnalyzerService.detectCircularDependencies(nodes, edges)
    const coupling = RelationshipAnalyzerService.identifyTightCoupling(edges)
    const decouplingOpportunities = RelationshipAnalyzerService.findDecouplingOpportunities(nodes, edges)
    const globalMetrics = RelationshipAnalyzerService.calculateGlobalDependencyMetrics(nodes, edges)

    return {
      dependencies,
      layers,
      cycles,
      coupling,
      decouplingOpportunities,
      globalMetrics,
    }
  }, [nodes, edges, selectedComponent])

  const nodeLabel = (id: string) => nodes.find((n) => n.id === id)?.metadata.name || id.slice(0, 8)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-750 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitBranch className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold">Dependency Tracer</h1>
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
            {/* Component Selector */}
            <div className="flex-grow">
              <label className="block text-sm font-semibold mb-2">Select Component</label>
              <select
                value={selectedComponent || ''}
                onChange={(e) => setSelectedComponent(e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">-- None --</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.metadata.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-semibold mb-2">View</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="dependencies">Dependencies</option>
                <option value="layers">Layers</option>
                <option value="coupling">Coupling</option>
              </select>
            </div>
          </div>

          {/* Global Metrics */}
          {analysis.globalMetrics && (
            <div className="grid grid-cols-5 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded">
              <MetricBadge label="Dependencies" value={analysis.globalMetrics.totalDependencies} />
              <MetricBadge
                label="Avg/Node"
                value={analysis.globalMetrics.averageDependenciesPerNode.toFixed(1)}
              />
              <MetricBadge label="Max" value={analysis.globalMetrics.maxDependencies} />
              <MetricBadge
                label="Circular"
                value={analysis.globalMetrics.circularDependencies}
                color="text-red-600"
              />
              <MetricBadge
                label="Tight Coupling"
                value={analysis.globalMetrics.tightCouplings}
                color="text-orange-600"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {viewMode === 'dependencies' && selectedComponent && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dependencies: {nodeLabel(selectedComponent)}</h3>

              {analysis.dependencies.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-400">No dependencies found</p>
              ) : (
                <div className="space-y-2">
                  {analysis.dependencies.map((dep, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{nodeLabel(dep.from)}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-semibold">{nodeLabel(dep.to)}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            dep.type === 'direct'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {dep.type === 'direct' ? 'Direct' : `Indirect (depth: ${dep.depth})`}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: dep.strength }).map((_, i) => (
                            <span
                              key={i}
                              className="w-2 h-2 rounded-full bg-purple-500"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {viewMode === 'layers' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dependency Layers</h3>

              {Array.from(
                Array.from(analysis.layers.entries()).reduce(
                  (acc, [node, layer]) => {
                    const key = layer
                    const existing = acc.get(key) || []
                    acc.set(key, [...existing, node])
                    return acc
                  },
                  new Map<number, string[]>(),
                ).entries(),
              )
                .sort(([a], [b]) => a - b)
                .map(([layer, nodeIds]) => (
                  <div key={layer} className="space-y-2">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                      Layer {layer}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {nodeIds.map((id) => (
                        <span
                          key={id}
                          className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-semibold"
                        >
                          {nodeLabel(id)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 Lower layers represent stable foundation layers. Dependencies should flow downward.
                </p>
              </div>
            </div>
          )}

          {viewMode === 'coupling' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Tight Couplings</h3>
                {analysis.coupling.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded text-green-700 dark:text-green-300">
                    <CheckCircle className="w-5 h-5" />
                    <span>✓ No problematic couplings detected</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analysis.coupling.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold">
                            {c.components.map((comp) => nodeLabel(comp)).join(' ↔ ')}
                          </span>
                          <span className="ml-auto text-xs font-bold bg-red-600 text-white px-2 py-1 rounded">
                            Strength: {c.strength}
                          </span>
                        </div>
                        <p className="text-xs text-red-700 dark:text-red-400">
                          Bidirectional dependency detected. Consider applying Dependency Inversion Principle.
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Circular Dependencies</h3>
                {analysis.cycles.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded text-green-700 dark:text-green-300">
                    <CheckCircle className="w-5 h-5" />
                    <span>✓ No circular dependencies detected</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analysis.cycles.map((cycle, idx) => (
                      <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                        <p className="font-semibold text-red-700 dark:text-red-300 text-sm">
                          {cycle.cycle.map((node) => nodeLabel(node)).join(' → ')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Decoupling Opportunities</h3>
                {analysis.decouplingOpportunities.map((opp, idx) => (
                  <div key={idx} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded mb-2">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">{opp}</p>
                  </div>
                ))}
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
        </div>
      </div>
    </div>
  )
}

interface MetricBadgeProps {
  label: string
  value: string | number
  color?: string
}

const MetricBadge: React.FC<MetricBadgeProps> = ({ label, value, color = 'text-slate-600' }) => (
  <div className="text-center">
    <p className={`text-xl font-bold ${color} dark:${color.replace('600', '400')}`}>{value}</p>
    <p className="text-xs text-slate-600 dark:text-slate-400">{label}</p>
  </div>
)
