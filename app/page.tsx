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
    <div className="flex flex-col h-screen bg-gray-950">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <NodePalette onDragStart={onDragStart} />
        <ArchitectureCanvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}
