/**
 * CanvasPanel - ReactFlow wrapper with drag-drop and docking
 */

'use client';
import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  SelectionMode,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './nodes/nodeTypes';
import { edgeTypes } from './edges/edgeTypes';
import { findFreePosition, snapToGrid } from '@/lib/collisionDetection';
import { getComponentDefinition } from '@/lib/componentLibrary';
import { NodeDataExtended, EdgeDataExtended } from '@/types/architecture';
import { Node, Edge } from '@xyflow/react';

// Placeholder for store integration - will be connected to actual store
interface CanvasPanelProps {
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

export default function CanvasPanel({
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
}: CanvasPanelProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // ── Drop handler: fires when user drops a component from the sidebar
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const componentId = event.dataTransfer.getData('application/reactflow-component');
      if (!componentId || !onAddNode) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onAddNode(componentId, position);
    },
    [screenToFlowPosition, onAddNode]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full bg-gray-50 dark:bg-zinc-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) => onSelectNode?.(node.id)}
        onEdgeClick={(_, edge) => onSelectEdge?.(edge.id)}
        onPaneClick={() => {
          onSelectNode?.(null);
          onSelectEdge?.(null);
        }}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={['Backspace', 'Delete']}
        snapToGrid={true}
        snapGrid={[20, 20]}
        defaultEdgeOptions={{ type: 'smart', animated: false }}
        connectionRadius={40}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
      >
        {showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(128,128,128,0.25)"
          />
        )}
        <Controls showInteractive={false} position="bottom-right" />
        {showMinimap && (
          <MiniMap
            position="bottom-right"
            style={{ marginBottom: 48 }}
            nodeStrokeWidth={2}
            nodeColor={(node: any) => {
              const colorMap: Record<string, string> = {
                blue: '#3B82F6',
                green: '#22C55E',
                amber: '#F59E0B',
                purple: '#8B5CF6',
                coral: '#F97316',
                teal: '#14B8A6',
                gray: '#6B7280',
              };
              return colorMap[node.data?.color ?? 'gray'] ?? '#6B7280';
            }}
          />
        )}
      </ReactFlow>
    </div>
  );
}
