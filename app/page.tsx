'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, type DragEvent } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import NodePalette from '@/components/palette/NodePalette';
import PropertiesPanel from '@/components/panel/PropertiesPanel';
import Toolbar from '@/components/toolbar/Toolbar';
import type { NodeType } from '@/types';

// React Flow requires browser APIs — disable SSR for the canvas
const ArchitectureCanvas = dynamic(
  () => import('@/components/canvas/ArchitectureCanvas'),
  { ssr: false, loading: () => <div className="flex-1 bg-gray-950" /> }
);

function StatusBar() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  return (
    <div className="h-6 flex-shrink-0 bg-gray-900/80 border-t border-gray-800 flex items-center px-4 gap-4 select-none">
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-medium text-gray-600">
          <span className="text-gray-500">{nodes.length}</span> nodes
        </span>
        <span className="text-gray-800">·</span>
        <span className="text-[9px] font-medium text-gray-600">
          <span className="text-gray-500">{edges.length}</span> connections
        </span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3 text-[9px] font-medium text-gray-700">
        <span><kbd className="px-1 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-500 text-[8px]">Del</kbd> delete</span>
        <span><kbd className="px-1 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-500 text-[8px]">Ctrl Z</kbd> undo</span>
        <span>drag handles to connect</span>
      </div>
    </div>
  );
}

export default function Page() {
  const theme = useCanvasStore((s) => s.theme);

  // Sync Tailwind dark mode class with store theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const onDragStart = useCallback((event: DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <div className="flex flex-col h-screen" style={{ background: '#080d18' }}>
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <NodePalette onDragStart={onDragStart} />
        <ArchitectureCanvas />
        <PropertiesPanel />
      </div>
      <StatusBar />
    </div>
  );
}
