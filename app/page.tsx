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
  { ssr: false, loading: () => <div className="flex-1 bg-slate-100 dark:bg-slate-950" /> }
);

function StatusBar() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  return (
    <div className="h-6 flex-shrink-0 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center px-4 gap-4 select-none">
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
          <span className="text-slate-600 dark:text-slate-400">{nodes.length}</span> nodes
        </span>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
          <span className="text-slate-600 dark:text-slate-400">{edges.length}</span> connections
        </span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3 text-[9px] font-medium text-slate-400 dark:text-slate-600">
        <span><kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-500 text-[8px]">Del</kbd> delete</span>
        <span><kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-500 text-[8px]">Ctrl Z</kbd> undo</span>
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
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
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
