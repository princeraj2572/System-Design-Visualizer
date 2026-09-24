'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type MouseEvent as ReactMouseEvent } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  MarkerType,
  type ReactFlowInstance,
  type Node,
  type NodeChange,
  type OnMove,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Copy, Trash2, ClipboardPaste, LayoutGrid } from 'lucide-react';
import type { NodeType, ShapeNode as ShapeNodeType, FrameNode as FrameNodeType, ToolId } from '@/types';
import { useCanvasStore } from '@/store/useCanvasStore';
import CustomNode, { NODE_WIDTH, NODE_HEIGHT } from '@/components/nodes/CustomNode';
import ShapeNode from '@/components/nodes/ShapeNode';
import FrameNode, { FRAME_COLOR_PRESETS } from '@/components/nodes/FrameNode';
import DrawToolbar from '@/components/canvas/DrawToolbar';
import { NODE_CONFIG } from '@/components/nodes/nodeConfig';
import { ContextMenu, type ContextMenuItem } from '@/components/common/ContextMenu';
import { computeSnap, type SnapBox } from '@/components/canvas/snapping';
import { findContainingFrame, toRelative, type FrameBox, type DraggedBox } from '@/components/canvas/reparenting';
import { FRAME_MIN_WIDTH, FRAME_MIN_HEIGHT } from '@/components/nodes/FrameNode';

const MIN_DRAW_SIZE = 4;
const DEFAULT_FRAME_WIDTH = 240;
const DEFAULT_FRAME_HEIGHT = 160;

