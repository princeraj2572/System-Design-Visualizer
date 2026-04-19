'use client';

/**
 * EXPERIMENTAL TEST PAGE
 * 
 * Compare and test two canvas implementations:
 * 1. Current ReactFlow CanvasPanel
 * 2. New Excalidraw-Inspired Canvas
 * 
 * Purpose: Evaluate which approach works better for System Design Visualizer
 * Branch: feature/excalidraw-canvas-experiment
 */

import React, { useState, useCallback } from 'react';
import { useArchitectureStore } from '@/store/architecture-store';
import CanvasPanel from '@/components/editor/canvas/CanvasPanel';
import Experimental_ExcalidrawCanvas from '@/components/editor/canvas/Experimental_ExcalidrawCanvas';
import { NodeChange, EdgeChange, Connection } from '@xyflow/react';

export default function ExcalidrawCanvasExperimentPage() {
  const [mode, setMode] = useState<'current' | 'excalidraw'>('current');
  const [showComparison, setShowComparison] = useState(false);

  // Get all store methods and state
  const nodes = useArchitectureStore((state) => state.nodes);
  const edges = useArchitectureStore((state) => state.edges);
  const selectedNodeId = useArchitectureStore((state) => state.selectedNodeId);
  const selectedEdgeId = useArchitectureStore((state) => state.selectedEdgeId);

  const onNodesChange = useArchitectureStore((state) => state.onNodesChange);
  const onEdgesChange = useArchitectureStore((state) => state.onEdgesChange);
  const onConnect = useArchitectureStore((state) => state.onConnect);
  const addNode = useArchitectureStore((state) => state.addNode);
  const setSelectedNode = useArchitectureStore((state) => state.setSelectedNode);
  const setSelectedEdge = useArchitectureStore((state) => state.setSelectedEdge);

  const handleAddNode = useCallback(
    (componentId: string, position: { x: number; y: number }) => {
      addNode(componentId, position);
    },
    [addNode]
  );

  // Comparison panel info
  const ComparisonInfo = () => (
    <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div>
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Current Implementation (ReactFlow)
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>✅ Proven, stable library</li>
          <li>✅ Good customization</li>
          <li>✅ TypeScript support</li>
          <li>⚠️ Limited aesthetic options</li>
          <li>⚠️ Built for node/link diagrams</li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Excalidraw-Inspired Canvas
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>✨ Hand-drawn aesthetic</li>
          <li>✨ Infinite canvas</li>
          <li>✨ Better shape rendering</li>
          <li>🔄 In-progress implementation</li>
          <li>🔄 Experimental features</li>
        </ul>
      </div>
    </div>
  );

  // Testing Checklist
  const TestingChecklist = () => (
    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-3">
        🧪 Testing Checklist
      </h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4" />
          <span>Drag & drop nodes</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4" />
          <span>Connect nodes</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4" />
          <span>Pan/zoom smooth</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4" />
          <span>Select multiple</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4" />
          <span>Delete nodes</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4" />
          <span>Properties panel</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4" />
          <span>Visual clarity</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4" />
          <span>Performance</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            🎨 Excalidraw Canvas Experiment
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Testing and comparing canvas implementations for System Design Visualizer
          </p>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setMode('current')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mode === 'current'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                }`}
              >
                📊 Current (ReactFlow)
              </button>
              <button
                onClick={() => setMode('excalidraw')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mode === 'excalidraw'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                }`}
              >
                ✨ Excalidraw (Experimental)
              </button>
            </div>

            <button
              onClick={() => setShowComparison(!showComparison)}
              className="px-4 py-2 rounded-lg font-medium bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
            >
              🔄 {showComparison ? 'Hide' : 'Show'} Comparison
            </button>

            <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">
              Branch: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                feature/excalidraw-canvas-experiment
              </code>
            </span>
          </div>
        </div>
      </div>

      {/* Comparison & Testing Info */}
      {showComparison && (
        <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800">
          <div className="max-w-6xl mx-auto space-y-4">
            <ComparisonInfo />
            <TestingChecklist />
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        {mode === 'current' ? (
          <div className="w-full h-full">
            <CanvasPanel
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectNode={setSelectedNode}
              onSelectEdge={setSelectedEdge}
              onAddNode={handleAddNode}
              showGrid={true}
              showMinimap={true}
            />
          </div>
        ) : (
          <div className="w-full h-full">
            <Experimental_ExcalidrawCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectNode={setSelectedNode}
              onSelectEdge={setSelectedEdge}
              onAddNode={handleAddNode}
              showGrid={true}
              showMinimap={true}
            />
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-6xl mx-auto">
          Currently testing:{' '}
          <span className="font-semibold">
            {mode === 'current'
              ? 'ReactFlow CanvasPanel - Stable & Proven'
              : 'Excalidraw-Inspired Canvas - Experimental'}
          </span>
          {' | Nodes: '}
          <span className="font-mono">{nodes.length}</span>
          {' | Edges: '}
          <span className="font-mono">{edges.length}</span>
        </div>
      </div>
    </div>
  );
}
