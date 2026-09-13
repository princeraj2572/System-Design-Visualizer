'use client';

import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react';
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

// Defined outside AND memoized inside to survive Fast Refresh without triggering RF warning
const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { stroke: '#6366f1', strokeWidth: 1.5 },
  animated: true,
};

export default function ArchitectureCanvas() {
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const didFitView = useRef(false);
  // useMemo prevents a new object reference on every Fast Refresh / hot reload
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

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

      // screenToFlowPosition takes raw clientX/Y — no manual bounds subtraction needed
      const position = (rfInstance as ReactFlowInstance & {
        screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number };
      }).screenToFlowPosition({ x: event.clientX, y: event.clientY });

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
      className="relative"
      style={{ flex: '1 1 0', minHeight: 0, minWidth: 0 }}
      id="architecture-canvas"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => {
          setRfInstance(instance);
          // Fit once on first load if nodes already exist (e.g. loaded project)
          if (!didFitView.current) {
            didFitView.current = true;
            setTimeout(() => instance.fitView({ padding: 0.25 }), 50);
          }
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={() => setSelectedNode(null)}
        onNodeDragStart={() => snapshot()}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode="Delete"
        style={{
          width: '100%',
          height: '100%',
          background: isDark ? '#080d1a' : '#f8fafc',
        }}
      >
        <Background
          variant={BackgroundVariant.Lines}
          gap={24}
          size={0.5}
          color={isDark ? '#1a2035' : '#e5e7eb'}
        />
        <Controls
          showInteractive={false}
          style={{
            background: isDark ? '#0d1424' : '#fff',
            border: `1px solid ${isDark ? '#1e2a40' : '#e5e7eb'}`,
            borderRadius: 10,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.08)',
          }}
        />
        <MiniMap
          nodeColor={(node) =>
            NODE_CONFIG[node.data?.nodeType as NodeType]?.accent ?? '#6b7280'
          }
          style={{
            background: isDark ? '#0d1424' : '#fff',
            border: `1px solid ${isDark ? '#1e2a40' : '#e5e7eb'}`,
            borderRadius: 10,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.08)',
          }}
          maskColor={isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)'}
          width={150}
          height={96}
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-800/60 border border-gray-700/40 flex items-center justify-center">
              <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                <circle cx="6" cy="16" r="4" stroke="#4b5563" strokeWidth="1.5"/>
                <circle cx="26" cy="7" r="3.5" stroke="#4b5563" strokeWidth="1.5"/>
                <circle cx="26" cy="25" r="3.5" stroke="#4b5563" strokeWidth="1.5"/>
                <line x1="10" y1="14.5" x2="22.5" y2="8.5" stroke="#374151" strokeWidth="1.2"/>
                <line x1="10" y1="17.5" x2="22.5" y2="23.5" stroke="#374151" strokeWidth="1.2"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-500">Start designing</p>
              <p className="text-[11px] text-gray-700 mt-1">
                Drag components from the left panel
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
