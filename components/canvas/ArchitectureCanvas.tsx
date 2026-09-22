'use client';

import { useCallback, useMemo, useRef, useState, type DragEvent, type MouseEvent as ReactMouseEvent } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  MarkerType,
  type ReactFlowInstance,
  type Node,
  type OnMove,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Copy, Trash2, ClipboardPaste, LayoutGrid } from 'lucide-react';
import type { NodeType } from '@/types';
import { useCanvasStore } from '@/store/useCanvasStore';
import CustomNode from '@/components/nodes/CustomNode';
import { NODE_CONFIG } from '@/components/nodes/nodeConfig';
import { ContextMenu, type ContextMenuItem } from '@/components/common/ContextMenu';

// Defined outside AND memoized inside to survive Fast Refresh without triggering RF warning
const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { stroke: '#6366f1', strokeWidth: 1.5 },
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#6366f1' },
};

type CanvasMenu =
  | { kind: 'pane'; x: number; y: number; flowX: number; flowY: number }
  | { kind: 'node'; x: number; y: number; nodeId: string };

export default function ArchitectureCanvas() {
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const didFitView = useRef(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [menu, setMenu] = useState<CanvasMenu | null>(null);
  const [zoomPct, setZoomPct] = useState(100);
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
    clipboard,
    copyNode,
    pasteNode,
    duplicateNode,
    deleteNode,
    autoLayout,
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

  // Highlight the chain connected to the hovered node; dim everything else.
  const connectedIds = useMemo(() => {
    if (!hoveredId) return null;
    const ids = new Set<string>([hoveredId]);
    edges.forEach((e) => {
      if (e.source === hoveredId) ids.add(e.target);
      if (e.target === hoveredId) ids.add(e.source);
    });
    return ids;
  }, [hoveredId, edges]);

  const displayNodes = useMemo(() => {
    if (!connectedIds) return nodes;
    return nodes.map((n) => ({
      ...n,
      style: { ...n.style, opacity: connectedIds.has(n.id) ? 1 : 0.3, transition: 'opacity 0.15s ease' },
    }));
  }, [nodes, connectedIds]);

  const displayEdges = useMemo(() => {
    if (!hoveredId) return edges;
    return edges.map((e) => ({
      ...e,
      style: {
        ...e.style,
        opacity: e.source === hoveredId || e.target === hoveredId ? 1 : 0.15,
        transition: 'opacity 0.15s ease',
      },
    }));
  }, [edges, hoveredId]);

  const onMove: OnMove = useCallback((_, viewport) => {
    setZoomPct(Math.round(viewport.zoom * 100));
  }, []);

  const onNodeContextMenu = useCallback((event: ReactMouseEvent, node: Node) => {
    event.preventDefault();
    setSelectedNode(node.id);
    setMenu({ kind: 'node', x: event.clientX, y: event.clientY, nodeId: node.id });
  }, [setSelectedNode]);

  const onPaneContextMenu = useCallback((event: ReactMouseEvent | MouseEvent) => {
    event.preventDefault();
    if (!rfInstance) return;
    const flowPos = (rfInstance as ReactFlowInstance & {
      screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number };
    }).screenToFlowPosition({ x: (event as ReactMouseEvent).clientX, y: (event as ReactMouseEvent).clientY });
    setMenu({ kind: 'pane', x: (event as ReactMouseEvent).clientX, y: (event as ReactMouseEvent).clientY, flowX: flowPos.x, flowY: flowPos.y });
  }, [rfInstance]);

  const menuItems: ContextMenuItem[] = useMemo(() => {
    if (!menu) return [];
    if (menu.kind === 'node') {
      const id = menu.nodeId;
      return [
        { label: 'Duplicate', icon: <Copy size={13}/>, onClick: () => duplicateNode(id) },
        { label: 'Copy', icon: <Copy size={13}/>, onClick: () => copyNode(id) },
        { label: 'Delete', icon: <Trash2 size={13}/>, danger: true, onClick: () => deleteNode(id) },
      ];
    }
    return [
      {
        label: 'Paste here',
        icon: <ClipboardPaste size={13}/>,
        disabled: !clipboard,
        onClick: () => pasteNode(menu.kind === 'pane' ? { x: menu.flowX, y: menu.flowY } : undefined),
      },
      { label: 'Auto Layout', icon: <LayoutGrid size={13}/>, onClick: () => autoLayout() },
    ];
  }, [menu, duplicateNode, copyNode, deleteNode, clipboard, pasteNode, autoLayout]);

  return (
    <div
      ref={dropRef}
      className="relative"
      style={{ flex: '1 1 0', minHeight: 0, minWidth: 0 }}
      id="architecture-canvas"
    >
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
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
        onPaneClick={() => { setSelectedNode(null); setMenu(null); }}
        onNodeDragStart={() => snapshot()}
        onNodeMouseEnter={(_, node) => setHoveredId(node.id)}
        onNodeMouseLeave={() => setHoveredId(null)}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onMove={onMove}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode="Delete"
        style={{
          width: '100%',
          height: '100%',
          background: isDark ? '#0a0a0a' : '#f8fafc',
        }}
      >
        <Background
          variant={BackgroundVariant.Lines}
          gap={24}
          size={0.5}
          color={isDark ? '#262626' : '#e5e7eb'}
        />
        <Controls
          showInteractive={false}
          style={{
            background: isDark ? '#18181b' : '#fff',
            border: `1px solid ${isDark ? '#27272a' : '#e5e7eb'}`,
            borderRadius: 10,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.08)',
          }}
        />
        <MiniMap
          nodeColor={(node) =>
            NODE_CONFIG[node.data?.nodeType as NodeType]?.accent ?? '#6b7280'
          }
          style={{
            background: isDark ? '#18181b' : '#fff',
            border: `1px solid ${isDark ? '#27272a' : '#e5e7eb'}`,
            borderRadius: 10,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.08)',
          }}
          maskColor={isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)'}
        />
      </ReactFlow>

      <div className="absolute bottom-[130px] left-3 px-2 py-1 rounded-md text-[10px] font-medium tabular-nums select-none pointer-events-none
        bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400">
        {zoomPct}%
      </div>

      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)}/>}

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/40 flex items-center justify-center">
              <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                <circle cx="6" cy="16" r="4" className="stroke-slate-300 dark:stroke-zinc-600" strokeWidth="1.5"/>
                <circle cx="26" cy="7" r="3.5" className="stroke-slate-300 dark:stroke-zinc-600" strokeWidth="1.5"/>
                <circle cx="26" cy="25" r="3.5" className="stroke-slate-300 dark:stroke-zinc-600" strokeWidth="1.5"/>
                <line x1="10" y1="14.5" x2="22.5" y2="8.5" className="stroke-slate-200 dark:stroke-zinc-700" strokeWidth="1.2"/>
                <line x1="10" y1="17.5" x2="22.5" y2="23.5" className="stroke-slate-200 dark:stroke-zinc-700" strokeWidth="1.2"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-400 dark:text-zinc-500">Start designing</p>
              <p className="text-[11px] text-slate-400 dark:text-zinc-600 mt-1">
                Drag components from the left panel
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