interface DrawState {
  tool: ToolId;
  start: { x: number; y: number };
  points: { x: number; y: number }[];
}

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
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [guides, setGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [drawPreview, setDrawPreview] = useState<DrawState | null>(null);
  const drawStateRef = useRef<DrawState | null>(null);
  // useMemo prevents a new object reference on every Fast Refresh / hot reload
  const nodeTypes = useMemo(() => ({ custom: CustomNode, shape: ShapeNode, frame: FrameNode }), []);

  const {
    nodes,
    edges,
    shapes,
    frames,
    onNodesChange,
    onEdgesChange,
    onShapesChange,
    onFramesChange,
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
    activeTool,
    setActiveTool,
    selectedShapeId,
    setSelectedShape,
    addShape,
    deleteShape,
    selectedFrameId,
    setSelectedFrame,
    addFrame,
    deleteFrame,
    duplicateFrame,
    reparentNode,
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
  const strokeColor = isDark ? '#a1a1aa' : '#334155';

  const toFlowPoint = useCallback((clientX: number, clientY: number) => {
    if (!rfInstance) return { x: 0, y: 0 };
    return (rfInstance as ReactFlowInstance & {
      screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number };
    }).screenToFlowPosition({ x: clientX, y: clientY });
  }, [rfInstance]);

  const finishDrawing = useCallback(() => {
    const state = drawStateRef.current;
    drawStateRef.current = null;
    setDrawPreview(null);
    document.removeEventListener('mousemove', onDrawMouseMoveRef.current!);
    document.removeEventListener('mouseup', onDrawMouseUpRef.current!);
    if (!state) return;

    const { tool, start, points } = state;
    if (tool === 'pencil') {
      if (points.length < 2) return;
      const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
      const minX = Math.min(...xs), minY = Math.min(...ys);
      const w = Math.max(...xs) - minX, h = Math.max(...ys) - minY;
      addShape({
        kind: 'pencil', position: { x: minX, y: minY },
        width: Math.max(w, MIN_DRAW_SIZE), height: Math.max(h, MIN_DRAW_SIZE),
        stroke: strokeColor,
        points: points.map((p) => ({ x: p.x - minX, y: p.y - minY })),
      });
    } else if (tool === 'line' || tool === 'arrow') {
      const end = points[points.length - 1] ?? start;
      const minX = Math.min(start.x, end.x), minY = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
      if (w < MIN_DRAW_SIZE && h < MIN_DRAW_SIZE) return;
      addShape({
        kind: tool, position: { x: minX, y: minY },
        width: Math.max(w, MIN_DRAW_SIZE), height: Math.max(h, MIN_DRAW_SIZE),
        stroke: strokeColor,
        points: [{ x: start.x - minX, y: start.y - minY }, { x: end.x - minX, y: end.y - minY }],
      });
    } else if (tool === 'rectangle' || tool === 'ellipse') {
      const end = points[points.length - 1] ?? start;
      const minX = Math.min(start.x, end.x), minY = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
      if (w < MIN_DRAW_SIZE || h < MIN_DRAW_SIZE) return;
      addShape({ kind: tool, position: { x: minX, y: minY }, width: w, height: h, stroke: strokeColor, fill: 'transparent' });
    } else if (tool === 'frame') {
      const end = points[points.length - 1] ?? start;
      const minX = Math.min(start.x, end.x), minY = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
      const isClick = w < MIN_DRAW_SIZE && h < MIN_DRAW_SIZE;
      addFrame({
        position: { x: minX, y: minY },
        width: isClick ? DEFAULT_FRAME_WIDTH : w,
        height: isClick ? DEFAULT_FRAME_HEIGHT : h,
        title: 'Frame',
        color: FRAME_COLOR_PRESETS[0],
      });
    }
    setActiveTool('select');
  }, [addShape, addFrame, setActiveTool, strokeColor]);

  const onDrawMouseMoveRef = useRef<(e: MouseEvent) => void>();
  const onDrawMouseUpRef = useRef<(e: MouseEvent) => void>();
  onDrawMouseMoveRef.current = (e: MouseEvent) => {
    if (!drawStateRef.current) return;
    const p = toFlowPoint(e.clientX, e.clientY);
    if (drawStateRef.current.tool === 'pencil') {
      drawStateRef.current.points.push(p);
    } else {
      drawStateRef.current.points = [p];
    }
    setDrawPreview({ ...drawStateRef.current, points: [...drawStateRef.current.points] });
  };
  onDrawMouseUpRef.current = () => finishDrawing();

  const onCanvasMouseDown = useCallback((e: ReactMouseEvent) => {
    if (activeTool === 'select') return;
    const target = e.target as HTMLElement;
    if (!target.classList.contains('react-flow__pane')) return;
    const start = toFlowPoint(e.clientX, e.clientY);

    if (activeTool === 'text') {
      snapshot();
      const id = addShape({ kind: 'text', position: start, width: 180, height: 32, stroke: strokeColor, text: '' });
      setActiveTool('select');
      setSelectedShape(id);
      return;
    }

    drawStateRef.current = { tool: activeTool, start, points: [start] };
    document.addEventListener('mousemove', onDrawMouseMoveRef.current!);
    document.addEventListener('mouseup', onDrawMouseUpRef.current!);
  }, [activeTool, toFlowPoint, addShape, setActiveTool, setSelectedShape, snapshot, strokeColor]);

  const drawPreviewNode: ShapeNodeType | null = useMemo(() => {
    if (!drawPreview) return null;
    const { tool, start, points } = drawPreview;
    if (tool === 'text') return null;
    const end = points[points.length - 1] ?? start;
    if (tool === 'pencil') {
      const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
      const minX = Math.min(...xs), minY = Math.min(...ys);
      return {
        id: '__draw-preview__', type: 'shape', position: { x: minX, y: minY },
        data: {
          kind: 'pencil', stroke: strokeColor, fill: 'transparent',
          width: Math.max(...xs) - minX, height: Math.max(...ys) - minY,
          points: points.map((p) => ({ x: p.x - minX, y: p.y - minY })),
        },
        style: { pointerEvents: 'none' },
      };
    }
    const minX = Math.min(start.x, end.x), minY = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
    const isLineLike = tool === 'line' || tool === 'arrow';
    return {
      id: '__draw-preview__', type: 'shape', position: { x: minX, y: minY },
      data: {
        kind: tool === 'ellipse' ? 'ellipse' : tool === 'rectangle' || tool === 'frame' ? 'rectangle' : (tool as 'line' | 'arrow'),
        stroke: strokeColor, fill: 'transparent',
        width: Math.max(w, MIN_DRAW_SIZE), height: Math.max(h, MIN_DRAW_SIZE),
        points: isLineLike ? [{ x: start.x - minX, y: start.y - minY }, { x: end.x - minX, y: end.y - minY }] : undefined,
      },
      style: { pointerEvents: 'none' },
    };
  }, [drawPreview, strokeColor]);

  const nodeAndShapeIds = useMemo(() => {
    const nodeIds = new Set(nodes.map((n) => n.id));
    const shapeIds = new Set(shapes.map((s) => s.id));
    const frameIds = new Set(frames.map((f) => f.id));
    return { nodeIds, shapeIds, frameIds };
  }, [nodes, shapes, frames]);

  const handleCombinedNodesChange = useCallback((changes: NodeChange[]) => {
    const nodeChanges = changes.filter((c) => 'id' in c && nodeAndShapeIds.nodeIds.has(c.id));
    const shapeChanges = changes.filter((c) => 'id' in c && nodeAndShapeIds.shapeIds.has(c.id));
    const frameChangesAll = changes.filter((c) => 'id' in c && nodeAndShapeIds.frameIds.has(c.id));
    const frameRemovals = frameChangesAll.filter((c) => c.type === 'remove');
    const frameChanges = frameChangesAll.filter((c) => c.type !== 'remove');
    frameRemovals.forEach((c) => deleteFrame((c as { id: string }).id));

    let sawDrag = false;
    const positionableChanges = [...nodeChanges, ...frameChanges];
    for (const change of positionableChanges) {
      if (change.type !== 'position' || !change.dragging || !change.position || !rfInstance) continue;
      sawDrag = true;

      const draggedRf = rfInstance.getNode(change.id);
      const isDraggedFrame = nodeAndShapeIds.frameIds.has(change.id);
      const draggedSize = isDraggedFrame
        ? {
            width: frames.find((f) => f.id === change.id)?.data.width ?? NODE_WIDTH,
            height: frames.find((f) => f.id === change.id)?.data.height ?? NODE_HEIGHT,
          }
        : { width: NODE_WIDTH, height: NODE_HEIGHT };
      const parentId = draggedRf?.parentNode;
      const parentRf = parentId ? rfInstance.getNode(parentId) : undefined;
      const parentAbs = parentRf ? (parentRf.positionAbsolute ?? parentRf.position) : { x: 0, y: 0 };
      const draggedAbsBox: SnapBox = {
        left: parentAbs.x + change.position.x,
        top: parentAbs.y + change.position.y,
        width: draggedSize.width,
        height: draggedSize.height,
      };

      const others: SnapBox[] = [...nodes, ...frames]
        .filter((item) => item.id !== change.id)
        .map((item) => {
          const rf = rfInstance.getNode(item.id);
          const abs = rf?.positionAbsolute ?? item.position;
          const size = nodeAndShapeIds.frameIds.has(item.id)
            ? (item as FrameNodeType).data
            : { width: NODE_WIDTH, height: NODE_HEIGHT };
          return { left: abs.x, top: abs.y, width: size.width, height: size.height };
        });

      const snapped = computeSnap(draggedAbsBox, others);
      change.position = { x: snapped.x - parentAbs.x, y: snapped.y - parentAbs.y };
      setGuides({ x: snapped.guideX, y: snapped.guideY });
    }
    if (!sawDrag && (guides.x !== null || guides.y !== null)) {
      setGuides({ x: null, y: null });
    }

    if (nodeChanges.length) onNodesChange(nodeChanges);
    if (shapeChanges.length) onShapesChange(shapeChanges);
    if (frameChanges.length) onFramesChange(frameChanges);
  }, [nodeAndShapeIds, onNodesChange, onShapesChange, onFramesChange, deleteFrame, nodes, frames, guides, rfInstance]);

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

  const onMove: OnMove = useCallback((_, vp) => {
    setZoomPct(Math.round(vp.zoom * 100));
    setViewport(vp);
  }, []);

  const onNodeDragStop = useCallback((_event: ReactMouseEvent, node: Node) => {
    setGuides({ x: null, y: null });
    if (!rfInstance) return;
    const isFrame = nodeAndShapeIds.frameIds.has(node.id);
    if (!isFrame && !nodeAndShapeIds.nodeIds.has(node.id)) return; // shapes don't participate in framing

    const rfNode = rfInstance.getNode(node.id);
    if (!rfNode) return;

    const size = isFrame
      ? {
          width: frames.find((f) => f.id === node.id)?.data.width ?? FRAME_MIN_WIDTH,
          height: frames.find((f) => f.id === node.id)?.data.height ?? FRAME_MIN_HEIGHT,
        }
      : { width: NODE_WIDTH, height: NODE_HEIGHT };
    const abs = rfNode.positionAbsolute ?? rfNode.position;
    const dragged: DraggedBox = { id: node.id, left: abs.x, top: abs.y, width: size.width, height: size.height };

    const frameBoxes: FrameBox[] = frames.map((f) => {
      const fRfNode = rfInstance.getNode(f.id);
      const fAbs = fRfNode?.positionAbsolute ?? f.position;
      return { id: f.id, parentId: f.parentNode ?? null, left: fAbs.x, top: fAbs.y, width: f.data.width, height: f.data.height };
    });

    const targetId = findContainingFrame(dragged, frameBoxes);
    const currentParentId = rfNode.parentNode ?? null;
    if (targetId === currentParentId) return;

    if (targetId === null) {
      reparentNode(node.id, null, { x: abs.x, y: abs.y });
      return;
    }
    const targetFrame = frameBoxes.find((f) => f.id === targetId)!;
    const relative = toRelative({ x: abs.x, y: abs.y }, { x: targetFrame.left, y: targetFrame.top });
    reparentNode(node.id, targetId, relative);
  }, [rfInstance, nodeAndShapeIds, frames, reparentNode]);

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

  const shapesForDisplay = useMemo(
    () => shapes.map((s) => ({ ...s, selected: s.id === selectedShapeId })),
    [shapes, selectedShapeId]
  );

  const framesForDisplay = useMemo(
    () => frames.map((f) => ({ ...f, selected: f.id === selectedFrameId })),
    [frames, selectedFrameId]
  );

  // React Flow requires a parent node to appear before its children in the
  // nodes array; sort by nesting depth so that holds for nested frames too.
  const orderedFrames = useMemo(() => {
    const byId = new Map(framesForDisplay.map((f) => [f.id, f]));
    const depthOf = (id: string): number => {
      let depth = 0;
      let cursor = byId.get(id)?.parentNode;
      while (cursor) {
        depth++;
        cursor = byId.get(cursor)?.parentNode;
      }
      return depth;
    };
    return [...framesForDisplay].sort((a, b) => depthOf(a.id) - depthOf(b.id));
  }, [framesForDisplay]);

  const allNodes = useMemo(
    () => [...orderedFrames, ...displayNodes, ...shapesForDisplay, ...(drawPreviewNode ? [drawPreviewNode] : [])],
    [orderedFrames, displayNodes, shapesForDisplay, drawPreviewNode]
  );

  const isDrawing = activeTool !== 'select';

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeTool !== 'select') {
        drawStateRef.current = null;
        setDrawPreview(null);
        if (onDrawMouseMoveRef.current) document.removeEventListener('mousemove', onDrawMouseMoveRef.current);
        if (onDrawMouseUpRef.current) document.removeEventListener('mouseup', onDrawMouseUpRef.current);
        setActiveTool('select');
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeTool, setActiveTool]);

  return (
    <div
      ref={dropRef}
      className="relative"
      style={{ flex: '1 1 0', minHeight: 0, minWidth: 0 }}
      id="architecture-canvas"
    >
      <ReactFlow
        nodes={allNodes}
        edges={displayEdges}
        onNodesChange={handleCombinedNodesChange}
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
        onMouseDown={onCanvasMouseDown}
        onPaneClick={() => { setSelectedNode(null); setSelectedShape(null); setSelectedFrame(null); setMenu(null); }}
        onNodeDragStart={() => snapshot()}
        onNodeDragStop={onNodeDragStop}
        onNodeMouseEnter={(_, node) => setHoveredId(node.id)}
        onNodeMouseLeave={() => setHoveredId(null)}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onMove={onMove}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        panOnDrag={!isDrawing}
        nodesDraggable={!isDrawing}
        elementsSelectable={!isDrawing}
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode="Delete"
        style={{
          width: '100%',
          height: '100%',
          background: isDark ? '#0a0a0a' : '#f8fafc',
          cursor: isDrawing ? 'crosshair' : undefined,
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

      {guides.x !== null && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-10"
          style={{ left: guides.x * viewport.zoom + viewport.x, width: 1, background: '#6366f1', boxShadow: '0 0 0 0.5px #6366f1' }}
        />
      )}
      {guides.y !== null && (
        <div
          className="absolute left-0 right-0 pointer-events-none z-10"
          style={{ top: guides.y * viewport.zoom + viewport.y, height: 1, background: '#6366f1', boxShadow: '0 0 0 0.5px #6366f1' }}
        />
      )}

      <DrawToolbar/>

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
