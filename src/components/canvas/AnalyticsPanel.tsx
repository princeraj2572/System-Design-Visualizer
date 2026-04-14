/**
 * Analytics Panel Component
 */

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, TrendingUp, Activity, Zap } from 'lucide-react';

interface AnalyticsReport {
  projectId: string;
  projectName: string;
  summary: {
    totalNodes: number;
    totalEdges: number;
    totalGroups: number;
    nodeTypesUsed: string[];
    typeDistribution: Record<string, number>;
  };
  nodeMetrics: Array<{
    id: string;
    name: string;
    type: string;
    inDegree: number;
    outDegree: number;
    totalDegree: number;
    isHub: boolean;
    isSinglePointOfFailure: boolean;
  }>;
  circularDependencies: string[][];
  isolatedNodes: string[];
  hubs: string[];
  singlePointsOfFailure: string[];
  architectureHealth: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
}

interface AnalyticsPanelProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AnalyticsPanel({ projectId, isOpen, onClose }: AnalyticsPanelProps) {
  const [analytics, setAnalytics] = useState<AnalyticsReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/v1/projects/${projectId}/analytics`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const data = await response.json();
        setAnalytics(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [projectId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Architecture Analytics</h2>
              <p className="text-sm text-gray-600 mt-1">{analytics?.projectName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {analytics && !isLoading && (
            <>
              {/* Health Score */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Architecture Health Score</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">
                      {analytics.architectureHealth.score}
                      <span className="text-xl text-gray-600">/100</span>
                    </p>
                  </div>
                  <div className="w-24 h-24">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        strokeDasharray={`${2.83 * analytics.architectureHealth.score} 282.7`}
                        transform="rotate(-90 50 50)"
                      />
                      <text
                        x="50"
                        y="50"
                        textAnchor="middle"
                        dy="0.3em"
                        className="text-3xl font-bold"
                      >
                        {Math.round(analytics.architectureHealth.score)}%
                      </text>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-600 uppercase">Components</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {analytics.summary.totalNodes}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-600 uppercase">Connections</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {analytics.summary.totalEdges}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-600 uppercase">Component Types</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {analytics.summary.nodeTypesUsed.length}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-600 uppercase">Groups</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {analytics.summary.totalGroups}
                  </p>
                </div>
              </div>

              {/* Issues and Recommendations */}
              {analytics.architectureHealth.issues.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Issues Detected
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {analytics.architectureHealth.issues.map((issue, idx) => (
                      <li key={idx} className="text-sm text-yellow-800">
                        • {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analytics.architectureHealth.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Recommendations
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {analytics.architectureHealth.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-blue-800">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Critical Nodes */}
              {analytics.hubs.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-medium text-orange-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Bottleneck Components ({analytics.hubs.length})
                  </h3>
                  <div className="mt-3 space-y-2">
                    {analytics.nodeMetrics
                      .filter((m) => m.isHub)
                      .map((node) => (
                        <div
                          key={node.id}
                          className="bg-white px-3 py-2 rounded border border-orange-200 text-sm"
                        >
                          <p className="font-medium text-orange-900">{node.name}</p>
                          <p className="text-xs text-orange-700">
                            Type: {node.type} | Dependencies: {node.inDegree}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Single Points of Failure */}
              {analytics.singlePointsOfFailure.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Single Points of Failure ({analytics.singlePointsOfFailure.length})
                  </h3>
                  <div className="mt-3 space-y-2">
                    {analytics.nodeMetrics
                      .filter((m) => m.isSinglePointOfFailure)
                      .map((node) => (
                        <div
                          key={node.id}
                          className="bg-white px-3 py-2 rounded border border-red-200 text-sm"
                        >
                          <p className="font-medium text-red-900">{node.name}</p>
                          <p className="text-xs text-red-700">
                            Type: {node.type} | Incoming: {node.inDegree} connections
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Type Distribution */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Component Type Distribution
                </h3>
                <div className="mt-3 space-y-2">
                  {Object.entries(analytics.summary.typeDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full"
                              style={{
                                width: `${(count / analytics.summary.totalNodes) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {analytics.circularDependencies.length === 0 &&
                analytics.isolatedNodes.length === 0 &&
                analytics.singlePointsOfFailure.length === 0 && (
                  <div className="flex items-center justify-center gap-2 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800">Architecture looks good! No critical issues found.</p>
                  </div>
                )}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
