'use client';

import { useCallback, useRef, useState, type DragEvent } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { NodeType } from '@/types';
import { useCanvasStore } from '@/store/useCanvasStore';
import CustomNode from '@/components/nodes/CustomNode';
import { NODE_CONFIG } from '@/components/nodes/nodeConfig';

const nodeTypes = { custom: CustomNode };

const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { stroke: '#6b7280', strokeWidth: 1.5 },
  animated: false,
};

export default function ArchitectureCanvas() {
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
    snapshot,
    theme,
  } = useCanvasStore();

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type || !rfInstance) return;

      // project() converts screen coords → flow coords in reactflow v11
      const position = rfInstance.project({
        x: event.clientX - (dropRef.current?.getBoundingClientRect().left ?? 0),
        y: event.clientY - (dropRef.current?.getBoundingClientRect().top ?? 0),
      });

      addNode(type, position);
    },
    [rfInstance, addNode]
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const isDark = theme === 'dark';

  return (
    <div
      ref={dropRef}
      className="flex-1 h-full relative"
      id="architecture-canvas"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={() => setSelectedNode(null)}
        onNodeDragStart={() => snapshot()}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode="Delete"
        style={{
          background: isDark ? '#030712' : '#f9fafb',
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={isDark ? '#1f2937' : '#d1d5db'}
        />
        <Controls
          showInteractive={false}
          style={{
            background: isDark ? '#111827' : '#fff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          }}
        />
        <MiniMap
          nodeColor={(node) =>
            NODE_CONFIG[node.data?.nodeType as NodeType]?.accent ?? '#6b7280'
          }
          style={{
            background: isDark ? '#111827' : '#fff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          }}
          maskColor={isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)'}
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-4xl mb-3">🏗️</p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Drag components from the left panel onto the canvas
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-600 mt-1">
              Connect them by dragging between the handles on each node
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
