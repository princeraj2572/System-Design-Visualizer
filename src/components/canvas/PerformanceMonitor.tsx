'use client';

import React, { useState } from 'react';
import { ChevronDown, Activity, Zap } from 'lucide-react';
import { PerformanceMetrics } from '@/hooks/usePerformanceOptimization';

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics & { edgeCullingPercentage: number };
  fps: number;
  isExpanded?: boolean;
}

/**
 * PerformanceMonitor - Displays real-time performance metrics
 * Shows node/edge culling, render times, and FPS
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  metrics,
  fps,
  isExpanded: defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getStatusColor = () => {
    if (fps >= 50) return 'text-green-600 bg-green-50';
    if (fps >= 30) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getPerformanceHealth = () => {
    if (metrics.averageRenderTime < 5 && fps >= 50) return { label: 'Excellent', color: 'text-green-600' };
    if (metrics.averageRenderTime < 10 && fps >= 30) return { label: 'Good', color: 'text-yellow-600' };
    return { label: 'Needs Optimization', color: 'text-red-600' };
  };

  const health = getPerformanceHealth();

  return (
    <div className="fixed top-4 left-4 z-40">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border-2 transition-all cursor-pointer ${
          isExpanded ? 'rounded-b-none border-b-0' : ''
        } ${getStatusColor()}`}
        aria-label="Performance metrics"
      >
        <Activity className="w-4 h-4" />
        <span className="text-sm font-semibold">{fps} FPS</span>
        <span className={`text-xs px-2 py-0.5 rounded bg-opacity-20 ${health.color}`}>{health.label}</span>
        <ChevronDown
          className="w-4 h-4 ml-1"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        />
      </button>

      {isExpanded && (
        <div className="absolute top-full left-0 right-0 bg-slate-900 text-white rounded-b-lg shadow-xl border-2 border-t-0 border-slate-700 p-4 w-80 rounded-bl-lg rounded-br-lg">
          {/* Culling Stats */}
          <div className="space-y-3 text-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-slate-300">
                  <Zap className="w-4 h-4" />
                  Viewport Culling
                </span>
                <span className="font-mono font-bold text-cyan-400">
                  {metrics.culledPercentage}% saved
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="text-xs text-slate-400 mb-1">Nodes</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-cyan-300">{metrics.visibleNodes}</span>
                    <span className="text-xs text-slate-500">/ {metrics.totalNodes}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-400 mb-1">Edges</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-cyan-300">{metrics.visibleEdges}</span>
                    <span className="text-xs text-slate-500">/ {metrics.totalEdges}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-400 mb-1">Edge Cull</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-cyan-300">{metrics.edgeCullingPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Render Time */}
            <div className="pt-2 border-t border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Render Time</span>
                <div className="flex gap-3 font-mono">
                  <span className="text-yellow-300">
                    Last: <span className="font-bold">{metrics.lastRenderTime.toFixed(2)}ms</span>
                  </span>
                  <span className="text-blue-300">
                    Avg: <span className="font-bold">{metrics.averageRenderTime.toFixed(2)}ms</span>
                  </span>
                </div>
              </div>
              <div className="w-full h-20 bg-slate-800 rounded border border-slate-700 relative">
                {/* Mini FPS chart placeholder */}
                <div className="absolute inset-0 flex items-end justify-around p-1 gap-0.5">
                  {[...Array(20)].map((_, i) => {
                    const height = Math.random() * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t opacity-80"
                        style={{ height: `${height}%`, minHeight: '2px' }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FPS Breakdown */}
            <div className="pt-2 border-t border-slate-700">
              <div className="flex items-center justify-between text-slate-300">
                <span>FPS Performance</span>
                <span className="font-mono font-bold text-lg text-green-400">{fps}</span>
              </div>
              <div className="mt-2 w-full bg-slate-800 rounded h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                  style={{ width: `${Math.min((fps / 60) * 100, 100)}%` }}
                />
              </div>
              <div className="text-xs text-slate-400 mt-1">Target: 60 FPS</div>
            </div>

            {/* Optimization Tips */}
            {metrics.averageRenderTime > 10 && (
              <div className="mt-3 p-2 bg-red-900 bg-opacity-30 border border-red-700 rounded text-xs text-red-200">
                ⚠️ Render time is high. Consider reducing node count or enabling aggressive culling.
              </div>
            )}
            {metrics.culledPercentage < 20 && metrics.totalNodes > 500 && (
              <div className="mt-3 p-2 bg-amber-900 bg-opacity-30 border border-amber-700 rounded text-xs text-amber-200">
                💡 Most nodes visible. Try zooming in or panning to enable more culling.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
