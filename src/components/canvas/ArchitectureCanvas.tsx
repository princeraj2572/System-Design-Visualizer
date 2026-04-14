'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Node,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useArchitectureStore } from '@/store/architecture-store';
import ArchitectureNode from '@/components/nodes/ArchitectureNode';
import ArchitectureEdge from '@/components/edges/ArchitectureEdge';

const nodeTypes = {
  architecture: ArchitectureNode,
};

const edgeTypes = {
  architecture: ArchitectureEdge,
};

export const ArchitectureCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { addNode } = useArchitectureStore();

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        source: connection.source || '',
        target: connection.target || '',
        label: 'connects to',
      };
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
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
            name: `${type.split('-').join(' ')}`,
            description: '',
            technology: '',
          },
        };

        setNodes((nds) => [...nds, newNode]);
        addNode({
          type: type as any,
          position: { x, y },
          metadata: {
            name: `${type.split('-').join(' ')}`,
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

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    // Node selected - can be updated to show properties
    console.log('Node selected:', node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    // Pane clicked - deselect
    console.log('Pane clicked');
  }, []);

  return (
    <div className="w-full h-full bg-slate-100">
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
    </div>
  );
};

export default ArchitectureCanvas;
