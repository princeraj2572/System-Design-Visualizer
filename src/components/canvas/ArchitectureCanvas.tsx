'use client';

import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge as ReactFlowEdge,
  Connection,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useArchitectureStore } from '@/store/architecture-store';
import ArchitectureNode from '@/components/nodes/ArchitectureNode';
import ArchitectureEdge from '@/components/edges/ArchitectureEdge';
import EdgeTypeDialog from '@/components/canvas/EdgeTypeDialog';
import ContextMenu from '@/components/canvas/ContextMenu';
import ZoomControls from '@/components/canvas/ZoomControls';
import SearchBar from '@/components/canvas/SearchBar';
import APIInfoPanel from '@/components/canvas/APIInfoPanel';
import { ExportDialog } from '@/components/canvas/ExportDialog';
import { canConnect } from '@/lib/connection-rules';

const nodeTypes = {
  architecture: ArchitectureNode,
};

const edgeTypes = {
  architecture: ArchitectureEdge,
};

export default function ArchitectureCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(
    null
  );
  const [showEdgeTypeDialog, setShowEdgeTypeDialog] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId?: string;
  } | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [apiInfoPanelOpen, setApiInfoPanelOpen] = useState(true);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // PHASE 1: Canvas enhancements
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize] = useState(20);
  const [showMinimap, setShowMinimap] = useState(true);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [minimapOffset, setMinimapOffset] = useState({ x: 1700, y: 80 });

  const { fitView } = useReactFlow();
  const {
    nodes: storeNodes,
    edges: storeEdges,
    addNode,
    addEdge: addEdgeToStore,
    selectNode,
    removeNode,
    selectedNode,
    selectedNodes,
    toggleSelection,
    selectAll,
    deleteSelectedNodes,
    duplicateSelectedNodes,
    copyToClipboard,
    pasteFromClipboard,
  } = useArchitectureStore();

  // Sync Zustand store to React Flow state
  useEffect(() => {
    const reactFlowNodes = storeNodes.map((node) => ({
      id: node.id,
      type: 'architecture',
      position: node.position,
      data: {
        type: node.type,
        name: node.metadata.name,
        description: node.metadata.description,
        technology: node.metadata.technology,
      },
    }));

    const reactFlowEdges = storeEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'architecture',
      label: edge.label,
      data: { type: edge.type },
    }));

    setNodes(reactFlowNodes);
    setEdges(reactFlowEdges);
  }, [storeNodes, storeEdges, setNodes, setEdges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const inputFocused = (e.target as HTMLElement).tagName === 'INPUT';

      // Delete selected node/edge
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode && !inputFocused) {
        e.preventDefault();
        if (window.confirm('Delete this component and its connections?')) {
          removeNode(selectedNode);
        }
      }

      // Toggle Grid (G key)
      if ((e.key === 'g' || e.key === 'G') && !inputFocused && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        setShowGrid((prev) => !prev);
      }

      // Toggle Snap-to-Grid (Shift+G)
      if ((e.key === 'g' || e.key === 'G') && e.shiftKey && !inputFocused && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        // Snap-to-grid feature can be extended here
        alert('Snap-to-Grid toggle (Coming soon)');
      }

      // Focus Mode (F key)
      if ((e.key === 'f' || e.key === 'F') && selectedNode && !inputFocused && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        setFocusNodeId(focusNodeId === selectedNode ? null : selectedNode);
      }

      // Toggle Minimap (M key)
      if ((e.key === 'm' || e.key === 'M') && !inputFocused && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        setShowMinimap((prev) => !prev);
      }

      // Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }

      // Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowExportDialog(true);
      }

      // Select all (Ctrl+A)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        selectAll();
      }

      // Copy (Ctrl+C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !inputFocused) {
        e.preventDefault();
        copyToClipboard();
      }

      // Paste (Ctrl+V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !inputFocused) {
        e.preventDefault();
        pasteFromClipboard();
      }

      // Duplicate (Ctrl+D)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && !inputFocused) {
        e.preventDefault();
        if (selectedNodes.length > 0) {
          duplicateSelectedNodes();
        } else if (selectedNode) {
          toggleSelection(selectedNode);
          duplicateSelectedNodes();
        }
      }

      // Bulk Delete (Delete/Backspace with multi-select)
      if ((e.key === 'Delete' || e.key === 'Backspace') && !inputFocused) {
        e.preventDefault();
        if (selectedNodes.length > 0) {
          if (window.confirm(`Delete ${selectedNodes.length} component(s) and their connections?`)) {
            deleteSelectedNodes();
          }
        } else if (selectedNode) {
          if (window.confirm('Delete this component and its connections?')) {
            removeNode(selectedNode);
          }
        }
      }

      // Zoom in
      if ((e.ctrlKey || e.metaKey) && e.key === '+') {
        e.preventDefault();
        setZoom((prev) => Math.min(prev + 0.2, 4));
      }

      // Zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoom((prev) => Math.max(prev - 0.2, 0.2));
      }

      // Fit view
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        fitView();
        setZoom(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, removeNode, fitView, focusNodeId, selectAll, copyToClipboard, pasteFromClipboard, duplicateSelectedNodes, deleteSelectedNodes, selectedNodes, toggleSelection]);

  // Validate connection
  const isValidConnection = useCallback(
    (connection: Connection): { valid: boolean; reason?: string } => {
      if (!connection.source || !connection.target) return { valid: false, reason: 'Invalid connection nodes' };
      if (connection.source === connection.target) return { valid: false, reason: 'Cannot connect to itself' };

      // Check for duplicate edges
      const hasDuplicate = edges.some(
        (edge) =>
          edge.source === connection.source && edge.target === connection.target
      );
      if (hasDuplicate) return { valid: false, reason: 'Connection already exists' };

      // Check if node types can connect
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);
      
      if (!sourceNode || !targetNode) return { valid: false, reason: 'Node not found' };

      const sourceType = sourceNode.data?.type;
      const targetType = targetNode.data?.type;

      if (!sourceType || !targetType) return { valid: false, reason: 'Node type not defined' };

      if (!canConnect(sourceType, targetType)) {
        return { 
          valid: false, 
          reason: `Cannot connect ${sourceType} to ${targetType}` 
        };
      }

      return { valid: true };
    },
    [edges, nodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const validation = isValidConnection(connection);
      
      if (!validation.valid) {
        console.warn('Invalid connection:', validation.reason);
        setToastMessage(validation.reason || 'Invalid connection');
        // Auto-hide toast after 3 seconds
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      // Show edge type selection dialog
      setPendingConnection(connection);
      setShowEdgeTypeDialog(true);
    },
    [isValidConnection]
  );

  const handleEdgeTypeSelected = useCallback(
    (edgeType: 'http' | 'grpc' | 'message-queue' | 'database' | 'event') => {
      if (!pendingConnection) return;

      const edgeTypeLabel: Record<string, string> = {
        http: 'HTTP/REST',
        grpc: 'gRPC',
        'message-queue': 'Message Queue',
        database: 'Database Query',
        event: 'Event Stream',
      };

      // Create edge object
      const newEdge: ReactFlowEdge & { data?: { type: string } } = {
        id: `edge-${Date.now()}`,
        source: pendingConnection.source || '',
        target: pendingConnection.target || '',
        type: 'architecture',
        label: edgeTypeLabel[edgeType],
        data: { type: edgeType },
      };

      // Add to React Flow state
      setEdges((eds) => [...eds, newEdge]);

      // Add to Zustand store immediately (for persistence)
      addEdgeToStore({
        source: pendingConnection.source || '',
        target: pendingConnection.target || '',
        label: edgeTypeLabel[edgeType],
        type: edgeType,
      });

      setPendingConnection(null);
      setShowEdgeTypeDialog(false);
    },
    [pendingConnection, setEdges, addEdgeToStore]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      try {
        const data = event.dataTransfer.getData('application/json');
        if (!data) return;

        const { type } = JSON.parse(data);
        const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const newNode: Node = {
          id: `node-${Date.now()}`,
          type: 'architecture',
          position: { x, y },
          data: {
            type,
            name: `${type
              .split('-')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}`,
            description: '',
            technology: '',
          },
        };

        setNodes((nds) => [...nds, newNode]);
        addNode({
          type: type as any,
          position: { x, y },
          metadata: {
            name: `${type
              .split('-')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}`,
            description: '',
            technology: '',
          },
        });
      } catch (error) {
        console.error('Error parsing dropped data:', error);
      }
    },
    [setNodes, addNode]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const x = e.clientX;
      const y = e.clientY;

      // Check if right-click is on a node
      const nodeElement = (e.target as HTMLElement).closest('[data-id]');
      const nodeId = nodeElement?.getAttribute('data-id');

      setContextMenu({
        x,
        y,
        nodeId: nodeId || undefined,
      });
    },
    []
  );

  return (
    <div 
      className="w-full h-full bg-slate-100 relative"
      onContextMenu={handleContextMenu}
      style={{
        backgroundImage: showGrid 
          ? `url("data:image/svg+xml,<svg width='${gridSize}' height='${gridSize}' xmlns='http://www.w3.org/2000/svg'><path d='M ${gridSize} 0 L 0 0 0 ${gridSize}' fill='none' stroke='%23cbd5e1' stroke-width='0.5'/></svg>")` 
          : undefined,
        backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : undefined,
        backgroundPosition: '0 0',
        backgroundRepeat: showGrid ? 'repeat' : 'no-repeat',
      }}
    >
      <ReactFlow
        nodes={focusNodeId ? nodes.filter(n => {
          if (n.id === focusNodeId) return true;
          return edges.some(e => (e.source === focusNodeId && e.target === n.id) || (e.target === focusNodeId && e.source === n.id));
        }) : nodes}
        edges={focusNodeId ? edges.filter(e => e.source === focusNodeId || e.target === focusNodeId) : edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md text-sm text-slate-600">
          Drag components from the left,{' '}
          <span className="font-semibold">connect them</span>, and design your architecture.
        </div>
      </ReactFlow>

      {/* Minimap */}
      {showMinimap && (
        <div
          className="absolute bg-white rounded-lg shadow-xl border border-slate-300 overflow-hidden hover:shadow-2xl transition-shadow"
          style={{
            width: '200px',
            height: '150px',
            left: `${minimapOffset.x}px`,
            top: `${minimapOffset.y}px`,
            cursor: 'grab',
            zIndex: 30,
          }}
          onMouseDown={(e) => {
            if (e.button === 0 && e.target === e.currentTarget) {
              e.preventDefault();
              const startX = e.clientX;
              const startY = e.clientY;
              const startOffsetX = minimapOffset.x;
              const startOffsetY = minimapOffset.y;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                setMinimapOffset({
                  x: startOffsetX + moveEvent.clientX - startX,
                  y: startOffsetY + moveEvent.clientY - startY,
                });
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }
          }}
        >
          {/* Minimap content */}
          <div className="w-full h-full bg-slate-50 relative border border-slate-200 p-1">
            {/* Simplified node visualization */}
            {nodes.map((node) => (
              <div
                key={node.id}
                className="absolute bg-cyan-400 rounded opacity-70 hover:opacity-100 transition-opacity"
                style={{
                  width: '6px',
                  height: '6px',
                  left: `${(node.position.x / 3000) * 190}px`,
                  top: `${(node.position.y / 2000) * 140}px`,
                  transform: 'translate(-3px, -3px)',
                }}
                title={node.data?.name}
              />
            ))}
            {/* Viewport indicator rect */}
            <div
              className="border-2 border-cyan-500 bg-cyan-50 opacity-30 pointer-events-none absolute"
              style={{
                width: `${(window.innerWidth / 4000) * 190}px`,
                height: `${(window.innerHeight / 2500) * 140}px`,
                top: '0',
                left: '0',
              }}
            />
          </div>
          {/* Close button */}
          <button
            onClick={() => setShowMinimap(false)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 z-40 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Focus Mode Indicator */}
      {focusNodeId && (
        <div className="absolute top-4 right-4 bg-amber-50 border-2 border-amber-300 rounded-lg px-4 py-2 text-sm text-amber-900 z-40 flex items-center gap-3 shadow-lg">
          <span className="font-semibold">🎯 Focus Mode</span>
          <span className="text-xs bg-amber-100 px-2 py-1 rounded">{nodes.find(n => n.id === focusNodeId)?.data?.name || focusNodeId}</span>
          <button
            onClick={() => setFocusNodeId(null)}
            className="ml-2 text-amber-700 hover:text-amber-900 font-bold hover:bg-amber-200 px-2 py-1 rounded transition-colors"
          >
            Exit (F)
          </button>
        </div>
      )}

      {/* Zoom Controls */}
      <ZoomControls
        zoom={zoom}
        onZoomIn={() => setZoom((prev) => Math.min(prev + 0.1, 4))}
        onZoomOut={() => setZoom((prev) => Math.max(prev - 0.1, 0.2))}
        onFitView={() => {
          fitView();
          setZoom(1);
        }}
      />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Search Bar */}
      {showSearch && <SearchBar onClose={() => setShowSearch(false)} />}

      {/* Edge Type Dialog */}
      <EdgeTypeDialog
        isOpen={showEdgeTypeDialog}
        onSelect={handleEdgeTypeSelected}
        onCancel={() => {
          setPendingConnection(null);
          setShowEdgeTypeDialog(false);
        }}
      />

      {/* Toast Notification for Invalid Connections */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
          <span className="text-lg">⚠️</span>
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* API Info Panel - Right Sidebar */}
      {apiInfoPanelOpen && selectedNode && (
        <APIInfoPanel
          selectedNodeId={selectedNode}
          selectedNodeType={nodes.find(n => n.id === selectedNode)?.data?.type}
          selectedNodeName={nodes.find(n => n.id === selectedNode)?.data?.name}
          onToggle={setApiInfoPanelOpen}
        />
      )}

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        nodes={nodes}
        edges={edges}
        projectName="System Architecture"
      />
    </div>
  );
}
