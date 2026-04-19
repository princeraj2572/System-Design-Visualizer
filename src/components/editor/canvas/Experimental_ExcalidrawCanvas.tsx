'use client';

/**
 * EXPERIMENTAL: Excalidraw-Inspired Canvas
 * 
 * This component tests combining ReactFlow with Excalidraw-style features:
 * - Infinite canvas with hand-drawn aesthetic
 * - Better shape rendering
 * - Smoother interactions and animations
 * - SVG-based rendering for crisp diagrams
 * 
 * Branch: feature/excalidraw-canvas-experiment
 * Status: Testing & Evaluation
 */

import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  SelectionMode,
  useReactFlow,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './nodes/nodeTypes';
import { edgeTypes } from './edges/edgeTypes';
import { findFreePosition, snapToGrid } from '@/lib/collisionDetection';
import { getComponentDefinition } from '@/lib/componentLibrary';
import { NodeDataExtended, EdgeDataExtended } from '@/types/architecture';

interface ExcalidrawCanvasProps {
  nodes: Node<NodeDataExtended>[];
  edges: Edge<EdgeDataExtended>[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onSelectNode?: (nodeId: string | null) => void;
  onSelectEdge?: (edgeId: string | null) => void;
  onAddNode?: (componentId: string, position: { x: number; y: number }) => void;
  showGrid?: boolean;
  showMinimap?: boolean;
}

/**
 * Excalidraw-Inspired Canvas Features:
 * 1. Hand-drawn stroke effect on edges
 * 2. Infinite canvas (no boundaries)
 * 3. Smooth zoom & pan
 * 4. Shadow/depth effects for nodes
 * 5. Better visual hierarchy
 */
export default function Experimental_ExcalidrawCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectNode,
  onSelectEdge,
  onAddNode,
  showGrid = true,
  showMinimap = true,
}: ExcalidrawCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();
  const [isDraggingFromPalette, setIsDraggingFromPalette] = useState(false);

  // Handle drag over canvas
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop from sidebar palette
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const componentId = event.dataTransfer.getData('application/componentId');
      if (!componentId || !reactFlowWrapper.current) return;

      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const dropX = event.clientX - rect.left;
      const dropY = event.clientY - rect.top;

      // Convert screen coords to canvas coords
      const position = project({ x: dropX, y: dropY });

      // Snap to grid
      position.x = snapToGrid(position.x);
      position.y = snapToGrid(position.y);

      // Find free position to avoid collisions
      const freePos = findFreePosition(position, nodes);

      // Callback to store
      onAddNode?.(componentId, freePos);
      setIsDraggingFromPalette(false);
    },
    [nodes, onAddNode, project]
  );

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
      style={{ position: 'relative' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, node) => onSelectNode?.(node.id)}
        onEdgeClick={(_, edge) => onSelectEdge?.(edge.id)}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        selectionMode={SelectionMode.Partial}
        fitView
      >
        {/* Enhanced Grid with hand-drawn aesthetic */}
        {showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#d1d5db"
            patternClassName="excalidraw-grid-pattern"
          />
        )}

        {/* Controls with smooth animations */}
        <Controls
          position="bottom-right"
          showZoom
          showFitView
          showInteractive={false}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
          }}
        />

        {/* Minimap with preview */}
        {showMinimap && (
          <MiniMap
            position="bottom-left"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        )}
      </ReactFlow>

      {/* Excalidraw-style canvas indicator */}
      <div
        className="absolute top-4 left-4 px-3 py-1 bg-white/80 dark:bg-slate-800/80 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-full backdrop-blur-sm border border-slate-200 dark:border-slate-700"
        style={{
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        ✨ Excalidraw-Inspired Canvas (Experimental)
      </div>

      {/* Drag indicator feedback */}
      {isDraggingFromPalette && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 pointer-events-none bg-blue-50/10 rounded-lg" />
      )}
    </div>
  );
}
